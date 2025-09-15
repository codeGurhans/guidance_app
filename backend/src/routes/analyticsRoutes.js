const express = require('express');
const { 
  getSegmentAnalytics, 
  getSegmentDetails,
  getUserAnalytics,
  getComparativeAnalytics
} = require('../controllers/analyticsController');
const auth = require('../middleware/auth');

const router = express.Router();

// Get segment analytics
router.get('/segment-analytics', auth, getSegmentAnalytics);

// Get detailed analytics for a specific segment
router.get('/segment/:id/analytics', auth, getSegmentDetails);

// Get user analytics
router.get('/user/:userId', auth, getUserAnalytics);

// Get comparative analytics
router.post('/comparative', auth, getComparativeAnalytics);

module.exports = router;