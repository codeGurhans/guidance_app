const mongoose = require('mongoose');

const admissionEventSchema = new mongoose.Schema({
  // College associated with this admission event
  college: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'College',
    required: true,
  },
  
  // Event title
  title: {
    type: String,
    required: true,
    trim: true,
  },
  
  // Event description
  description: {
    type: String,
    trim: true,
  },
  
  // Event type
  eventType: {
    type: String,
    enum: ['Application Deadline', 'Exam Date', 'Result Declaration', 'Counseling', 'Admission Closed', 'Other'],
    required: true,
  },
  
  // Program associated with this event (optional)
  program: {
    type: String,
    trim: true,
  },
  
  // Start date and time
  startDate: {
    type: Date,
    required: true,
  },
  
  // End date and time (optional)
  endDate: {
    type: Date,
  },
  
  // Whether this is an all-day event
  isAllDay: {
    type: Boolean,
    default: false,
  },
  
  // Whether this event repeats
  isRecurring: {
    type: Boolean,
    default: false,
  },
  
  // Recurrence pattern (if recurring)
  recurrencePattern: {
    type: String,
    enum: ['daily', 'weekly', 'monthly', 'yearly'],
  },
  
  // Reminder settings
  reminders: [{
    type: {
      type: String,
      enum: ['email', 'sms', 'push'],
    },
    timeBefore: {
      type: Number, // minutes before event
    },
  }],
  
  // Whether the event is active
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

// Index for better query performance
admissionEventSchema.index({ college: 1, startDate: 1 });
admissionEventSchema.index({ startDate: 1, endDate: 1 });

const AdmissionEvent = mongoose.model('AdmissionEvent', admissionEventSchema);

module.exports = AdmissionEvent;