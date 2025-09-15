const mongoose = require('mongoose');

const userResponseSchema = new mongoose.Schema({
  // User who took the assessment
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  
  // Assessment taken
  assessment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Assessment',
    required: true,
  },
  
  // Responses to questions
  responses: [{
    question: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Question',
      required: true,
    },
    answer: {
      type: mongoose.Schema.Types.Mixed, // Can be string, number, or object
      required: true,
    },
    timeTaken: {
      type: Number, // Time taken to answer in seconds
    },
    // Confidence level for the answer (if applicable)
    confidence: {
      type: Number,
      min: 0,
      max: 100
    }
  }],
  
  // Assessment start time
  startTime: {
    type: Date,
    required: true,
  },
  
  // Assessment end time
  endTime: {
    type: Date,
  },
  
  // Whether the assessment was completed
  isCompleted: {
    type: Boolean,
    default: false,
  },
  
  // Whether the assessment is paused
  isPaused: {
    type: Boolean,
    default: false,
  },
  
  // When the assessment was paused
  pausedAt: {
    type: Date,
  },
  
  // Total pause time in milliseconds
  totalPauseTime: {
    type: Number,
    default: 0,
  },
  
  // Total score
  score: {
    type: Number,
  },
  
  // Maximum possible score
  maxScore: {
    type: Number,
  },
  
  // Category scores
  categoryScores: [{
    category: String,
    score: Number,
    maxScore: Number,
    averageScore: Number,
    questionCount: Number,
    weightedScore: Number
  }],
  
  // Time analytics
  timeAnalytics: {
    totalTime: Number, // Total time spent in seconds
    averageTimePerQuestion: Number, // Average time per question in seconds
    timeDistribution: [{ // Time distribution across different ranges
      range: String, // e.g., "0-30s", "30-60s", etc.
      count: Number
    }]
  },
  
  // Difficulty analytics
  difficultyAnalytics: {
    distribution: [{ // Difficulty distribution
      difficulty: Number, // 1-5 scale
      count: Number,
      averageScore: Number
    }],
    performanceByDifficulty: [{ // Performance by difficulty level
      difficulty: Number,
      totalQuestions: Number,
      correctAnswers: Number,
      accuracy: Number
    }]
  },
  
  // Progress tracking
  progressTracking: [{
    timestamp: Date,
    questionIndex: Number,
    cumulativeScore: Number,
    timeElapsed: Number
  }]
}, {
  timestamps: true,
});

const UserResponse = mongoose.model('UserResponse', userResponseSchema);

module.exports = UserResponse;