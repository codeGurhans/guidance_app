const request = require('supertest');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const app = require('../app');
const User = require('../models/User');
const Notification = require('../models/Notification');

describe('Notifications API', () => {
  let token;
  let userId;
  
  beforeAll(async () => {
    // Connect to test database
    const mongoUri = process.env.MONGO_URI_TEST || 'mongodb://localhost:27017/guidancehub_test';
    await mongoose.connect(mongoUri);
    
    // Create a test user
    const user = new User({
      email: 'notification@test.com',
      password: await bcrypt.hash('password123', 10)
    });
    
    const savedUser = await user.save();
    userId = savedUser._id;
    
    // Login to get token
    const res = await request(app)
      .post('/api/users/login')
      .send({
        email: 'notification@test.com',
        password: 'password123'
      });
    
    token = res.body.token;
    
    // Create a test notification
    const notification = new Notification({
      user: userId,
      type: 'Application Deadline',
      title: 'Test Notification',
      message: 'This is a test notification',
      priority: 'High'
    });
    
    await notification.save();
  }, 10000); // 10 second timeout
  
  afterAll(async () => {
    // Clean up test data
    await User.deleteMany({});
    await Notification.deleteMany({});
    await mongoose.connection.close();
  }, 10000); // 10 second timeout
  
  describe('GET /api/notifications', () => {
    it('should get user notifications', async () => {
      const res = await request(app)
        .get('/api/notifications')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
      
      expect(res.body.notifications).toBeDefined();
      expect(res.body.notifications.length).toBe(1);
      expect(res.body.notifications[0].title).toBe('Test Notification');
    }, 10000); // 10 second timeout
  });
  
  describe('PUT /api/notifications/:id/read', () => {
    it('should mark notification as read', async () => {
      // First get the notification ID
      const notificationsRes = await request(app)
        .get('/api/notifications')
        .set('Authorization', `Bearer ${token}`);
      
      const notificationId = notificationsRes.body.notifications[0]._id;
      
      const res = await request(app)
        .put(`/api/notifications/${notificationId}/read`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
      
      expect(res.body.isRead).toBe(true);
    }, 10000); // 10 second timeout
  });
  
  describe('PUT /api/notifications/read-all', () => {
    it('should mark all notifications as read', async () => {
      // Create another unread notification
      const notification = new Notification({
        user: userId,
        type: 'General',
        title: 'Another Test Notification',
        message: 'This is another test notification',
        priority: 'Medium'
      });
      
      await notification.save();
      
      const res = await request(app)
        .put('/api/notifications/read-all')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
      
      expect(res.body.message).toBe('All notifications marked as read');
      
      // Verify all notifications are now read
      const notificationsRes = await request(app)
        .get('/api/notifications')
        .set('Authorization', `Bearer ${token}`);
      
      const allRead = notificationsRes.body.notifications.every(n => n.isRead);
      expect(allRead).toBe(true);
    }, 10000); // 10 second timeout
  });
  
  describe('DELETE /api/notifications/:id', () => {
    it('should delete a notification', async () => {
      // First get the notification ID
      const notificationsRes = await request(app)
        .get('/api/notifications')
        .set('Authorization', `Bearer ${token}`);
      
      const notificationId = notificationsRes.body.notifications[0]._id;
      
      await request(app)
        .delete(`/api/notifications/${notificationId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
      
      // Verify notification is deleted
      const checkRes = await request(app)
        .get('/api/notifications')
        .set('Authorization', `Bearer ${token}`);
      
      const notificationExists = checkRes.body.notifications.some(n => n._id === notificationId);
      expect(notificationExists).toBe(false);
    }, 10000); // 10 second timeout
  });
});