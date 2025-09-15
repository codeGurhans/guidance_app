const mongoose = require('mongoose');

const historicalAdmissionSchema = new mongoose.Schema({
  // College associated with this data
  college: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'College',
    required: true,
  },
  
  // Program associated with this data
  program: {
    type: String,
    required: true,
    trim: true,
  },
  
  // Academic year
  academicYear: {
    type: String,
    required: true,
    trim: true,
  },
  
  // Category (for reservation-based systems)
  category: {
    type: String,
    enum: ['General', 'OBC', 'SC', 'ST', 'EWS', 'Other'],
    default: 'General',
  },
  
  // Cutoff GPA or percentage
  cutoffScore: {
    type: Number,
    required: true,
  },
  
  // Cutoff rank (if applicable)
  cutoffRank: {
    type: Number,
  },
  
  // Number of seats available
  totalSeats: {
    type: Number,
    required: true,
  },
  
  // Number of applicants
  totalApplicants: {
    type: Number,
  },
  
  // Number of seats filled
  seatsFilled: {
    type: Number,
  },
  
  // Admission rate (seats filled / total seats)
  admissionRate: {
    type: Number,
  },
  
  // Average score of admitted students
  averageAdmittedScore: {
    type: Number,
  },
  
  // Standard deviation of admitted students' scores
  scoreStandardDeviation: {
    type: Number,
  },
  
  // Additional statistics
  statistics: {
    // Percentile ranks
    percentile90: Number,
    percentile75: Number,
    percentile25: Number,
    percentile10: Number,
    
    // Score ranges
    minScore: Number,
    maxScore: Number,
  },
  
  // Source of data (if imported)
  dataSource: {
    type: String,
    trim: true,
  },
  
  // Notes or comments
  notes: {
    type: String,
    trim: true,
  },
}, {
  timestamps: true,
});

// Index for better query performance
historicalAdmissionSchema.index({ college: 1, program: 1, academicYear: 1 });
historicalAdmissionSchema.index({ cutoffScore: 1 });
historicalAdmissionSchema.index({ cutoffRank: 1 });

const HistoricalAdmission = mongoose.model('HistoricalAdmission', historicalAdmissionSchema);

module.exports = HistoricalAdmission;