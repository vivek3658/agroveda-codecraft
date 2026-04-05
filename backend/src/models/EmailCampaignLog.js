const mongoose = require('mongoose');

const emailCampaignLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  template: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'EmailTemplate',
    required: true,
    index: true
  },
  campaignDate: {
    type: Date,
    required: true,
    index: true
  },
  status: {
    type: String,
    enum: ['queued', 'sent', 'failed', 'skipped'],
    required: true,
    index: true
  },
  subject: String,
  recipientEmail: String,
  personalizedData: mongoose.Schema.Types.Mixed,
  errorMessage: String,
  providerMessageId: String,
  sentAt: Date
}, { timestamps: true });

module.exports = mongoose.model('EmailCampaignLog', emailCampaignLogSchema);
