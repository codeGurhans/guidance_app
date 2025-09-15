const express = require('express');
const {
  getAdmissionEvents,
  getAdmissionEventById,
  createAdmissionEvent,
  updateAdmissionEvent,
  deleteAdmissionEvent,
  getUpcomingAdmissionEvents
} = require('../controllers/admissionEventController');

const router = express.Router();

// Public routes
router.get('/', getAdmissionEvents);
router.get('/upcoming', getUpcomingAdmissionEvents);
router.get('/:id', getAdmissionEventById);

// Private routes (require authentication and admin privileges)
// Note: In a real implementation, you would add middleware to check for admin privileges
router.post('/', createAdmissionEvent);
router.put('/:id', updateAdmissionEvent);
router.delete('/:id', deleteAdmissionEvent);

module.exports = router;