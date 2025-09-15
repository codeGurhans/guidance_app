const request = require('supertest');
const app = require('../app');
const CareerPath = require('../models/CareerPath');
const UserResponse = require('../models/UserResponse');

// Mock the models
jest.mock('../models/CareerPath');
jest.mock('../models/UserResponse');

describe('Career API', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('GET /api/careers', () => {
    it('should get all active career paths', async () => {
      const mockCareerPaths = [
        {
          _id: '1',
          title: 'Software Engineer',
          description: 'Description 1',
          isActive: true
        },
        {
          _id: '2',
          title: 'Data Scientist',
          description: 'Description 2',
          isActive: true
        }
      ];

      CareerPath.find.mockResolvedValue(mockCareerPaths);

      const response = await request(app)
        .get('/api/careers')
        .expect(200);

      expect(response.body).toHaveLength(2);
      expect(CareerPath.find).toHaveBeenCalledWith({ isActive: true });
    });
  });

  describe('GET /api/careers/:id', () => {
    it('should get a specific career path by ID', async () => {
      const mockCareerPath = {
        _id: '1',
        title: 'Software Engineer',
        description: 'Description 1',
        isActive: true
      };

      CareerPath.findById.mockResolvedValue(mockCareerPath);

      const response = await request(app)
        .get('/api/careers/1')
        .expect(200);

      expect(response.body).toHaveProperty('_id', '1');
      expect(response.body).toHaveProperty('title', 'Software Engineer');
    });

    it('should return 404 if career path not found', async () => {
      CareerPath.findById.mockResolvedValue(null);

      await request(app)
        .get('/api/careers/999')
        .expect(404);
    });
  });
});