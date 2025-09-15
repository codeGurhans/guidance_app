const express = require('express');
const {
  getUserNotifications,
  getNotificationById,
  markNotificationAsRead,
  markNotificationAsDismissed,
  markAllNotificationsAsRead,
  deleteNotification,
  sendAdmissionDeadlineNotifications,
  sendApplicationStatusNotifications
} = require('../controllers/notificationController');
const auth = require('../middleware/auth');

const router = express.Router();

// Private routes (require authentication)
router.get('/', auth, getUserNotifications);
router.get('/:id', auth, getNotificationById);
router.put('/:id/read', auth, markNotificationAsRead);
router.put('/:id/dismiss', auth, markNotificationAsDismissed);
router.put('/read-all', auth, markAllNotificationsAsRead);
router.delete('/:id', auth, deleteNotification);

// Admin routes (require authentication and admin privileges)
// Note: In a real implementation, you would add middleware to check for admin privileges
router.post('/admission-deadlines', auth, sendAdmissionDeadlineNotifications);
router.post('/application-updates', auth, sendApplicationStatusNotifications);

module.exports = router;