const mongoose = require('mongoose');
const User = require('./User');

// Mock mongoose schema and model
jest.mock('mongoose', () => {
  const mockSchema = jest.fn(() => ({
    set: jest.fn(),
    pre: jest.fn(),
    methods: {},
  }));
  
  const mockModel = jest.fn(() => {
    return {
      save: jest.fn().mockResolvedValue({
        _id: 'some-id',
        email: 'test@example.com',
        password: 'password123',
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    };
  });
  
  return {
    Schema: mockSchema,
    model: mockModel,
  };
});

describe('User Model', () => {
  it('should create a user schema with correct fields', () => {
    // Import User model which will trigger schema creation
    jest.resetModules();
    const User = require('./User');
    
    // Check if mongoose.Schema was called with correct parameters
    expect(mongoose.Schema).toHaveBeenCalledWith({
      email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
      },
      password: {
        type: String,
        required: true,
        minlength: 6,
      },
      age: {
        type: Number,
        min: 10,
        max: 100,
      },
      gender: {
        type: String,
        enum: ['Male', 'Female', 'Other', 'Prefer not to say'],
      },
      grade: {
        type: String,
        enum: ['6th', '7th', '8th', '9th', '10th', '11th', '12th', 'Graduate', 'Other'],
      },
      academicInterests: [{
        type: String,
        trim: true,
      }],
      location: {
        type: String,
        trim: true,
      },
      avatar: {
        type: String,
        trim: true,
      },
      privacySettings: {
        profileVisibility: {
          type: String,
          enum: ['public', 'private', 'friends'],
          default: 'private',
        },
        showEmail: {
          type: Boolean,
          default: false,
        },
        showLocation: {
          type: Boolean,
          default: false,
        },
        showAcademicInfo: {
          type: Boolean,
          default: false,
        },
      },
    }, {
      timestamps: true,
    });
  });

  it('should set toJSON transform to remove password', () => {
    // Import User model which will trigger schema creation
    jest.resetModules();
    const User = require('./User');
    
    // Check if schema.set was called with correct parameters
    const mockSchemaInstance = mongoose.Schema.mock.results[0].value;
    expect(mockSchemaInstance.set).toHaveBeenCalledWith('toJSON', {
      transform: expect.any(Function),
    });
  });

  it('should define a pre-save hook for password hashing', () => {
    // Import User model which will trigger schema creation
    jest.resetModules();
    const User = require('./User');
    
    // Check if schema.pre was called with correct parameters
    const mockSchemaInstance = mongoose.Schema.mock.results[0].value;
    expect(mockSchemaInstance.pre).toHaveBeenCalledWith('save', expect.any(Function));
  });

  it('should define a comparePassword method', () => {
    // Import User model which will trigger schema creation
    jest.resetModules();
    const User = require('./User');
    
    // Check if comparePassword method is defined
    const mockSchemaInstance = mongoose.Schema.mock.results[0].value;
    expect(mockSchemaInstance.methods).toHaveProperty('comparePassword');
  });
});