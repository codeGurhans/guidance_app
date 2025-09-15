const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../app');
const User = require('../models/User');

// Mock the User model
jest.mock('../models/User');

// Mock jwt
jest.mock('jsonwebtoken');

describe('Protected Routes', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('should fail with 401 error if no token is provided', async () => {
    await request(app)
      .get('/api/users/profile')
      .expect(401);
  });

  it('should fail with 401 error if token is invalid or malformed', async () => {
    // Mock jwt.verify to throw an error
    jwt.verify.mockImplementation(() => {
      throw new Error('Invalid token');
    });

    await request(app)
      .get('/api/users/profile')
      .set('Authorization', 'Bearer invalid-token')
      .expect(401);
  });

  it('should succeed with 200 and return user data if valid token is provided', async () => {
    // Mock jwt.verify to return decoded token
    jwt.verify.mockReturnValue({ id: 'user-id' });

    // Mock User.findById to return a query object with select method
    User.findById.mockReturnValue({
      select: jest.fn().mockResolvedValue({
        _id: 'user-id',
        email: 'test@example.com',
      }),
    });

    const response = await request(app)
      .get('/api/users/profile')
      .set('Authorization', 'Bearer valid-token')
      .expect(200);

    // Check if the response contains user data
    expect(response.body).toHaveProperty('_id', 'user-id');
    expect(response.body).toHaveProperty('email', 'test@example.com');
  });
});