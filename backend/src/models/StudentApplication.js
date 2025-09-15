const mongoose = require('mongoose');

const studentApplicationSchema = new mongoose.Schema({
  // Student who applied
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  
  // College applied to
  college: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'College',
    required: true,
  },
  
  // Program applied to
  program: {
    type: String,
    required: true,
    trim: true,
  },
  
  // Application status
  status: {
    type: String,
    enum: ['Applied', 'Under Review', 'Accepted', 'Rejected', 'Waitlisted', 'Withdrawn', 'Documents Submitted', 'Interview Scheduled', 'Interview Completed'],
    default: 'Applied',
  },
  
  // Application date
  applicationDate: {
    type: Date,
    default: Date.now,
  },
  
  // Status history for tracking
  statusHistory: [{
    status: {
      type: String,
      enum: ['Applied', 'Under Review', 'Accepted', 'Rejected', 'Waitlisted', 'Withdrawn', 'Documents Submitted', 'Interview Scheduled', 'Interview Completed'],
    },
    date: {
      type: Date,
      default: Date.now,
    },
    notes: {
      type: String,
      trim: true,
    },
  }],
  
  // Student's GPA or percentage
  academicScore: {
    type: Number,
    required: true,
  },
  
  // Standardized test scores
  testScores: [{
    testName: {
      type: String,
      trim: true,
    },
    score: {
      type: Number,
    },
  }],
  
  // Documents submitted
  documents: [{
    name: {
      type: String,
      trim: true,
    },
    url: {
      type: String,
      trim: true,
    },
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
  }],
  
  // Application fee payment status
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Paid', 'Failed', 'Refunded'],
    default: 'Pending',
  },
  
  // Payment transaction ID
  paymentTransactionId: {
    type: String,
    trim: true,
  },
  
  // Interview details (if applicable)
  interview: {
    scheduledDate: {
      type: Date,
    },
    location: {
      type: String,
      trim: true,
    },
    interviewer: {
      type: String,
      trim: true,
    },
    feedback: {
      type: String,
      trim: true,
    },
  },
  
  // Notes or comments
  notes: {
    type: String,
    trim: true,
  },
  
  // Whether the application is active
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

// Add status to history when status changes
studentApplicationSchema.pre('save', function(next) {
  if (this.isModified('status') && this.status) {
    this.statusHistory.push({
      status: this.status,
      date: new Date(),
      notes: this.notes || ''
    });
  }
  next();
});

// Index for better query performance
studentApplicationSchema.index({ student: 1, college: 1 });
studentApplicationSchema.index({ status: 1 });
studentApplicationSchema.index({ applicationDate: 1 });

const StudentApplication = mongoose.model('StudentApplication', studentApplicationSchema);

module.exports = StudentApplication;