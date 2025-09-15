const request = require('supertest');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config(); // Load environment variables
const app = require('../app');
const User = require('../models/User');
const College = require('../models/College');
const StudentApplication = require('../models/StudentApplication');

describe('Student Applications API', () => {
  let token;
  let userId;
  let collegeId;
  
  beforeAll(async () => {
    // Connect to test database using IPv4
    const mongoUri = process.env.MONGO_URI_TEST || 'mongodb://127.0.0.1:27017/guidancehub_test';
    await mongoose.connect(mongoUri);
    
    // Create a test user (let the pre-save hook hash the password)
    const user = new User({
      email: 'applicant@test.com',
      password: 'password123' // Plain text password, will be hashed by pre-save hook
    });
    
    const savedUser = await user.save();
    userId = savedUser._id;
    
    // Create a test college
    const college = new College({
      name: 'Test College',
      type: 'College',
      address: {
        city: 'Test City',
        state: 'Test State'
      },
      programs: [{
        name: 'B.Tech',
        level: 'Bachelor',
        duration: 4
      }]
    });
    
    const savedCollege = await college.save();
    collegeId = savedCollege._id;
    
    // Login to get token
    const res = await request(app)
      .post('/api/users/login')
      .send({
        email: 'applicant@test.com',
        password: 'password123'
      });
    
    // Debug the login response
    console.log('Login response:', res.body);
    
    token = res.body.token;
  }, 15000); // 15 second timeout
  
  afterAll(async () => {
    // Clean up test data
    await User.deleteMany({});
    await College.deleteMany({});
    await StudentApplication.deleteMany({});
    await mongoose.connection.close();
  }, 15000); // 15 second timeout
  
  describe('POST /api/applications/check', () => {
    it('should check eligibility for a program', async () => {
      const eligibilityData = {
        collegeId: collegeId,
        programName: 'B.Tech',
        academicScore: 85
      };
      
      // Debug the token
      console.log('Token:', token);
      
      const res = await request(app)
        .post('/api/applications/check')
        .set('Authorization', `Bearer ${token}`)
        .send(eligibilityData)
        .expect(200);
      
      expect(res.body).toHaveProperty('isEligible');
      expect(res.body.college.name).toBe('Test College');
      expect(res.body.program.name).toBe('B.Tech');
    }, 15000); // 15 second timeout
  });
  
  describe('POST /api/applications', () => {
    it('should create a new application', async () => {
      const applicationData = {
        collegeId: collegeId,
        program: 'B.Tech',
        academicScore: 85,
        testScores: [
          { testName: 'JEE', score: 90 }
        ]
      };
      
      const res = await request(app)
        .post('/api/applications')
        .set('Authorization', `Bearer ${token}`)
        .send(applicationData)
        .expect(201);
      
      expect(res.body.program).toBe('B.Tech');
      expect(res.body.academicScore).toBe(85);
      expect(res.body.status).toBe('Applied');
    }, 15000); // 15 second timeout
    
    it('should return 400 if user has already applied to the same program', async () => {
      const applicationData = {
        collegeId: collegeId,
        program: 'B.Tech',
        academicScore: 85
      };
      
      // Try to apply again to the same program
      await request(app)
        .post('/api/applications')
        .set('Authorization', `Bearer ${token}`)
        .send(applicationData)
        .expect(400);
    }, 15000); // 15 second timeout
  });
  
  describe('GET /api/applications', () => {
    it('should get user applications', async () => {
      const res = await request(app)
        .get('/api/applications')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
      
      expect(res.body.applications).toBeDefined();
      expect(res.body.applications.length).toBe(1);
      expect(res.body.applications[0].program).toBe('B.Tech');
    }, 15000); // 15 second timeout
  });
  
  describe('PUT /api/applications/:id', () => {
    it('should update application status', async () => {
      // First get the application ID
      const applicationsRes = await request(app)
        .get('/api/applications')
        .set('Authorization', `Bearer ${token}`);
      
      // Debug the response
      console.log('Applications response:', applicationsRes.body);
      
      // Check if applications exist
      if (!applicationsRes.body.applications || applicationsRes.body.applications.length === 0) {
        throw new Error('No applications found');
      }
      
      const applicationId = applicationsRes.body.applications[0]._id;
      
      const res = await request(app)
        .put(`/api/applications/${applicationId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ status: 'Documents Submitted' })
        .expect(200);
      
      expect(res.body.status).toBe('Documents Submitted');
    }, 15000); // 15 second timeout
  });
});