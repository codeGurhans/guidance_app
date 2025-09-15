const mongoose = require('mongoose');

// MongoDB connection string using IPv4 localhost
const mongoUri = 'mongodb://127.0.0.1:27017/guidance-platform';

console.log('Testing MongoDB connection...');

mongoose.connect(mongoUri)
  .then(() => {
    console.log('Successfully connected to MongoDB');
    console.log('Connection details:', {
      host: mongoose.connection.host,
      port: mongoose.connection.port,
      name: mongoose.connection.name
    });
    
    // Close the connection
    mongoose.connection.close();
    console.log('Connection closed');
  })
  .catch((error) => {
    console.error('Failed to connect to MongoDB:');
    console.error('Error:', error.message);
    console.log('\nTroubleshooting steps:');
    console.log('1. Make sure MongoDB is running');
    console.log('2. Check if MongoDB is listening on port 27017');
    console.log('3. Verify that the MongoDB service is not blocked by firewall');
    console.log('4. Try connecting with MongoDB Compass or mongo shell');
  });