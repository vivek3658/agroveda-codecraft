const mongoose = require('mongoose');

const cropSchema = new mongoose.Schema({
  farmer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Crop name is required'],
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['Grains', 'Vegetables', 'Fruits', 'Legumes', 'Spices', 'Other'],
    default: 'Other'
  },
  description: {
    type: String,
    required: [true, 'Description is required']
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [0, 'Quantity cannot be negative']
  },
  unit: {
    type: String,
    required: [true, 'Unit (e.g., kg, quintal) is required'],
    default: 'kg'
  },
  images: [{
    type: String
  }],
  location: {
    type: String,
    required: [true, 'Location is required']
  },
  harvestDate: {
    type: Date
  },
  expiryDate: {
    type: Date
  },
  isAvailable: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

// Indexing for search and filtering
cropSchema.index({ name: 'text', description: 'text' });
cropSchema.index({ category: 1 });
cropSchema.index({ price: 1 });
cropSchema.index({ farmer: 1 });

module.exports = mongoose.model('Crop', cropSchema);
