const mongoose = require('mongoose');

const storageLocationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    required: true,
    enum: ['warehouse', 'cold_storage', 'collection_center'],
    index: true
  },
  address: {
    type: String,
    trim: true
  },
  city: {
    type: String,
    trim: true,
    index: true
  },
  state: {
    type: String,
    trim: true,
    index: true
  },
  pincode: {
    type: String,
    trim: true
  },
  contactName: {
    type: String,
    trim: true
  },
  contactPhone: {
    type: String,
    trim: true
  },
  capacity: {
    type: Number,
    min: 0
  },
  unit: {
    type: String,
    enum: ['kg', 'quintal', 'ton'],
    default: 'kg'
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  }
}, { timestamps: true });

module.exports = mongoose.model('StorageLocation', storageLocationSchema);
