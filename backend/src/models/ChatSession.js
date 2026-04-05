const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ['user', 'assistant', 'system'],
    required: true
  },
  message: {
    type: String,
    required: true
  },
  metadata: mongoose.Schema.Types.Mixed
}, { _id: true, timestamps: true });

const chatSessionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true
  },
  title: {
    type: String,
    trim: true,
    default: 'Soil Assistant Chat'
  },
  lastPrediction: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SoilPrediction'
  },
  messages: {
    type: [chatMessageSchema],
    default: []
  }
}, { timestamps: true });

module.exports = mongoose.model('ChatSession', chatSessionSchema);
