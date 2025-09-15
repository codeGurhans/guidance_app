const mongoose = require('mongoose');

const userSegmentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  segment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'StudentSegment',
    required: true,
  },
  classificationDate: {
    type: Date,
    default: Date.now,
  },
  confidenceScore: {
    type: Number,
    min: 0,
    max: 1,
  },
}, {
  timestamps: true,
});

// Ensure a user can only be in a segment once
userSegmentSchema.index({ user: 1, segment: 1 }, { unique: true });

const UserSegment = mongoose.model('UserSegment', userSegmentSchema);

module.exports = UserSegment;