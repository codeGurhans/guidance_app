const express = require('express');
const {
  getCareerPaths,
  getCareerPathById,
  getRecommendations,
  compareCareerPaths
} = require('../controllers/careerController');
const auth = require('../middleware/auth');

const router = express.Router();

// Public routes
router.get('/', getCareerPaths);
router.get('/:id', getCareerPathById);
router.post('/compare', compareCareerPaths);

// Private routes (require authentication)
router.get('/recommendations/:assessmentId', auth, getRecommendations);

module.exports = router;