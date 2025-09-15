const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  // Question text
  text: {
    type: String,
    required: true,
    trim: true,
  },
  
  // Question type (MCQ, rating scale, scenario-based)
  type: {
    type: String,
    required: true,
    enum: ['mcq', 'rating', 'scenario'],
  },
  
  // Options for MCQ questions
  options: [{
    text: {
      type: String,
      required: true,
      trim: true,
    },
    value: {
      type: mongoose.Schema.Types.Mixed, // Can be string, number, or object
      required: true,
    },
  }],
  
  // Category/tags for the question (e.g., 'math', 'science', 'creativity')
  categories: [{
    type: String,
    trim: true,
  }],
  
  // Difficulty level (1-5)
  difficulty: {
    type: Number,
    min: 1,
    max: 5,
    default: 3,
  },
  
  // Time limit for the question in seconds (0 means no limit)
  timeLimit: {
    type: Number,
    default: 0,
  },
  
  // Whether the question is active
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

const Question = mongoose.model('Question', questionSchema);

module.exports = Question;