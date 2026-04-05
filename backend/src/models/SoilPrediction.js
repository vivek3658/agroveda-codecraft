const mongoose = require('mongoose');

const soilPredictionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true
  },
  sourceType: {
    type: String,
    enum: ['json', 'image', 'pdf'],
    required: true,
    index: true
  },
  originalInput: {
    type: mongoose.Schema.Types.Mixed
  },
  extractedData: {
    N: Number,
    P: Number,
    K: Number,
    temperature: Number,
    humidity: Number,
    rainfall: Number,
    ph: Number
  },
  predictions: [{
    crop: String,
    confidence: Number
  }],
  rawText: String,
  fileMeta: {
    originalName: String,
    mimeType: String,
    size: Number
  }
}, { timestamps: true });

module.exports = mongoose.model('SoilPrediction', soilPredictionSchema);
