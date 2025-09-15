const jwt = require('jsonwebtoken');
const generateToken = require('./generateToken');

// Mock jwt
jest.mock('jsonwebtoken');

describe('JWT Generation Utility', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('should generate a JWT token', () => {
    // Mock jwt.sign to return a token
    jwt.sign.mockReturnValue('jwt-token');

    // Call the generateToken function
    const token = generateToken('user-id');

    // Check if jwt.sign was called correctly
    expect(jwt.sign).toHaveBeenCalledWith(
      { id: 'user-id' },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    // Check if the token is returned correctly
    expect(token).toBe('jwt-token');
  });
});