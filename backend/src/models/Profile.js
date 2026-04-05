const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  phone: {
    type: String,
    trim: true
  },
  address: {
    type: String,
    trim: true
  },
  city: {
    type: String,
    trim: true
  },
  state: {
    type: String,
    trim: true
  },
  pincode: {
    type: String,
    trim: true
  },
  farmSize: {
    type: String,
    trim: true
  },
  experience: {
    type: String,
    trim: true
  },
  specialization: {
    type: [String],
    default: []
  },
  avatarUrl: {
    type: String,
    trim: true
  }
}, { timestamps: true });

profileSchema.index({ city: 1, state: 1 });

module.exports = mongoose.model('Profile', profileSchema);
