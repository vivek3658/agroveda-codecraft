const User = require('../models/User');
const Crop = require('../models/Crop');
const Profile = require('../models/Profile');
const EmailTemplate = require('../models/EmailTemplate');
const EmailCampaignLog = require('../models/EmailCampaignLog');
const SponsoredProduct = require('../models/SponsoredProduct');
const FarmerRecommendationPreference = require('../models/FarmerRecommendationPreference');
const { getMailer } = require('../config/mailer');
const config = require('../config');

const cropAdviceRules = {
  tomato: {
    fertilizers: ['Use balanced NPK feed this week for steady fruit growth.'],
    cropCare: ['Inspect leaves for early blight after heavy watering.']
  },
  wheat: {
    fertilizers: ['Monitor nitrogen schedule during active vegetative growth.'],
    cropCare: ['Check field moisture and lodging risk before harvest.']
  },
  potato: {
    fertilizers: ['Apply potash-rich support where tuber development is active.'],
    cropCare: ['Watch for fungal pressure in humid storage and field conditions.']
  }
};

const pickAdviceForCrops = (cropNames = []) => {
  const fertilizers = [];
  const cropCare = [];

  for (const cropName of cropNames) {
    const advice = cropAdviceRules[cropName.toLowerCase()];
    if (!advice) {
      continue;
    }

    fertilizers.push(...advice.fertilizers);
    cropCare.push(...advice.cropCare);
  }

  if (fertilizers.length === 0) {
    fertilizers.push('Review soil health and choose fertilizer mixes based on crop stage.');
  }

  if (cropCare.length === 0) {
    cropCare.push('Monitor irrigation, pest signs, and harvest timing for active listings.');
  }

  return {
    fertilizers: Array.from(new Set(fertilizers)).slice(0, 3),
    cropCare: Array.from(new Set(cropCare)).slice(0, 3)
  };
};

const renderTemplate = (template, data) => {
  const replacements = {
    '{{farmerName}}': data.farmerName,
    '{{cropNames}}': data.cropNames.join(', '),
    '{{fertilizerSuggestions}}': data.fertilizerSuggestions.map((item) => `<li>${item}</li>`).join(''),
    '{{cropCareSuggestions}}': data.cropCareSuggestions.map((item) => `<li>${item}</li>`).join(''),
    '{{sponsoredProducts}}': data.sponsoredProducts.map((item) => `<li><strong>${item.name}</strong> by ${item.brandName} - <a href="${item.productUrl || '#'}">${item.ctaLabel || 'View Product'}</a></li>`).join('')
  };

  let subject = template.subjectTemplate;
  let html = template.htmlTemplate;

  Object.entries(replacements).forEach(([key, value]) => {
    subject = subject.split(key).join(value);
    html = html.split(key).join(value);
  });

  return { subject, html };
};

const getActiveTemplate = async () => {
  let template = await EmailTemplate.findOne({
    key: 'daily_farmer_digest',
    isActive: true
  });

  if (!template) {
    template = await EmailTemplate.create({
      key: 'daily_farmer_digest',
      name: 'Daily Farmer Digest',
      templateType: 'daily_farmer_recommendation',
      subjectTemplate: 'AgroVeda daily recommendations for {{farmerName}}',
      htmlTemplate: `
        <h2>Hello {{farmerName}}</h2>
        <p>Your active crops: {{cropNames}}</p>
        <h3>Fertilizer suggestions</h3>
        <ul>{{fertilizerSuggestions}}</ul>
        <h3>Crop care suggestions</h3>
        <ul>{{cropCareSuggestions}}</ul>
        <h3>Sponsored products</h3>
        <ul>{{sponsoredProducts}}</ul>
      `
    });
  }

  return template;
};

const buildFarmerEmailPayload = async (farmer) => {
  const [profile, crops, preference] = await Promise.all([
    Profile.findOne({ user: farmer._id }),
    Crop.find({ farmer: farmer._id, isAvailable: true }),
    FarmerRecommendationPreference.findOne({ farmer: farmer._id })
  ]);

  const cropNames = crops.map((crop) => crop.name);
  const { fertilizers, cropCare } = pickAdviceForCrops(cropNames);

  const sponsoredProducts = await SponsoredProduct.find({
    isActive: true,
    targetAudience: { $in: ['farmer', 'both'] },
    ...(cropNames.length > 0 ? { cropTags: { $in: cropNames } } : {})
  })
    .populate('brand', 'name')
    .sort({ priority: -1, createdAt: -1 })
    .limit(3);

  return {
    farmerName: farmer.name,
    farmerEmail: farmer.email,
    cropNames,
    fertilizerSuggestions: fertilizers,
    cropCareSuggestions: cropCare,
    sponsoredProducts: sponsoredProducts.map((item) => ({
      name: item.name,
      brandName: item.brand?.name || '',
      productUrl: item.productUrl,
      ctaLabel: item.ctaLabel
    })),
    city: profile?.city || '',
    preference
  };
};

const sendDailyFarmerRecommendations = async () => {
  const farmers = await User.find({
    role: 'farmer',
    status: 'active'
  });

  const template = await getActiveTemplate();
  const transporter = getMailer();
  const today = new Date();

  for (const farmer of farmers) {
    const preference = await FarmerRecommendationPreference.findOne({ farmer: farmer._id });
    if (preference && preference.emailOptIn === false) {
      await EmailCampaignLog.create({
        user: farmer._id,
        template: template._id,
        campaignDate: today,
        status: 'skipped',
        subject: template.subjectTemplate,
        recipientEmail: farmer.email,
        personalizedData: { reason: 'email_opt_out' }
      });
      continue;
    }

    const payload = await buildFarmerEmailPayload(farmer);
    const rendered = renderTemplate(template, payload);

    try {
      const result = await transporter.sendMail({
        from: config.emailFrom,
        to: farmer.email,
        subject: rendered.subject,
        html: rendered.html
      });

      await EmailCampaignLog.create({
        user: farmer._id,
        template: template._id,
        campaignDate: today,
        status: 'sent',
        subject: rendered.subject,
        recipientEmail: farmer.email,
        personalizedData: payload,
        providerMessageId: result.messageId,
        sentAt: new Date()
      });
    } catch (error) {
      await EmailCampaignLog.create({
        user: farmer._id,
        template: template._id,
        campaignDate: today,
        status: 'failed',
        subject: rendered.subject,
        recipientEmail: farmer.email,
        personalizedData: payload,
        errorMessage: error.message
      });
    }
  }
};

module.exports = {
  sendDailyFarmerRecommendations,
  buildFarmerEmailPayload
};
