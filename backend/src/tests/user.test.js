const request = require('supertest');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const app = require('../app');
const User = require('../models/User');

// Mock multer
jest.mock('multer', () => {
  return () => ({
    single: () => (req, res, next) => {
      req.file = {
        filename: 'avatar.jpg'
      };
      next();
    }
  });
});

// Mock the upload middleware
jest.mock('../middleware/upload', () => {
  return (req, res, next) => {
    req.file = {
      filename: 'avatar.jpg'
    };
    next();
  };
});

// Mock the User model
jest.mock('../models/User');

// Mock bcrypt
jest.mock('bcryptjs');

// Mock jwt
jest.mock('jsonwebtoken');

describe('User Registration API', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('should fail with 400 error if no email is provided', async () => {
    const userData = {
      password: 'password123',
    };

    await request(app)
      .post('/api/users/register')
      .send(userData)
      .expect(400);
  });

  it('should fail with 400 error if no password is provided', async () => {
    const userData = {
      email: 'test@example.com',
    };

    await request(app)
      .post('/api/users/register')
      .send(userData)
      .expect(400);
  });

  it('should fail with 400 error for invalid email format', async () => {
    const userData = {
      email: 'invalid-email',
      password: 'password123',
    };

    await request(app)
      .post('/api/users/register')
      .send(userData)
      .expect(400);
  });

  it('should fail with 400 error if user with email already exists', async () => {
    const userData = {
      email: 'test@example.com',
      password: 'password123',
    };

    // Mock User.findOne to return a user (simulating existing user)
    User.findOne.mockResolvedValue(userData);

    await request(app)
      .post('/api/users/register')
      .send(userData)
      .expect(400);
  });

  it('should successfully register a user with valid data', async () => {
    const userData = {
      email: 'test@example.com',
      password: 'password123',
    };

    // Mock User.findOne to return null (simulating no existing user)
    User.findOne.mockResolvedValue(null);

    // Mock User.save to return the user data
    User.mockImplementation(() => {
      return {
        save: jest.fn().mockResolvedValue({
          _id: 'some-id',
          email: userData.email,
          password: userData.password,
        }),
      };
    });

    // Mock bcrypt.hash to return a hashed password
    bcrypt.hash.mockResolvedValue('hashed-password');

    const response = await request(app)
      .post('/api/users/register')
      .send(userData)
      .expect(201);

    // Check if the response contains the user data without password
    expect(response.body).toHaveProperty('_id');
    expect(response.body).toHaveProperty('email', userData.email);
    expect(response.body).not.toHaveProperty('password');
  });

  it('should successfully register a user with extended profile data', async () => {
    const userData = {
      email: 'test@example.com',
      password: 'password123',
      age: 16,
      gender: 'Male',
      grade: '10th',
      academicInterests: ['Math', 'Science'],
      location: 'New York, NY',
    };

    // Mock User.findOne to return null (simulating no existing user)
    User.findOne.mockResolvedValue(null);

    // Mock User.save to return the user data
    User.mockImplementation(() => {
      return {
        save: jest.fn().mockResolvedValue({
          _id: 'some-id',
          email: userData.email,
          password: userData.password,
          age: userData.age,
          gender: userData.gender,
          grade: userData.grade,
          academicInterests: userData.academicInterests,
          location: userData.location,
        }),
      };
    });

    // Mock bcrypt.hash to return a hashed password
    bcrypt.hash.mockResolvedValue('hashed-password');

    const response = await request(app)
      .post('/api/users/register')
      .send(userData)
      .expect(201);

    // Check if the response contains the user data without password
    expect(response.body).toHaveProperty('_id');
    expect(response.body).toHaveProperty('email', userData.email);
    expect(response.body).toHaveProperty('age', userData.age);
    expect(response.body).toHaveProperty('gender', userData.gender);
    expect(response.body).toHaveProperty('grade', userData.grade);
    expect(response.body).toHaveProperty('academicInterests', userData.academicInterests);
    expect(response.body).toHaveProperty('location', userData.location);
    expect(response.body).not.toHaveProperty('password');
  });
});

