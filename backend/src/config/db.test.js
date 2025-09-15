const mongoose = require('mongoose');
const connectDB = require('./db');

// Mock the mongoose connect function
jest.mock('mongoose', () => {
  return {
    connect: jest.fn(),
  };
});

describe('Database Connection', () => {
  const MONGO_URI = 'mongodb://localhost:27017/test';

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    
    // Set the environment variable
    process.env.MONGO_URI = MONGO_URI;
  });

  it('should connect to MongoDB', async () => {
    // Mock the connect function to resolve successfully
    mongoose.connect.mockResolvedValue({
      connection: {
        host: 'localhost',
      },
    });

    // Import and call the connectDB function
    await connectDB();

    // Check if mongoose.connect was called with the correct URI
    expect(mongoose.connect).toHaveBeenCalledWith(
      expect.stringContaining('mongodb://'),
      expect.any(Object)
    );
  });

  it('should handle connection errors', async () => {
    // Mock the connect function to reject with an error
    mongoose.connect.mockRejectedValue(new Error('Connection failed'));

    // Mock console.error
    console.error = jest.fn();

    // Import and call the connectDB function
    await connectDB();

    // Check if console.error was called
    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining('Error connecting to MongoDB')
    );
  });
});