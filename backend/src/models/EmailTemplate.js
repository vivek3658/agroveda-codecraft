const mongoose = require('mongoose');

const emailTemplateSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  subjectTemplate: {
    type: String,
    required: true
  },
  htmlTemplate: {
    type: String,
    required: true
  },
  textTemplate: {
    type: String
  },
  templateType: {
    type: String,
    required: true,
    enum: ['daily_farmer_recommendation', 'campaign', 'transactional'],
    index: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

module.exports = mongoose.model('EmailTemplate', emailTemplateSchema);
