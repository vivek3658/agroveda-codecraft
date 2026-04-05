const mongoose = require('mongoose');

const courseResourceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    required: true,
    enum: ['article', 'video', 'course', 'guide'],
    index: true
  },
  category: {
    type: String,
    trim: true,
    index: true
  },
  summary: {
    type: String,
    trim: true
  },
  url: {
    type: String,
    trim: true
  },
  thumbnailUrl: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  }
}, { timestamps: true });

module.exports = mongoose.model('CourseResource', courseResourceSchema);
