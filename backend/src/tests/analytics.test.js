const request = require('supertest');
const app = require('../app');
const User = require('../models/User');
const StudentSegment = require('../models/StudentSegment');
const UserSegment = require('../models/UserSegment');

// Mock the User model
jest.mock('../models/User');

// Mock the StudentSegment model
jest.mock('../models/StudentSegment');

// Mock the UserSegment model
jest.mock('../models/UserSegment');

describe('Analytics API', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('GET /api/analytics/segment-analytics', () => {
    it('should return segment analytics data', async () => {
      // Mock User.countDocuments to return total users
      User.countDocuments.mockResolvedValue(100);

      // Mock StudentSegment.find to return segments
      const mockSegments = [
        {
          _id: 'segment-1',
          name: 'High Achievers',
          userCount: 30,
        },
        {
          _id: 'segment-2',
          name: 'Creative Thinkers',
          userCount: 20,
        },
      ];

      StudentSegment.find.mockReturnValue({
        sort: jest.fn().mockResolvedValue(mockSegments)
      });

      // Mock UserSegment.find to return recent classifications
      const mockClassifications = [
        {
          user: {
            email: 'user1@example.com',
            createdAt: new Date(),
          },
          segment: {
            name: 'High Achievers',
          },
          createdAt: new Date(),
        },
      ];

      UserSegment.find.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            sort: jest.fn().mockReturnValue({
              limit: jest.fn().mockResolvedValue(mockClassifications)
            })
          })
        })
      });

      // Mock request and response objects
      const req = {};
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      // Import and call the getSegmentAnalytics controller
      const { getSegmentAnalytics } = require('../controllers/analyticsController');
      await getSegmentAnalytics(req, res);

      // Check if the response was called with correct status and data
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        totalUsers: 100,
        segments: expect.arrayContaining([
          expect.objectContaining({
            segmentId: 'segment-1',
            segmentName: 'High Achievers',
            userCount: 30,
            percentage: '30.00',
          }),
        ]),
        recentClassifications: mockClassifications,
      });
    });
  });

  describe('GET /api/analytics/segment/:id/analytics', () => {
    it('should return detailed analytics for a specific segment', async () => {
      // Mock StudentSegment.findById to return a segment
      const mockSegment = {
        _id: 'segment-1',
        name: 'High Achievers',
        description: 'Students with excellent academic performance',
      };

      StudentSegment.findById.mockResolvedValue(mockSegment);

      // Mock UserSegment.find to return user segments
      const mockUserSegments = [
        {
          user: {
            email: 'user1@example.com',
            age: 18,
            gender: 'Male',
            grade: '12th',
            academicInterests: ['Science', 'Mathematics'],
            location: 'Urban',
            createdAt: new Date(),
          },
          confidenceScore: 0.95,
        },
      ];

      UserSegment.find.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          sort: jest.fn().mockResolvedValue(mockUserSegments)
        })
      });

      // Mock request and response objects
      const req = {
        params: { id: 'segment-1' },
      };

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      // Import and call the getSegmentDetails controller
      const { getSegmentDetails } = require('../controllers/analyticsController');
      await getSegmentDetails(req, res);

      // Check if the response was called with correct status and data
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        segment: mockSegment,
        totalUsers: 1,
        averageConfidence: '0.95',
        demographics: expect.objectContaining({
          ageGroups: { '10': 1 },
          genders: { 'Male': 1 },
          grades: { '12th': 1 },
          locations: { 'Urban': 1 },
        }),
        users: mockUserSegments,
      });
    });

    it('should return 404 if segment is not found', async () => {
      // Mock StudentSegment.findById to return null
      StudentSegment.findById.mockResolvedValue(null);

      // Mock request and response objects
      const req = {
        params: { id: 'non-existent-segment' },
      };

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      // Import and call the getSegmentDetails controller
      const { getSegmentDetails } = require('../controllers/analyticsController');
      await getSegmentDetails(req, res);

      // Check if the response was called with correct status and message
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Segment not found' });
    });
  });
});