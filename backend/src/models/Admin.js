const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  passwordHash: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'disabled'],
    default: 'active'
  },
  lastLoginAt: Date
}, { timestamps: true });

module.exports = mongoose.model('Admin', adminSchema);
