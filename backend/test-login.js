const request = require('supertest');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();
const app = require('./src/app');
const User = require('./src/models/User');

// Connect to test database
const mongoUri = process.env.MONGO_URI_TEST || 'mongodb://127.0.0.1:27017/guidancehub_test';
mongoose.connect(mongoUri);

async function testLogin() {
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
    console.log('Attempting login...');
    const loginRes = await request(app)
      .post('/api/users/login')
      .send({
        email: 'test@example.com',
        password: 'password123'
      });
    
    console.log('Login response:', loginRes.body);
    
    console.log('Test completed successfully!');
  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    await mongoose.connection.close();
  }
}

testLogin();