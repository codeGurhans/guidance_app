const mongoose = require('mongoose');
const Notification = require('./src/models/Notification');
const User = require('./src/models/User');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function sendTestNotifications() {
  try {
    // Get all users
    const users = await User.find({});
    
    if (users.length === 0) {
      console.log('No users found.');
      process.exit(1);
    }
    
    // Create sample notifications for each user
    const notifications = [];
    
    for (const user of users) {
      notifications.push({
        user: user._id,
        type: 'Application Deadline',
        title: 'Important: Application Deadline Approaching',
        message: 'The application deadline for XYZ University - B.Tech program is approaching in 3 days. Make sure to submit your application before the deadline.',
        priority: 'High',
        actionLinks: [{
          label: 'View College',
          url: '/colleges/xyz-university'
        }]
      });
      
      notifications.push({
        user: user._id,
        type: 'General',
        title: 'New Feature: Cutoff Predictor',
        message: 'We\'ve launched a new cutoff predictor tool to help you estimate admission cutoffs based on historical data. Try it out now!',
        priority: 'Medium',
        actionLinks: [{
          label: 'Try Now',
          url: '/cutoff-predictor'
        }]
      });
    }
    
    // Insert sample notifications
    const insertedNotifications = await Notification.insertMany(notifications);
    console.log(`Inserted ${insertedNotifications.length} test notifications`);
    
    console.log('Test notifications sent successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error sending test notifications:', error);
    process.exit(1);
  }
}

sendTestNotifications();