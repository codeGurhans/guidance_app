const express = require('express');
const {
  getAdmissionEvents,
  getAdmissionEventById,
  createAdmissionEvent,
  updateAdmissionEvent,
  deleteAdmissionEvent,
  getUpcomingAdmissionEvents
} = require('../controllers/admissionEventController');
const auth = require('../middleware/auth');

const router = express.Router();

// Public routes
router.get('/', getAdmissionEvents);
router.get('/upcoming', getUpcomingAdmissionEvents);
router.get('/:id', getAdmissionEventById);

// Private routes (require authentication)
router.post('/', auth, createAdmissionEvent);
router.put('/:id', auth, updateAdmissionEvent);
router.delete('/:id', auth, deleteAdmissionEvent);

module.exports = router;