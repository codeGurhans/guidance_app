const express = require('express');
const { classifyStudent, getUserSegments, getAllSegments, createSegment } = require('../controllers/segmentationController');
const auth = require('../middleware/auth');

const router = express.Router();

// Classify a student
router.post('/classify', auth, classifyStudent);

// Get user's segments
router.get('/user-segments', auth, getUserSegments);

// Get all segments
router.get('/segments', getAllSegments);

// Create a new segment (admin only)
router.post('/segments', auth, createSegment);

module.exports = router;