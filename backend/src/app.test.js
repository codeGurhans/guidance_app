const request = require('supertest');
const app = require('./app');

describe('App', () => {
  it('should return 404 for non-existent routes', async () => {
    await request(app).get('/api').expect(404);
  });

  it('should return 200 for health check endpoint', async () => {
    await request(app).get('/api/health').expect(200);
  });
});