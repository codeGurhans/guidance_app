const Review = require('../models/Review');
const College = require('../models/College');
const mongoose = require('mongoose');

// Get reviews for a college
/**
 * @desc    Get reviews for a college
 * @route   GET /api/reviews/colleges/:collegeId
 * @access  Public
 * @param   {object} req - Express request object
 * @param   {object} res - Express response object
 * @returns {object} - Array of reviews
 */
const getCollegeReviews = async (req, res) => {
  try {
    const { collegeId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    
    // Check if college exists
    const college = await College.findById(collegeId);
    if (!college) {
      return res.status(404).json({ message: 'College not found' });
    }
    
    // Get approved reviews for the college
    const reviews = await Review.find({ 
      college: collegeId, 
      isApproved: true 
    })
      .populate('user', 'email') // Only include user email
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();
    
    // Get total count
    const totalCount = await Review.countDocuments({ 
      college: collegeId, 
      isApproved: true 
    });
    
    res.status(200).json({
      reviews,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page,
      totalCount
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get average rating for a college
/**
 * @desc    Get average rating for a college
 * @route   GET /api/reviews/colleges/:collegeId/average
 * @access  Public
 * @param   {object} req - Express request object
 * @param   {object} res - Express response object
 * @returns {object} - Average rating
 */
const getCollegeAverageRating = async (req, res) => {
  try {
    const { collegeId } = req.params;
    
    // Check if college exists
    const college = await College.findById(collegeId);
    if (!college) {
      return res.status(404).json({ message: 'College not found' });
    }
    
    // Calculate average rating
    const result = await Review.aggregate([
      { $match: { college: mongoose.Types.ObjectId(collegeId), isApproved: true } },
      { $group: { _id: null, averageRating: { $avg: '$rating' }, totalReviews: { $sum: 1 } } }
    ]);
    
    const averageRating = result.length > 0 ? result[0].averageRating : 0;
    const totalReviews = result.length > 0 ? result[0].totalReviews : 0;
    
    res.status(200).json({
      averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal place
      totalReviews
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Create a review for a college
/**
 * @desc    Create a review for a college
 * @route   POST /api/reviews/colleges/:collegeId
 * @access  Private
 * @param   {object} req - Express request object
 * @param   {object} res - Express response object
 * @returns {object} - Created review
 */
const createCollegeReview = async (req, res) => {
  try {
    // req.user is set in the auth middleware
    const userId = req.user._id;
    const { collegeId } = req.params;
    const { rating, title, content } = req.body;
    
    // Validate required fields
    if (!rating || !title || !content) {
      return res.status(400).json({ message: 'Rating, title, and content are required' });
    }
    
    // Validate rating range
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }
    
    // Check if college exists
    const college = await College.findById(collegeId);
    if (!college) {
      return res.status(404).json({ message: 'College not found' });
    }
    
    // Check if user has already reviewed this college
    const existingReview = await Review.findOne({ user: userId, college: collegeId });
    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this college' });
    }
    
    // Create new review
    const review = new Review({
      college: collegeId,
      user: userId,
      rating,
      title,
      content
    });
    
    const savedReview = await review.save();
    
    // Populate user information
    await savedReview.populate('user', 'email');
    
    res.status(201).json(savedReview);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Update a review
/**
 * @desc    Update a review
 * @route   PUT /api/reviews/:id
 * @access  Private
 * @param   {object} req - Express request object
 * @param   {object} res - Express response object
 * @returns {object} - Updated review
 */
const updateReview = async (req, res) => {
  try {
    // req.user is set in the auth middleware
    const userId = req.user._id;
    const { id } = req.params;
    const { rating, title, content } = req.body;
    
    // Find the review
    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }
    
    // Check if user owns the review
    if (review.user.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'You can only update your own reviews' });
    }
    
    // Update review fields
    if (rating !== undefined) {
      if (rating < 1 || rating > 5) {
        return res.status(400).json({ message: 'Rating must be between 1 and 5' });
      }
      review.rating = rating;
    }
    
    if (title !== undefined) {
      review.title = title;
    }
    
    if (content !== undefined) {
      review.content = content;
    }
    
    // Reset approval status when updating
    review.isApproved = false;
    
    const updatedReview = await review.save();
    
    // Populate user information
    await updatedReview.populate('user', 'email');
    
    res.status(200).json(updatedReview);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete a review
/**
 * @desc    Delete a review
 * @route   DELETE /api/reviews/:id
 * @access  Private
 * @param   {object} req - Express request object
 * @param   {object} res - Express response object
 * @returns {object} - Success message
 */
const deleteReview = async (req, res) => {
  try {
    // req.user is set in the auth middleware
    const userId = req.user._id;
    const { id } = req.params;
    
    // Find the review
    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }
    
    // Check if user owns the review or is an admin
    if (review.user.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'You can only delete your own reviews' });
    }
    
    // Delete the review
    await review.remove();
    
    res.status(200).json({ message: 'Review deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Mark a review as helpful
/**
 * @desc    Mark a review as helpful
 * @route   POST /api/reviews/:id/helpful
 * @access  Private
 * @param   {object} req - Express request object
 * @param   {object} res - Express response object
 * @returns {object} - Updated review
 */
const markReviewAsHelpful = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find the review
    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }
    
    // Increment helpful count
    review.helpfulCount += 1;
    const updatedReview = await review.save();
    
    res.status(200).json(updatedReview);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getCollegeReviews,
  getCollegeAverageRating,
  createCollegeReview,
  updateReview,
  deleteReview,
  markReviewAsHelpful
};