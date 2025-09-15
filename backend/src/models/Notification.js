const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  // User who receives the notification
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  
  // Type of notification
  type: {
    type: String,
    enum: ['Application Deadline', 'Exam Date', 'Result Declaration', 'Counseling', 'Admission Closed', 'Interview Scheduled', 'Document Submission', 'General'],
    required: true,
  },
  
  // Title of the notification
  title: {
    type: String,
    required: true,
    trim: true,
  },
  
  // Detailed message
  message: {
    type: String,
    required: true,
    trim: true,
  },
  
  // Related entity (if applicable)
  relatedEntity: {
    type: {
      type: String,
      enum: ['College', 'AdmissionEvent', 'Application', 'Other'],
    },
    id: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'relatedEntity.type',
    },
  },
  
  // Priority level
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Urgent'],
    default: 'Medium',
  },
  
  // Whether the notification has been read
  isRead: {
    type: Boolean,
    default: false,
  },
  
  // Whether the notification has been dismissed
  isDismissed: {
    type: Boolean,
    default: false,
  },
  
  // Scheduled delivery time (for future notifications)
  scheduledAt: {
    type: Date,
  },
  
  // Actual delivery time
  deliveredAt: {
    type: Date,
    default: Date.now,
  },
  
  // Expiration time (optional)
  expiresAt: {
    type: Date,
  },
  
  // Action links (if applicable)
  actionLinks: [{
    label: {
      type: String,
      trim: true,
    },
    url: {
      type: String,
      trim: true,
    },
  }],
}, {
  timestamps: true,
});

// Index for better query performance
notificationSchema.index({ user: 1, isRead: 1 });
notificationSchema.index({ user: 1, deliveredAt: -1 });
notificationSchema.index({ scheduledAt: 1 });
notificationSchema.index({ expiresAt: 1 });

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;