describe('User Login API', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('should fail with 401 error if the user does not exist', async () => {
    const userData = {
      email: 'nonexistent@example.com',
      password: 'password123',
    };

    // Mock User.findOne to return null (simulating no existing user)
    User.findOne.mockResolvedValue(null);

    await request(app)
      .post('/api/users/login')
      .send(userData)
      .expect(401);
  });

  it('should fail with 401 error if the email exists but the password is incorrect', async () => {
    const userData = {
      email: 'test@example.com',
      password: 'wrongpassword',
    };

    // Mock User.findOne to return a user
    User.findOne.mockResolvedValue({
      _id: 'some-id',
      email: 'test@example.com',
      password: 'hashed-password',
      comparePassword: jest.fn().mockResolvedValue(false),
    });

    await request(app)
      .post('/api/users/login')
      .send(userData)
      .expect(401);
  });

  it('should succeed with 200 status code for correct credentials', async () => {
    const userData = {
      email: 'test@example.com',
      password: 'password123',
    };

    // Mock User.findOne to return a user
    User.findOne.mockResolvedValue({
      _id: 'some-id',
      email: 'test@example.com',
      password: 'hashed-password',
      comparePassword: jest.fn().mockResolvedValue(true),
    });

    // Mock jwt.sign to return a token
    jwt.sign.mockReturnValue('jwt-token');

    const response = await request(app)
      .post('/api/users/login')
      .send(userData)
      .expect(200);

    // Check if the response contains a token
    expect(response.body).toHaveProperty('token', 'jwt-token');
  });

  it('should generate a token that can be decoded and contains the user\'s ID', async () => {
    const userData = {
      email: 'test@example.com',
      password: 'password123',
    };

    // Mock User.findOne to return a user
    User.findOne.mockResolvedValue({
      _id: 'user-id',
      email: 'test@example.com',
      password: 'hashed-password',
      comparePassword: jest.fn().mockResolvedValue(true),
    });

    // Mock jwt.sign to return a token
    jwt.sign.mockReturnValue('jwt-token');

    const response = await request(app)
      .post('/api/users/login')
      .send(userData)
      .expect(200);

    // Check if the response contains a token
    expect(response.body).toHaveProperty('token', 'jwt-token');

    // Mock jwt.verify to return the decoded token
    jwt.verify.mockReturnValue({ id: 'user-id' });

    // Verify the token
    const decoded = jwt.verify(response.body.token, process.env.JWT_SECRET);
    expect(decoded).toHaveProperty('id', 'user-id');
  });
});

describe('User Profile Controller', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('should successfully update user profile with valid data', async () => {
    const profileData = {
      age: 17,
      gender: 'Female',
      grade: '11th',
      academicInterests: ['Literature', 'History'],
      location: 'Los Angeles, CA',
    };

    // Mock User.findByIdAndUpdate to return updated user
    const mockUpdatedUser = {
      _id: 'user-id',
      email: 'test@example.com',
      age: profileData.age,
      gender: profileData.gender,
      grade: profileData.grade,
      academicInterests: profileData.academicInterests,
      location: profileData.location,
      select: jest.fn().mockReturnThis(),
    };
    
    User.findByIdAndUpdate.mockImplementation(() => ({
      select: jest.fn().mockResolvedValue(mockUpdatedUser)
    }));

    // Mock request and response objects
    const req = {
      user: { _id: 'user-id' },
      body: profileData,
    };
    
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    // Import and call the updateProfile controller
    const { updateProfile } = require('../controllers/userController');
    await updateProfile(req, res);

    // Check if the response was called with correct status and data
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockUpdatedUser);
  });

  it('should fail with 400 error for invalid profile data', async () => {
    const profileData = {
      age: 5, // Invalid age
      gender: 'Female',
      grade: '11th',
      academicInterests: ['Literature', 'History'],
      location: 'Los Angeles, CA',
    };

    // Mock request and response objects
    const req = {
      user: { _id: 'user-id' },
      body: profileData,
    };
    
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    // Import and call the updateProfile controller
    const { updateProfile } = require('../controllers/userController');
    await updateProfile(req, res);

    // Check if the response was called with correct status and error message
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Validation error',
      errors: expect.arrayContaining(['Age must be a number between 10 and 100']),
    });
  });
});

describe('Avatar Upload Controller', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('should return success message for avatar upload', async () => {
    // Mock User.findById to return a user
    const mockUser = {
      _id: 'user-id',
      email: 'test@example.com',
      save: jest.fn().mockResolvedValue({
        _id: 'user-id',
        email: 'test@example.com',
        avatar: '/uploads/avatar.jpg',
      }),
    };
    
    User.findById.mockResolvedValue(mockUser);

    // Mock request and response objects
    const req = {
      user: { _id: 'user-id' },
    };
    
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    // Import and call the uploadAvatar controller
    const { uploadAvatar } = require('../controllers/userController');
    await uploadAvatar(req, res);

    // Wait for the async operations to complete
    await new Promise(resolve => setImmediate(resolve));

    // Check if the response was called with correct status and message
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Avatar uploaded successfully',
      avatarUrl: '/uploads/avatar.jpg'
    });
  });
});

