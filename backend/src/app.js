const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const userRoutes = require('./routes/userRoutes');
const quizRoutes = require('./routes/quizRoutes');
const careerRoutes = require('./routes/careerRoutes');
const collegeRoutes = require('./routes/collegeRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const segmentationRoutes = require('./routes/segmentationRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const visualizationRoutes = require('./routes/visualizationRoutes');
const comparativeAnalysisRoutes = require('./routes/comparativeAnalysisRoutes');
const admissionEventRoutes = require('./routes/admissionEventRoutes');
const applicationRoutes = require('./routes/applicationRoutes');
const cutoffRoutes = require('./routes/cutoffRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/users', userRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/careers', careerRoutes);
app.use('/api/colleges', collegeRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/segmentation', segmentationRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/visualization', visualizationRoutes);
app.use('/api/comparative-analysis', comparativeAnalysisRoutes);
app.use('/api/admission-events', admissionEventRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/cutoff', cutoffRoutes);
app.use('/api/notifications', notificationRoutes);

// Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({ message: 'Server is running!' });
});

module.exports = app;