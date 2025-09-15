const mongoose = require('mongoose');

const careerPathSchema = new mongoose.Schema({
  // Career path title
  title: {
    type: String,
    required: true,
    trim: true,
  },
  
  // Career path description
  description: {
    type: String,
    trim: true,
  },
  
  // Required education level
  educationLevel: {
    type: String,
    enum: ['High School', 'Bachelor\'s Degree', 'Master\'s Degree', 'Doctorate', 'Other'],
  },
  
  // Average salary range
  salaryRange: {
    min: {
      type: Number,
    },
    max: {
      type: Number,
    },
  },
  
  // Job growth projection
  jobGrowth: {
    type: String,
    enum: ['Declining', 'Slow', 'Average', 'Fast', 'Rapid'],
  },
  
  // Required skills
  requiredSkills: [{
    type: String,
    trim: true,
  }],
  
  // Related career paths
  relatedPaths: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CareerPath',
  }],
  
  // Category/tags for the career path
  categories: [{
    type: String,
    trim: true,
  }],
  
  // Whether the career path is active
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

const CareerPath = mongoose.model('CareerPath', careerPathSchema);

module.exports = CareerPath;