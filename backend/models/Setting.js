const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  theme: {
    type: String,
    enum: ['dark', 'light'],
    default: 'dark'
  },
  notifications: {
    type: Boolean,
    default: true
  },
  defaultSummaryType: {
    type: String,
    enum: ['short', 'medium', 'detailed', 'bullet', 'executive'],
    default: 'medium'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Setting', settingSchema);
