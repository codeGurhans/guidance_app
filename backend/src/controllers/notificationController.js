const Notification = require('../models/Notification');
const User = require('../models/User');
const AdmissionEvent = require('../models/AdmissionEvent');
const StudentApplication = require('../models/StudentApplication');

// Get user's notifications
/**
 * @desc    Get user's notifications
 * @route   GET /api/notifications
 * @access  Private
 * @param   {object} req - Express request object
 * @param   {object} res - Express response object
 * @returns {object} - Array of user's notifications
 */
const getUserNotifications = async (req, res) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 10, isRead, type } = req.query;
    
    // Build query
    const query = { user: userId };
    
    // Add read status filter
    if (isRead !== undefined) {
      query.isRead = isRead === 'true';
    }
    
    // Add type filter
    if (type) {
      query.type = type;
    }
    
    // Execute query with pagination
    const notifications = await Notification.find(query)
      .sort({ deliveredAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();
    
    // Get total count
    const totalCount = await Notification.countDocuments(query);
    
    res.status(200).json({
      notifications,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page,
      totalCount
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get a specific notification by ID
/**
 * @desc    Get a specific notification by ID
 * @route   GET /api/notifications/:id
 * @access  Private
 * @param   {object} req - Express request object
 * @param   {object} res - Express response object
 * @returns {object} - Notification object
 */
const getNotificationById = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;
    
    const notification = await Notification.findOne({ _id: id, user: userId });
    
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    
    res.status(200).json(notification);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Mark notification as read
/**
 * @desc    Mark notification as read
 * @route   PUT /api/notifications/:id/read
 * @access  Private
 * @param   {object} req - Express request object
 * @param   {object} res - Express response object
 * @returns {object} - Updated notification
 */
const markNotificationAsRead = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;
    
    const notification = await Notification.findOne({ _id: id, user: userId });
    
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    
    notification.isRead = true;
    const updatedNotification = await notification.save();
    
    res.status(200).json(updatedNotification);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Mark notification as dismissed
/**
 * @desc    Mark notification as dismissed
 * @route   PUT /api/notifications/:id/dismiss
 * @access  Private
 * @param   {object} req - Express request object
 * @param   {object} res - Express response object
 * @returns {object} - Updated notification
 */
const markNotificationAsDismissed = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;
    
    const notification = await Notification.findOne({ _id: id, user: userId });
    
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    
    notification.isDismissed = true;
    const updatedNotification = await notification.save();
    
    res.status(200).json(updatedNotification);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Mark all notifications as read
/**
 * @desc    Mark all notifications as read
 * @route   PUT /api/notifications/read-all
 * @access  Private
 * @param   {object} req - Express request object
 * @param   {object} res - Express response object
 * @returns {object} - Success message
 */
const markAllNotificationsAsRead = async (req, res) => {
  try {
    const userId = req.user._id;
    
    await Notification.updateMany(
      { user: userId, isRead: false },
      { isRead: true }
    );
    
    res.status(200).json({ message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete a notification
/**
 * @desc    Delete a notification
 * @route   DELETE /api/notifications/:id
 * @access  Private
 * @param   {object} req - Express request object
 * @param   {object} res - Express response object
 * @returns {object} - Success message
 */
const deleteNotification = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;
    
    const notification = await Notification.findOne({ _id: id, user: userId });
    
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    
    await Notification.deleteOne({ _id: id, user: userId });
    
    res.status(200).json({ message: 'Notification deleted successfully' });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create a notification (internal use)
const createNotification = async (userData) => {
  try {
    const notification = new Notification(userData);
    const savedNotification = await notification.save();
    return savedNotification;
  } catch (error) {
    console.error('Error creating notification:', error);
    return null;
  }
};

// Send admission deadline notifications
/**
 * @desc    Send admission deadline notifications
 * @route   POST /api/notifications/admission-deadlines
 * @access  Private/Admin
 * @param   {object} req - Express request object
 * @param   {object} res - Express response object
 * @returns {object} - Success message
 */
const sendAdmissionDeadlineNotifications = async (req, res) => {
  try {
    // Find upcoming admission events (within the next 7 days)
    const upcomingEvents = await AdmissionEvent.find({
      isActive: true,
      eventType: 'Application Deadline',
      startDate: {
        $gte: new Date(),
        $lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
      }
    }).populate('college', 'name');
    
    let notificationsSent = 0;
    
    // For each upcoming event, find students who might be interested
    for (const event of upcomingEvents) {
      // In a real implementation, you would find students based on their interests, 
      // applications, or other criteria
      // For demo purposes, we'll create a notification for all users
      
      const users = await User.find({}); // Get all users
      
      for (const user of users) {
        // Check if user has already received a notification for this event
        const existingNotification = await Notification.findOne({
          user: user._id,
          'relatedEntity.id': event._id,
          type: 'Application Deadline'
        });
        
        if (!existingNotification) {
          // Create notification
          const notificationData = {
            user: user._id,
            type: 'Application Deadline',
            title: `Application Deadline: ${event.college?.name}`,
            message: `The application deadline for ${event.college?.name} - ${event.program || 'various programs'} is approaching on ${new Date(event.startDate).toLocaleDateString()}.`,
            priority: 'High',
            relatedEntity: {
              type: 'AdmissionEvent',
              id: event._id
            },
            actionLinks: [{
              label: 'View Details',
              url: `/colleges/${event.college?._id}`
            }]
          };
          
          const notification = await createNotification(notificationData);
          if (notification) {
            notificationsSent++;
          }
        }
      }
    }
    
    res.status(200).json({ 
      message: `Sent ${notificationsSent} admission deadline notifications`,
      notificationsSent
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Send application status update notifications
/**
 * @desc    Send application status update notifications
 * @route   POST /api/notifications/application-updates
 * @access  Private/Admin
 * @param   {object} req - Express request object
 * @param   {object} res - Express response object
 * @returns {object} - Success message
 */
const sendApplicationStatusNotifications = async (req, res) => {
  try {
    // Find recently updated applications (within the last 24 hours)
    const recentApplications = await StudentApplication.find({
      updatedAt: {
        $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
      },
      status: { $in: ['Accepted', 'Rejected', 'Waitlisted', 'Interview Scheduled'] }
    }).populate('student college');
    
    let notificationsSent = 0;
    
    // For each updated application, send notification to student
    for (const application of recentApplications) {
      // Create notification
      let title, message, actionUrl;
      
      switch (application.status) {
        case 'Accepted':
          title = `Application Accepted: ${application.college?.name}`;
          message = `Congratulations! Your application for ${application.program} at ${application.college?.name} has been accepted.`;
          actionUrl = `/applications/${application._id}`;
          break;
        case 'Rejected':
          title = `Application Update: ${application.college?.name}`;
          message = `Your application for ${application.program} at ${application.college?.name} has been rejected. Don't worry, there are other opportunities available.`;
          actionUrl = `/applications/${application._id}`;
          break;
        case 'Waitlisted':
          title = `Application Update: ${application.college?.name}`;
          message = `Your application for ${application.program} at ${application.college?.name} has been placed on the waitlist. We'll notify you of any updates.`;
          actionUrl = `/applications/${application._id}`;
          break;
        case 'Interview Scheduled':
          title = `Interview Scheduled: ${application.college?.name}`;
          message = `Your interview for ${application.program} at ${application.college?.name} has been scheduled. Check your application details for more information.`;
          actionUrl = `/applications/${application._id}`;
          break;
        default:
          continue; // Skip other statuses
      }
      
      const notificationData = {
        user: application.student._id,
        type: 'Application Deadline',
        title: title,
        message: message,
        priority: application.status === 'Accepted' ? 'Urgent' : 'High',
        relatedEntity: {
          type: 'Application',
          id: application._id
        },
        actionLinks: [{
          label: 'View Application',
          url: actionUrl
        }]
      };
      
      const notification = await createNotification(notificationData);
      if (notification) {
        notificationsSent++;
      }
    }
    
    res.status(200).json({ 
      message: `Sent ${notificationsSent} application status notifications`,
      notificationsSent
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getUserNotifications,
  getNotificationById,
  markNotificationAsRead,
  markNotificationAsDismissed,
  markAllNotificationsAsRead,
  deleteNotification,
  sendAdmissionDeadlineNotifications,
  sendApplicationStatusNotifications
};