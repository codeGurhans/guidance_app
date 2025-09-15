const express = require('express');
const {
  getCollegeReviews,
  getCollegeAverageRating,
  createCollegeReview,
  updateReview,
  deleteReview,
  markReviewAsHelpful
} = require('../controllers/reviewController');
const auth = require('../middleware/auth');

const router = express.Router();

// Public routes
router.get('/colleges/:collegeId', getCollegeReviews);
router.get('/colleges/:collegeId/average', getCollegeAverageRating);

// Private routes (require authentication)
router.post('/colleges/:collegeId', auth, createCollegeReview);
router.put('/:id', auth, updateReview);
router.delete('/:id', auth, deleteReview);
router.post('/:id/helpful', auth, markReviewAsHelpful);

module.exports = router;