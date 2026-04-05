const mongoose = require('mongoose');

const sponsoredProductSchema = new mongoose.Schema({
  brand: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SponsoredBrand',
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: ['fertilizer', 'pesticide', 'seed', 'tool', 'irrigation', 'machinery', 'other'],
    index: true
  },
  cropTags: [{
    type: String,
    trim: true
  }],
  soilTags: [{
    type: String,
    trim: true
  }],
  seasonTags: [{
    type: String,
    trim: true
  }],
  description: {
    type: String,
    required: true
  },
  benefits: [{
    type: String,
    trim: true
  }],
  targetAudience: {
    type: String,
    enum: ['farmer', 'consumer', 'both'],
    default: 'farmer'
  },
  productUrl: {
    type: String,
    trim: true
  },
  imageUrl: {
    type: String,
    trim: true
  },
  ctaLabel: {
    type: String,
    trim: true,
    default: 'Learn More'
  },
  priority: {
    type: Number,
    default: 0
  },
  isSponsored: {
    type: Boolean,
    default: true
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  }
}, { timestamps: true });

sponsoredProductSchema.index({ brand: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('SponsoredProduct', sponsoredProductSchema);
