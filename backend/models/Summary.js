const mongoose = require('mongoose');

const summarySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  originalText: {
    type: String,
    required: [true, 'Original text content is required']
  },
  originalTitle: {
    type: String,
    default: 'Untitled Document'
  },
  generatedTitle: {
    type: String,
    default: 'Synthesized Summary'
  },
  shortSummary: {
    type: String,
    required: true
  },
  detailedSummary: {
    type: String,
    required: true
  },
  bulletPoints: {
    type: [String],
    default: []
  },
  executiveSummary: {
    type: String,
    default: ''
  },
  keywords: {
    type: [String],
    default: []
  },
  readingTime: {
    type: Number,
    required: true
  },
  sentiment: {
    type: String,
    enum: ['Positive', 'Negative', 'Neutral'],
    default: 'Neutral'
  },
  sentimentScore: {
    type: Number,
    default: 0
  },
  insights: {
    type: [String],
    default: []
  },
  inputType: {
    type: String,
    enum: ['text', 'file', 'url'],
    default: 'text'
  },
  summaryType: {
    type: String,
    enum: ['short', 'medium', 'detailed', 'bullet', 'executive'],
    default: 'medium'
  },
  isFavorite: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Summary', summarySchema);
