const mongoose = require('mongoose');

const collegeSchema = new mongoose.Schema({
  // College name
  name: {
    type: String,
    required: true,
    trim: true,
  },
  
  // College description
  description: {
    type: String,
    trim: true,
  },
  
  // College address
  address: {
    street: {
      type: String,
      trim: true,
    },
    city: {
      type: String,
      trim: true,
    },
    state: {
      type: String,
      trim: true,
    },
    country: {
      type: String,
      trim: true,
    },
    zipCode: {
      type: String,
      trim: true,
    },
  },
  
  // Geolocation coordinates
  location: {
    type: {
      type: String,
      enum: ['Point'],
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      index: '2dsphere',
    },
  },
  
  // Contact information
  contact: {
    phone: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
    },
    website: {
      type: String,
      trim: true,
    },
  },
  
  // College type
  type: {
    type: String,
    enum: ['University', 'College', 'Institute', 'Polytechnic'],
    required: true,
  },
  
  // Degree programs offered
  programs: [{
    name: {
      type: String,
      trim: true,
    },
    level: {
      type: String,
      enum: ['Certificate', 'Diploma', 'Bachelor', 'Master', 'Doctorate'],
    },
    duration: {
      type: Number, // in years
    },
    description: {
      type: String,
      trim: true,
    },
  }],
  
  // Admission requirements
  admissionRequirements: {
    gpa: {
      type: Number,
    },
    standardizedTests: [{
      name: {
        type: String,
        trim: true,
      },
      minimumScore: {
        type: Number,
      },
    }],
    additionalRequirements: [{
      type: String,
      trim: true,
    }],
  },
  
  // Facilities available
  facilities: [{
    type: String,
    trim: true,
  }],
  
  // Accreditation status
  accreditation: {
    status: {
      type: String,
      enum: ['Accredited', 'Provisional', 'Not Accredited'],
    },
    agency: {
      type: String,
      trim: true,
    },
  },
  
  // Establishment year
  established: {
    type: Number,
  },
  
  // Student capacity
  studentCapacity: {
    type: Number,
  },
  
  // Average fees
  fees: {
    undergraduate: {
      type: Number,
    },
    postgraduate: {
      type: Number,
    },
  },
  
  // Whether the college is active
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

const College = mongoose.model('College', collegeSchema);

module.exports = College;