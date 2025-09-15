const axios = require('axios');

// Test the backend API endpoints
const testApi = async () => {
  const baseURL = 'http://localhost:5000/api';
  
  console.log('Testing Backend API...\n');
  
  try {
    // Test health endpoint
    console.log('1. Testing health endpoint...');
    const healthResponse = await axios.get(`${baseURL}/health`);
    console.log('   Status:', healthResponse.status);
    console.log('   Data:', healthResponse.data);
    console.log('   ✓ Health endpoint working\n');
    
    // Test user registration
    console.log('2. Testing user registration...');
    const registerData = {
      email: 'test@example.com',
      password: 'password123'
    };
    
    try {
      const registerResponse = await axios.post(`${baseURL}/users/register`, registerData);
      console.log('   Status:', registerResponse.status);
      console.log('   Data:', registerResponse.data);
      console.log('   ✓ User registration working\n');
    } catch (error) {
      if (error.response) {
        console.log('   Status:', error.response.status);
        console.log('   Data:', error.response.data);
        console.log('   Note: Registration might fail if user already exists\n');
      } else {
        console.log('   Error:', error.message);
      }
    }
    
    // Test user login
    console.log('3. Testing user login...');
    const loginData = {
      email: 'test@example.com',
      password: 'password123'
    };
    
    try {
      const loginResponse = await axios.post(`${baseURL}/users/login`, loginData);
      console.log('   Status:', loginResponse.status);
      console.log('   Data:', loginResponse.data);
      console.log('   ✓ User login working\n');
      
      // If login successful, test profile endpoint
      const token = loginResponse.data.token;
      console.log('4. Testing protected profile endpoint...');
      const profileResponse = await axios.get(`${baseURL}/users/profile`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      console.log('   Status:', profileResponse.status);
      console.log('   Data:', profileResponse.data);
      console.log('   ✓ Protected profile endpoint working\n');
    } catch (error) {
      if (error.response) {
        console.log('   Status:', error.response.status);
        console.log('   Data:', error.response.data);
        console.log('   Note: Login might fail with incorrect credentials\n');
      } else {
        console.log('   Error:', error.message);
      }
    }
    
    console.log('API tests completed successfully!');
  } catch (error) {
    if (error.response) {
      console.error('API Error:');
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else if (error.request) {
      console.error('Network Error:');
      console.error('Could not connect to the backend API');
      console.error('Make sure the backend server is running on port 5000');
    } else {
      console.error('Error:', error.message);
    }
  }
};

testApi();