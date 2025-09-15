const express = require('express');
const {
  predictCutoff,
  getHistoricalCutoffs,
  compareCutoffs
} = require('../controllers/cutoffController');

const router = express.Router();

// Public routes
router.post('/predict', predictCutoff);
router.get('/history', getHistoricalCutoffs);
router.post('/compare', compareCutoffs);

module.exports = router;