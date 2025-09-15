const request = require('supertest');
const app = require('../app');
const Question = require('../models/Question');
const Assessment = require('../models/Assessment');
const UserResponse = require('../models/UserResponse');
const User = require('../models/User');

// Mock the models
jest.mock('../models/Question');
jest.mock('../models/Assessment');
jest.mock('../models/UserResponse');
jest.mock('../models/User');

// Mock the auth middleware
jest.mock('../middleware/auth', () => {
  return (req, res, next) => {
    req.user = { _id: 'user-1', email: 'test@example.com' };
    next();
  };
});

describe('Enhanced Quiz API', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('GET /api/quiz/assessments/:id/next-question', () => {
    it('should get the next question for an assessment', async () => {
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
        responses: [],
        isCompleted: false
      };

      Assessment.findOne.mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockAssessment)
      });

      UserResponse.findOne.mockResolvedValue(mockUserResponse);

      const response = await request(app)
        .get('/api/quiz/assessments/1/next-question')
        .expect(200);

      // Either we get a question or we get a 404 (no more questions)
      expect([200, 404]).toContain(response.status);
    });

    it('should return 404 if assessment not found', async () => {
      Assessment.findOne.mockReturnValue({
        populate: jest.fn().mockResolvedValue(null)
      });

      await request(app)
        .get('/api/quiz/assessments/999/next-question')
        .expect(404);
    });
  });

  describe('POST /api/quiz/assessments/:id/pause', () => {
    it('should pause an assessment', async () => {
      const mockUserResponse = {
        _id: 'user-response-1',
        user: 'user-1',
        assessment: '1',
        responses: [],
        isCompleted: false,
        isPaused: false,
        save: jest.fn().mockResolvedValue({
          _id: 'user-response-1',
          user: 'user-1',
          assessment: '1',
          responses: [],
          isCompleted: false,
          isPaused: true,
          pausedAt: new Date()
        })
      };

      Assessment.findOne.mockResolvedValue({ _id: '1', isActive: true });
      UserResponse.findOne.mockResolvedValue(mockUserResponse);

      const response = await request(app)
        .post('/api/quiz/assessments/1/pause')
        .expect(200);

      expect(response.body.message).toBe('Assessment paused successfully');
      expect(response.body.userResponse.isPaused).toBe(true);
    });
  });

  describe('POST /api/quiz/assessments/:id/resume', () => {
    it('should resume a paused assessment', async () => {
      const mockUserResponse = {
        _id: 'user-response-1',
        user: 'user-1',
        assessment: '1',
        responses: [],
        isCompleted: false,
        isPaused: true,
        pausedAt: new Date(Date.now() - 10000), // Paused 10 seconds ago
        save: jest.fn().mockResolvedValue({
          _id: 'user-response-1',
          user: 'user-1',
          assessment: '1',
          responses: [],
          isCompleted: false,
          isPaused: false,
          pausedAt: null,
          totalPauseTime: 10000
        })
      };

      Assessment.findOne.mockResolvedValue({ _id: '1', isActive: true });
      UserResponse.findOne.mockResolvedValue(mockUserResponse);

      const response = await request(app)
        .post('/api/quiz/assessments/1/resume')
        .expect(200);

      expect(response.body.message).toBe('Assessment resumed successfully');
      expect(response.body.userResponse.isPaused).toBe(false);
    });
  });
});