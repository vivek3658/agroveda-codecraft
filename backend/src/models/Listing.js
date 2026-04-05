const mongoose = require('mongoose');

const listingSchema = new mongoose.Schema({
  crop: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Crop',
    required: true,
    unique: true
  },
  farmer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  sellerType: {
    type: String,
    enum: ['farmer', 'consumer'],
    default: 'farmer'
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Grains', 'Vegetables', 'Fruits', 'Legumes', 'Spices', 'Other']
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  unit: {
    type: String,
    required: true,
    default: 'kg'
  },
  quantity: {
    type: Number,
    required: true,
    min: 0
  },
  location: {
    type: String,
    required: true
  },
  image: {
    type: String,
    default: ''
  },
  images: [{
    type: String
  }],
  status: {
    type: String,
    enum: ['draft', 'published', 'paused', 'sold_out'],
    default: 'published'
  },
  rating: {
    type: Number,
    default: 0
  },
  reviews: {
    type: Number,
    default: 0
  },
  totalSalesQuantity: {
    type: Number,
    default: 0
  },
  totalRevenue: {
    type: Number,
    default: 0
  },
  lastSyncedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

listingSchema.index({ name: 'text', description: 'text', location: 'text' });
listingSchema.index({ category: 1, status: 1 });
listingSchema.index({ price: 1 });
listingSchema.index({ farmer: 1, status: 1 });

module.exports = mongoose.model('Listing', listingSchema);
