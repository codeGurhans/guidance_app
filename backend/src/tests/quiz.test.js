const request = require('supertest');
const app = require('../app');
const Question = require('../models/Question');
const Assessment = require('../models/Assessment');
const UserResponse = require('../models/UserResponse');

// Mock the models
jest.mock('../models/Question');
jest.mock('../models/Assessment');
jest.mock('../models/UserResponse');

describe('Quiz API', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('GET /api/quiz/assessments', () => {
    it('should get all active assessments', async () => {
      const mockAssessments = [
        {
          _id: '1',
          title: 'Assessment 1',
          description: 'Description 1',
          isActive: true
        },
        {
          _id: '2',
          title: 'Assessment 2',
          description: 'Description 2',
          isActive: true
        }
      ];

      Assessment.find.mockResolvedValue(mockAssessments);

      const response = await request(app)
        .get('/api/quiz/assessments')
        .expect(200);

      expect(response.body).toHaveLength(2);
      expect(Assessment.find).toHaveBeenCalledWith({ isActive: true });
    });
  });

  describe('GET /api/quiz/assessments/:id', () => {
    it('should get a specific assessment by ID', async () => {
      const mockAssessment = {
        _id: '1',
        title: 'Assessment 1',
        description: 'Description 1',
        questions: []
      };

      Assessment.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockAssessment)
      });
      
      Assessment.findOne.mockResolvedValue(mockAssessment);

      const response = await request(app)
        .get('/api/quiz/assessments/1')
        .expect(200);

      expect(response.body).toHaveProperty('_id', '1');
      expect(response.body).toHaveProperty('title', 'Assessment 1');
    });

    it('should return 404 if assessment not found', async () => {
      Assessment.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue(null)
      });

      await request(app)
        .get('/api/quiz/assessments/999')
        .expect(404);
    });
  });
});