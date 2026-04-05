const SponsoredBrand = require('../models/SponsoredBrand');
const SponsoredProduct = require('../models/SponsoredProduct');
const EmailTemplate = require('../models/EmailTemplate');
const EmailCampaignLog = require('../models/EmailCampaignLog');
const CourseResource = require('../models/CourseResource');
const StorageLocation = require('../models/StorageLocation');

const slugify = (value = '') => value
  .toLowerCase()
  .trim()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '');

const createBrand = async (payload) => SponsoredBrand.create({
  ...payload,
  slug: payload.slug || slugify(payload.name)
});

const listBrands = async () => SponsoredBrand.find().sort({ createdAt: -1 });

const updateBrand = async (brandId, payload) => {
  const update = { ...payload };
  if (payload.name && !payload.slug) {
    update.slug = slugify(payload.name);
  }

  const brand = await SponsoredBrand.findByIdAndUpdate(brandId, update, {
    new: true,
    runValidators: true
  });

  if (!brand) {
    throw new Error('Sponsored brand not found');
  }

  return brand;
};

const createSponsoredProduct = async (payload) => SponsoredProduct.create({
  brand: payload.brandId,
  name: payload.name,
  category: payload.category,
  cropTags: payload.cropTags || [],
  soilTags: payload.soilTags || [],
  seasonTags: payload.seasonTags || [],
  description: payload.description,
  benefits: payload.benefits || [],
  targetAudience: payload.targetAudience || 'farmer',
  productUrl: payload.productUrl,
  imageUrl: payload.imageUrl,
  ctaLabel: payload.ctaLabel,
  priority: payload.priority || 0,
  isSponsored: payload.isSponsored !== false,
  isActive: payload.isActive !== false
});

const listSponsoredProducts = async () => SponsoredProduct.find()
  .populate('brand', 'name slug')
  .sort({ priority: -1, createdAt: -1 });

const updateSponsoredProduct = async (productId, payload) => {
  const update = { ...payload };
  if (payload.brandId) {
    update.brand = payload.brandId;
    delete update.brandId;
  }

  const product = await SponsoredProduct.findByIdAndUpdate(productId, update, {
    new: true,
    runValidators: true
  }).populate('brand', 'name slug');

  if (!product) {
    throw new Error('Sponsored product not found');
  }

  return product;
};

const changeSponsoredProductStatus = async (productId, isActive) => {
  const product = await SponsoredProduct.findByIdAndUpdate(productId, { isActive }, {
    new: true,
    runValidators: true
  }).populate('brand', 'name slug');

  if (!product) {
    throw new Error('Sponsored product not found');
  }

  return product;
};

const createEmailTemplate = async (payload) => EmailTemplate.create(payload);

const listEmailTemplates = async () => EmailTemplate.find().sort({ createdAt: -1 });

const updateEmailTemplate = async (templateId, payload) => {
  const template = await EmailTemplate.findByIdAndUpdate(templateId, payload, {
    new: true,
    runValidators: true
  });

  if (!template) {
    throw new Error('Email template not found');
  }

  return template;
};

const listEmailLogs = async () => EmailCampaignLog.find()
  .populate('user', 'name email role')
  .populate('template', 'key name')
  .sort({ createdAt: -1 })
  .limit(200);

const createCourseResource = async (payload) => CourseResource.create(payload);

const createStorageLocation = async (payload) => StorageLocation.create(payload);

module.exports = {
  createBrand,
  listBrands,
  updateBrand,
  createSponsoredProduct,
  listSponsoredProducts,
  updateSponsoredProduct,
  changeSponsoredProductStatus,
  createEmailTemplate,
  listEmailTemplates,
  updateEmailTemplate,
  listEmailLogs,
  createCourseResource,
  createStorageLocation
};
