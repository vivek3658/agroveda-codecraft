const mongoose = require('mongoose');

const farmerRecommendationPreferenceSchema = new mongoose.Schema({
  farmer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true
  },
  emailOptIn: {
    type: Boolean,
    default: true
  },
  preferredCategories: [{
    type: String,
    trim: true
  }],
  preferredSendHour: {
    type: Number,
    min: 0,
    max: 23,
    default: 7
  },
  locale: {
    type: String,
    default: 'en-IN'
  }
}, { timestamps: true });

module.exports = mongoose.model('FarmerRecommendationPreference', farmerRecommendationPreferenceSchema);