describe('Privacy Settings Controller', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('should successfully update privacy settings with valid data', async () => {
    const privacySettings = {
      profileVisibility: 'public',
      showEmail: true,
      showLocation: false,
      showAcademicInfo: true,
    };

    // Mock User.findByIdAndUpdate to return updated user
    const mockUpdatedUser = {
      _id: 'user-id',
      email: 'test@example.com',
      privacySettings,
      select: jest.fn().mockReturnThis(),
    };
    
    User.findByIdAndUpdate.mockImplementation(() => ({
      select: jest.fn().mockResolvedValue(mockUpdatedUser)
    }));

    // Mock request and response objects
    const req = {
      user: { _id: 'user-id' },
      body: privacySettings,
    };
    
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    // Import and call the updatePrivacySettings controller
    const { updatePrivacySettings } = require('../controllers/userController');
    await updatePrivacySettings(req, res);

    // Check if the response was called with correct status and data
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockUpdatedUser);
  });

  it('should fail with 400 error for invalid privacy settings', async () => {
    const privacySettings = {
      profileVisibility: 'invalid', // Invalid value
      showEmail: 'not-a-boolean', // Invalid type
    };

    // Mock request and response objects
    const req = {
      user: { _id: 'user-id' },
      body: privacySettings,
    };
    
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    // Import and call the updatePrivacySettings controller
    const { updatePrivacySettings } = require('../controllers/userController');
    await updatePrivacySettings(req, res);

    // Check if the response was called with correct status and error message
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Validation error',
      errors: expect.arrayContaining([
        'Invalid profile visibility setting',
        'Show email must be a boolean value'
      ]),
    });
  });
});

describe('Export User Data Controller', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('should successfully export user data', async () => {
    const mockUser = {
      _id: 'user-id',
      email: 'test@example.com',
      age: 16,
      gender: 'Male',
      grade: '10th',
      academicInterests: ['Math', 'Science'],
      location: 'New York, NY',
      avatar: 'https://example.com/avatar.jpg',
      privacySettings: {
        profileVisibility: 'public',
        showEmail: true,
        showLocation: false,
        showAcademicInfo: true,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      select: jest.fn().mockReturnThis(),
    };
    
    User.findById.mockImplementation(() => ({
      select: jest.fn().mockResolvedValue(mockUser)
    }));

    // Mock request and response objects
    const req = {
      user: { _id: 'user-id' },
    };
    
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    // Import and call the exportUserData controller
    const { exportUserData } = require('../controllers/userController');
    await exportUserData(req, res);

    // Check if the response was called with correct status and data
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      userData: expect.objectContaining({
        id: 'user-id',
        email: 'test@example.com',
        age: 16,
        gender: 'Male',
        grade: '10th',
        academicInterests: ['Math', 'Science'],
        location: 'New York, NY',
        avatar: 'https://example.com/avatar.jpg',
      }),
      exportDate: expect.any(String),
    });
  });

  it('should fail with 404 error if user not found', async () => {
    // Mock User.findById to return null
    User.findById.mockImplementation(() => ({
      select: jest.fn().mockResolvedValue(null)
    }));

    // Mock request and response objects
    const req = {
      user: { _id: 'user-id' },
    };
    
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    // Import and call the exportUserData controller
    const { exportUserData } = require('../controllers/userController');
    await exportUserData(req, res);

    // Check if the response was called with correct status and error message
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      message: 'User not found',
    });
  });
});

describe('Delete Account Controller', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('should successfully delete user account', async () => {
    const mockUser = {
      _id: 'user-id',
      email: 'test@example.com',
    };
    
    User.findByIdAndDelete.mockResolvedValue(mockUser);

    // Mock request and response objects
    const req = {
      user: { _id: 'user-id' },
    };
    
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    // Import and call the deleteAccount controller
    const { deleteAccount } = require('../controllers/userController');
    await deleteAccount(req, res);

    // Check if the response was called with correct status and message
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Account deleted successfully',
    });
  });

  it('should fail with 404 error if user not found', async () => {
    // Mock User.findByIdAndDelete to return null
    User.findByIdAndDelete.mockResolvedValue(null);

    // Mock request and response objects
    const req = {
      user: { _id: 'user-id' },
    };
    
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    // Import and call the deleteAccount controller
    const { deleteAccount } = require('../controllers/userController');
    await deleteAccount(req, res);

    // Check if the response was called with correct status and error message
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      message: 'User not found',
    });
  });
});