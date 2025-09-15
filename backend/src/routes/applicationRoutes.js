const express = require('express');
const {
  checkEligibility,
  getUserApplications,
  getApplicationById,
  createApplication,
  updateApplication,
  deleteApplication,
  getApplicationHistory
} = require('../controllers/applicationController');
const auth = require('../middleware/auth');

const router = express.Router();

// Private routes (require authentication)
router.post('/check', auth, checkEligibility);
router.get('/', auth, getUserApplications);
router.get('/:id', auth, getApplicationById);
router.get('/:id/history', auth, getApplicationHistory);
router.post('/', auth, createApplication);
router.put('/:id', auth, updateApplication);
router.delete('/:id', auth, deleteApplication);

module.exports = router;