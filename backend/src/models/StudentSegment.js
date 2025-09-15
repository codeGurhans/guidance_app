const mongoose = require('mongoose');

const studentSegmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  criteria: {
    academicPerformance: {
      minGPA: {
        type: Number,
        min: 0,
        max: 10,
      },
      maxGPA: {
        type: Number,
        min: 0,
        max: 10,
      },
    },
    interests: [{
      type: String,
      trim: true,
    }],
    location: {
      type: String,
      trim: true,
    },
    financialStatus: {
      type: String,
      enum: ['low', 'medium', 'high'],
    },
  },
  userCount: {
    type: Number,
    default: 0,
  },
  recommendations: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CareerPath',
  }],
}, {
  timestamps: true,
});

const StudentSegment = mongoose.model('StudentSegment', studentSegmentSchema);

module.exports = StudentSegment;