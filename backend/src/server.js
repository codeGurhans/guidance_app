const dotenv = require('dotenv');
const express = require('express');

// Load environment variables
dotenv.config();

const connectDB = require('./config/db');
const createDefaultSegments = require('./utils/createDefaultSegments');
const app = require('./app');

// Connect to MongoDB
connectDB().then(() => {
  // Create default segments
  createDefaultSegments();
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});