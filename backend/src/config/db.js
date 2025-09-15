const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Ensure we're using IPv4 localhost
    const mongoUri = process.env.MONGO_URI.replace('localhost', '127.0.0.1');
    
    const conn = await mongoose.connect(mongoUri, {
      // Remove deprecated options
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    console.log('Please make sure MongoDB is running or use a MongoDB Atlas connection string');
    // Don't exit the process, just log the error
    // process.exit(1);
  }
};

module.exports = connectDB;