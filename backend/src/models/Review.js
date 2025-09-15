const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  // College being reviewed
  college: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'College',
    required: true,
  },
  
  // User who wrote the review
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  
  // Review rating (1-5 stars)
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  
  // Review title
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100,
  },
  
  // Review content
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000,
  },
  
  // Whether the review is approved
  isApproved: {
    type: Boolean,
    default: false,
  },
  
  // Whether the review is helpful (upvotes)
  helpfulCount: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

// Index for better query performance
reviewSchema.index({ college: 1, isApproved: 1 });
reviewSchema.index({ user: 1, college: 1 }, { unique: true }); // One review per user per college

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;