const bcrypt = require('bcryptjs');

// Mock bcrypt
jest.mock('bcryptjs');

describe('User Model - Password Hashing', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('should compare passwords correctly', async () => {
    // Mock bcrypt.compare to return true for correct password
    bcrypt.compare.mockResolvedValue(true);

    // Import User model
    const User = require('./User');

    // Create a mock user object with comparePassword method
    const user = {
      password: 'hashed-password',
    };

    // Bind the comparePassword method to our mock user
    const comparePassword = User.schema.methods.comparePassword.bind(user);

    // Call comparePassword method
    const isMatch = await comparePassword('password123');

    // Check if bcrypt.compare was called correctly
    expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashed-password');
    expect(isMatch).toBe(true);
  });
});