const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const AdmissionEvent = require('../models/AdmissionEvent');
const College = require('../models/College');

describe('Admission Events API', () => {
  let collegeId;
  
  beforeAll(async () => {
    // Connect to test database using IPv4
    const mongoUri = process.env.MONGO_URI_TEST || 'mongodb://127.0.0.1:27017/guidancehub_test';
    await mongoose.connect(mongoUri);
    
    // Create a test college
    const college = new College({
      name: 'Test University',
      type: 'University',
      address: {
        city: 'Test City',
        state: 'Test State',
        country: 'Test Country'
      }
    });
    
    const savedCollege = await college.save();
    collegeId = savedCollege._id;
  }, 15000); // 15 second timeout
  
  afterAll(async () => {
    // Clean up test data
    await AdmissionEvent.deleteMany({});
    await College.deleteMany({});
    await mongoose.connection.close();
  }, 15000); // 15 second timeout
  
  describe('GET /api/admission-events', () => {
    it('should get all admission events', async () => {
      // Create a test admission event
      const event = new AdmissionEvent({
        college: collegeId,
        title: 'Test Event',
        eventType: 'Application Deadline',
        startDate: new Date(),
        description: 'Test event description'
      });
      
      await event.save();
      
      const res = await request(app)
        .get('/api/admission-events')
        .expect(200);
      
      expect(res.body.events).toBeDefined();
      expect(res.body.events.length).toBe(1);
      expect(res.body.events[0].title).toBe('Test Event');
    }, 15000); // 15 second timeout
  });
  
  describe('POST /api/admission-events', () => {
    it('should create a new admission event', async () => {
      const eventData = {
        college: collegeId,
        title: 'New Admission Event',
        eventType: 'Exam Date',
        startDate: new Date(),
        description: 'Test description'
      };
      
      const res = await request(app)
        .post('/api/admission-events')
        .send(eventData)
        .expect(201);
      
      expect(res.body.title).toBe('New Admission Event');
      expect(res.body.eventType).toBe('Exam Date');
      expect(res.body.description).toBe('Test description');
    }, 15000); // 15 second timeout
    
    it('should return 400 if required fields are missing', async () => {
      const eventData = {
        title: 'Incomplete Event'
        // Missing college, eventType, and startDate
      };
      
      await request(app)
        .post('/api/admission-events')
        .send(eventData)
        .expect(400);
    }, 15000); // 15 second timeout
  });
  
  describe('GET /api/admission-events/:id', () => {
    it('should get a specific admission event by ID', async () => {
      // Create a test admission event
      const event = new AdmissionEvent({
        college: collegeId,
        title: 'Specific Event',
        eventType: 'Result Declaration',
        startDate: new Date()
      });
      
      const savedEvent = await event.save();
      
      const res = await request(app)
        .get(`/api/admission-events/${savedEvent._id}`)
        .expect(200);
      
      expect(res.body.title).toBe('Specific Event');
      expect(res.body.eventType).toBe('Result Declaration');
    }, 15000); // 15 second timeout
    
    it('should return 404 if event not found', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      
      await request(app)
        .get(`/api/admission-events/${fakeId}`)
        .expect(404);
    }, 15000); // 15 second timeout
  });
});