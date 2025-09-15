const mongoose = require('mongoose');

const assessmentSchema = new mongoose.Schema({
  // Assessment title
  title: {
    type: String,
    required: true,
    trim: true,
  },
  
  // Assessment description
  description: {
    type: String,
    trim: true,
  },
  
  // Questions in the assessment
  questions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question',
  }],
  
  // Categories covered by this assessment
  categories: [{
    type: String,
    trim: true,
  }],
  
  // Time limit for the entire assessment in minutes (0 means no limit)
  timeLimit: {
    type: Number,
    default: 0,
  },
  
  // Whether the assessment is active
  isActive: {
    type: Boolean,
    default: true,
  },
  
  // Scoring system for the assessment
  scoring: {
    type: String,
    enum: ['simple', 'weighted', 'adaptive'],
    default: 'simple',
  },
}, {
  timestamps: true,
});

const Assessment = mongoose.model('Assessment', assessmentSchema);

module.exports = Assessment;