const express = require('express');
const {
  getAssessments,
  getAssessmentById,
  startAssessment,
  getNextQuestion,
  submitAnswer,
  pauseAssessment,
  resumeAssessment,
  completeAssessment,
  getAssessmentResults
} = require('../controllers/quizController');
const auth = require('../middleware/auth');

const router = express.Router();

// Public routes
router.get('/assessments', getAssessments);
router.get('/assessments/:id', getAssessmentById);

// Private routes (require authentication)
router.post('/assessments/:id/start', auth, startAssessment);
router.get('/assessments/:id/next-question', auth, getNextQuestion);
router.post('/assessments/:id/questions/:questionId', auth, submitAnswer);
router.post('/assessments/:id/pause', auth, pauseAssessment);
router.post('/assessments/:id/resume', auth, resumeAssessment);
router.post('/assessments/:id/complete', auth, completeAssessment);
router.get('/results/:id', auth, getAssessmentResults);

module.exports = router;