const express = require('express');
const { getVisualizationData } = require('../controllers/visualizationController');
const auth = require('../middleware/auth');

const router = express.Router();

// Get visualization data for assessment results
router.get('/results/:id/visualization', auth, getVisualizationData);

module.exports = router;