const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const College = require('../models/College');
const HistoricalAdmission = require('../models/HistoricalAdmission');

describe('Cutoff Prediction API', () => {
  let collegeId;
  
  beforeAll(async () => {
    // Connect to test database
    const mongoUri = process.env.MONGO_URI_TEST || 'mongodb://localhost:27017/guidancehub_test';
    await mongoose.connect(mongoUri);
    
    // Create a test college
    const college = new College({
      name: 'Cutoff Test University',
      type: 'University',
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
    
    // Create historical admission data
    const historicalData = new HistoricalAdmission({
      college: collegeId,
      program: 'B.Tech',
      academicYear: '2022-2023',
      category: 'General',
      cutoffScore: 85.5,
      cutoffRank: 1500,
      totalSeats: 120,
      totalApplicants: 8500,
      seatsFilled: 118,
      admissionRate: 0.98
    });
    
    await historicalData.save();
  }, 10000); // 10 second timeout
  
  afterAll(async () => {
    // Clean up test data
    await College.deleteMany({});
    await HistoricalAdmission.deleteMany({});
    await mongoose.connection.close();
  }, 10000); // 10 second timeout
  
  describe('POST /api/cutoff/predict', () => {
    it('should predict cutoff for a program', async () => {
      const cutoffData = {
        collegeId: collegeId,
        programName: 'B.Tech',
        category: 'General'
      };
      
      const res = await request(app)
        .post('/api/cutoff/predict')
        .send(cutoffData)
        .expect(200);
      
      expect(res.body).toHaveProperty('prediction');
      expect(res.body.prediction).toHaveProperty('predictedCutoffScore');
      expect(res.body.college.name).toBe('Cutoff Test University');
      expect(res.body.program).toBe('B.Tech');
    }, 10000); // 10 second timeout
    
    it('should return 400 if required fields are missing', async () => {
      const cutoffData = {
        // Missing collegeId and programName
        category: 'General'
      };
      
      await request(app)
        .post('/api/cutoff/predict')
        .send(cutoffData)
        .expect(400);
    }, 10000); // 10 second timeout
  });
  
  describe('GET /api/cutoff/history', () => {
    it('should get historical cutoff data', async () => {
      const res = await request(app)
        .get('/api/cutoff/history')
        .query({
          collegeId: collegeId,
          programName: 'B.Tech',
          category: 'General'
        })
        .expect(200);
      
      expect(res.body).toBeInstanceOf(Array);
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0]).toHaveProperty('academicYear');
      expect(res.body[0]).toHaveProperty('cutoffScore');
    }, 10000); // 10 second timeout
  });
  
  describe('POST /api/cutoff/compare', () => {
    it('should compare cutoffs across colleges', async () => {
      const compareData = {
        colleges: [collegeId],
        programName: 'B.Tech',
        category: 'General'
      };
      
      const res = await request(app)
        .post('/api/cutoff/compare')
        .send(compareData)
        .expect(200);
      
      expect(res.body).toBeInstanceOf(Array);
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0].college.name).toBe('Cutoff Test University');
    }, 10000); // 10 second timeout
  });
});