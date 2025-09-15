const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Database connection
const connectDB = require('./src/config/db');
const User = require('./src/models/User');

const testRegistrationWithHashing = async () => {
  try {
    // Connect to database
    await connectDB();
    console.log('Connected to database');
    
    // Test user data
    const userData = {
      email: 'test2@example.com',
      password: 'password123',
      age: 20,
      gender: 'Male',
      grade: '12th',
      academicInterests: ['Math', 'Science'],
      location: 'Test City'
    };
    
    console.log('Creating user with data:', userData);
    
    // Test bcrypt hashing
    console.log('Testing bcrypt hashing...');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(userData.password, salt);
    console.log('Password hashed successfully');
    
    // Create user using the model
    const user = new User(userData);
    console.log('User object created');
    
    // Save user
    const savedUser = await user.save();
    console.log('User saved successfully:', savedUser._id);
    
    // Test password comparison
    const isMatch = await savedUser.comparePassword(userData.password);
    console.log('Password comparison result:', isMatch);
    
    // Disconnect
    await mongoose.disconnect();
    console.log('Disconnected from database');
  } catch (error) {
    console.error('Test registration with hashing error:', error);
    console.error('Error stack:', error.stack);
    
    // Disconnect even if there's an error
    try {
      await mongoose.disconnect();
    } catch (disconnectError) {
      console.error('Error disconnecting from database:', disconnectError);
    }
  }
};

testRegistrationWithHashing();