const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config(); // Load environment variables
const User = require('./src/models/User');
const generateToken = require('./src/utils/generateToken');

console.log('JWT_SECRET:', process.env.JWT_SECRET);

// Connect to test database
const mongoUri = process.env.MONGO_URI_TEST || 'mongodb://127.0.0.1:27017/guidancehub_test';
mongoose.connect(mongoUri);

async function testUserCreation() {
  try {
    // Clear existing users
    await User.deleteMany({});
    
    // Create a test user
    const plainPassword = 'password123';
    const user = new User({
      email: 'test@example.com',
      password: plainPassword
    });
    
    console.log('Before saving user:', user);
    
    // Save user (password should be hashed by pre-save hook)
    const savedUser = await user.save();
    
    console.log('After saving user:', savedUser);
    
    // Try to login
    const loginPassword = 'password123';
    const isMatch = await savedUser.comparePassword(loginPassword);
    
    console.log('Password match:', isMatch);
    
    // Generate token
    const token = generateToken(savedUser._id);
    console.log('Generated token:', token);
    
    console.log('Test completed successfully!');
  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    await mongoose.connection.close();
  }
}

testUserCreation();