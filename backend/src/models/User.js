const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true,
    trim: true
  },
  email: { 
    type: String, 
    required: true, 
    unique: true,
    lowercase: true,
    trim: true
  },
  password: { 
    type: String,
    // Optional because Google users won't have a password
  },
  role: { 
    type: String, 
    enum: ['farmer', 'consumer'],
    default: 'consumer' 
  },
  googleId: { 
    type: String 
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended'],
    default: 'active'
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  lastLoginAt: {
    type: Date
  }
}, { timestamps: true });

userSchema.index({ role: 1, status: 1 });

module.exports = mongoose.model('User', userSchema);
