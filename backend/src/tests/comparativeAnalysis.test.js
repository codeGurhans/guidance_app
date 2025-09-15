const request = require('supertest');
const app = require('../app');
const UserResponse = require('../models/UserResponse');
const Assessment = require('../models/Assessment');

// Mock the models
jest.mock('../models/UserResponse');
jest.mock('../models/Assessment');

// Mock the auth middleware
jest.mock('../middleware/auth', () => {
  return (req, res, next) => {
    req.user = { _id: 'user-1', email: 'test@example.com' };
    next();
  };
});

describe('Comparative Analysis API', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('GET /api/comparative-analysis/results/:id/comparative-analysis', () => {
    it('should get comparative analysis data for assessment results', async () => {
      const mockAssessment = {
        _id: '1',
        title: 'Sample Assessment',
        questions: [
          { _id: 'question-1', text: 'Question 1', type: 'mcq', difficulty: 3 },
          { _id: 'question-2', text: 'Question 2', type: 'rating', difficulty: 3 }
        ]
      };

      const mockUserResponse = {
        _id: 'user-response-1',
        user: 'user-1',
        assessment: '1',
        responses: [
          {
            question: { _id: 'question-1', text: 'Question 1', type: 'mcq', difficulty: 3 },
            answer: 'Option A',
            timeTaken: 30
          },
          {
            question: { _id: 'question-2', text: 'Question 2', type: 'rating', difficulty: 3 },
            answer: 4,
            timeTaken: 45
          }
        ],
        startTime: new Date(Date.now() - 100000), // Started 100 seconds ago
        endTime: new Date(Date.now() - 50000), // Ended 50 seconds ago
        isCompleted: true,
        score: 2,
        categoryScores: [
          { category: 'math', score: 1 },
          { category: 'science', score: 1 }
        ]
      };

      Assessment.findOne.mockResolvedValue(mockAssessment);
      Assessment.findById.mockResolvedValue(mockAssessment);

      UserResponse.findOne.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockResolvedValue(mockUserResponse)
        })
      });

      const response = await request(app)
        .get('/api/comparative-analysis/results/1/comparative-analysis')
        .expect(200);

      expect(response.body).toHaveProperty('topCategories');
      expect(response.body).toHaveProperty('overallAnalysis');
    });

    it('should return 404 if assessment not found', async () => {
      Assessment.findOne.mockResolvedValue(null);
      Assessment.findById.mockResolvedValue(null);

      await request(app)
        .get('/api/comparative-analysis/results/999/comparative-analysis')
        .expect(404);
    });

    it('should return 404 if completed assessment not found', async () => {
      const mockAssessment = {
        _id: '1',
        title: 'Sample Assessment',
        questions: [
          { _id: 'question-1', text: 'Question 1', type: 'mcq', difficulty: 3 }
        ]
      };

      Assessment.findOne.mockResolvedValue(mockAssessment);
      Assessment.findById.mockResolvedValue(mockAssessment);

      UserResponse.findOne.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockResolvedValue(null)
        })
      });

      await request(app)
        .get('/api/comparative-analysis/results/1/comparative-analysis')
        .expect(404);
    });
  });
});