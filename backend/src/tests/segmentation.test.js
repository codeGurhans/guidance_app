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

describe('Segmentation API', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('POST /api/segmentation/classify', () => {
    it('should classify a student and return the best matching segment', async () => {
      // Mock User.findById to return a user
      const mockUser = {
        _id: 'user-id',
        email: 'test@example.com',
        academicInterests: ['Science', 'Mathematics'],
        location: 'Urban',
        gpa: 9.2,
      };

      // Mock StudentSegment.find to return segments
      const mockSegments = [
        {
          _id: 'segment-1',
          name: 'High Achievers',
          description: 'Students with excellent academic performance',
          criteria: {
            academicPerformance: {
              minGPA: 8.5,
              maxGPA: 10,
            },
            interests: ['Science', 'Mathematics'],
          },
        },
        {
          _id: 'segment-2',
          name: 'Creative Thinkers',
          description: 'Students with interests in arts and literature',
          criteria: {
            interests: ['Arts', 'Literature'],
          },
        },
      ];

      StudentSegment.find.mockResolvedValue(mockSegments);

      // Mock UserSegment.findOne to return null (no existing classification)
      UserSegment.findOne.mockResolvedValue(null);

      // Mock UserSegment.create to resolve successfully
      UserSegment.create.mockResolvedValue({
        user: 'user-id',
        segment: 'segment-1',
        confidenceScore: 1,
      });

      // Mock StudentSegment.findByIdAndUpdate to resolve successfully
      StudentSegment.findByIdAndUpdate.mockResolvedValue({
        _id: 'segment-1',
        name: 'High Achievers',
        userCount: 5,
      });

      // Mock request and response objects
      const req = {
        user: mockUser,
      };

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      // Import and call the classifyStudent controller
      const { classifyStudent } = require('../controllers/segmentationController');
      await classifyStudent(req, res);

      // Check if the response was called with correct status and data
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        segment: expect.objectContaining({
          _id: 'segment-1',
          name: 'High Achievers',
        }),
        confidenceScore: expect.any(Number),
      });
    });
  });

  describe('GET /api/segmentation/user-segments', () => {
    it('should return all segments for a user', async () => {
      // Mock UserSegment.find to return user segments
      const mockUserSegments = [
        {
          _id: 'user-segment-1',
          user: 'user-id',
          segment: {
            _id: 'segment-1',
            name: 'High Achievers',
            description: 'Students with excellent academic performance',
          },
          confidenceScore: 0.95,
        },
      ];

      UserSegment.find.mockImplementation(() => ({
        populate: () => ({
          sort: () => Promise.resolve(mockUserSegments),
        }),
      }));

      // Mock request and response objects
      const req = {
        user: { _id: 'user-id' },
      };

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      // Import and call the getUserSegments controller
      const { getUserSegments } = require('../controllers/segmentationController');
      await getUserSegments(req, res);

      // Check if the response was called with correct status and data
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockUserSegments);
    });
  });

  describe('GET /api/segmentation/segments', () => {
    it('should return all student segments', async () => {
      // Mock StudentSegment.find to return segments
      const mockSegments = [
        {
          _id: 'segment-1',
          name: 'High Achievers',
          description: 'Students with excellent academic performance',
          userCount: 10,
        },
        {
          _id: 'segment-2',
          name: 'Creative Thinkers',
          description: 'Students with interests in arts and literature',
          userCount: 5,
        },
      ];

      StudentSegment.find.mockImplementation(() => ({
        sort: () => Promise.resolve(mockSegments),
      }));

      // Mock request and response objects
      const req = {};
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      // Import and call the getAllSegments controller
      const { getAllSegments } = require('../controllers/segmentationController');
      await getAllSegments(req, res);

      // Check if the response was called with correct status and data
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockSegments);
    });
  });

  describe('POST /api/segmentation/segments', () => {
    it('should create a new student segment', async () => {
      // Mock StudentSegment to return a new segment
      const mockSegment = {
        _id: 'new-segment-id',
        name: 'New Segment',
        description: 'A new student segment',
        criteria: {
          interests: ['Science'],
        },
        save: jest.fn().mockResolvedValue({
          _id: 'new-segment-id',
          name: 'New Segment',
          description: 'A new student segment',
          criteria: {
            interests: ['Science'],
          },
        }),
      };

      // Mock the StudentSegment constructor
      StudentSegment.mockImplementation(() => mockSegment);

      // Mock request and response objects
      const req = {
        body: {
          name: 'New Segment',
          description: 'A new student segment',
          criteria: {
            interests: ['Science'],
          },
        },
      };

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      // Import and call the createSegment controller
      const { createSegment } = require('../controllers/segmentationController');
      await createSegment(req, res);

      // Check if the response was called with correct status and data
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        _id: 'new-segment-id',
        name: 'New Segment',
        description: 'A new student segment',
        criteria: {
          interests: ['Science'],
        },
      });
    });
  });
});