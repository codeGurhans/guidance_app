const express = require('express');
const { getComparativeAnalysis } = require('../controllers/comparativeAnalysisController');
const auth = require('../middleware/auth');

const router = express.Router();

// Get comparative analysis for assessment results
router.get('/results/:id/comparative-analysis', auth, getComparativeAnalysis);

module.exports = router;