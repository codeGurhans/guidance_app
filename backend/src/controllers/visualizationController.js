const mongoose = require('mongoose');
const UserResponse = require('../models/UserResponse');
const Assessment = require('../models/Assessment');

/**
 * @desc    Generate visualization data for quiz results
 * @route   GET /api/quiz/results/:id/visualization
 * @access  Private
 * @param   {object} req - Express request object
 * @param   {object} res - Express response object
 * @returns {object} - Visualization data for quiz results
 */
const getVisualizationData = async (req, res) => {
  try {
    // req.user is set in the auth middleware
    const userId = req.user._id;
    const assessmentId = req.params.id;
    
    let assessment;
    // Handle non-ObjectId for default quiz
    if (assessmentId === '1') {
      assessment = await Assessment.findOne({ isActive: true });
    } else if (mongoose.Types.ObjectId.isValid(assessmentId)) {
      assessment = await Assessment.findById(assessmentId);
    } else {
      // Try to find by string ID
      assessment = await Assessment.findOne({ _id: assessmentId, isActive: true });
    }

    if (!assessment) {
      return res.status(404).json({ message: 'Assessment not found' });
    }

    // Use the found assessment's actual _id for relations
    const actualAssessmentId = assessment._id;

    // Find the completed user response
    const userResponse = await UserResponse.findOne({
      user: userId,
      assessment: actualAssessmentId,
      isCompleted: true
    }).populate('assessment').populate('responses.question');
    
    if (!userResponse) {
      return res.status(404).json({ message: 'Completed assessment not found' });
    }
    
    // Generate visualization data
    const visualizationData = generateVisualizationData(userResponse, assessment);
    
    res.status(200).json(visualizationData);
  } catch (error) {
    console.error('Error in getVisualizationData:', error);
    res.status(500).json({ message: 'Server error getting visualization data.', details: error.message });
  }
};

/**
 * @desc    Generate visualization data from user response
 * @param   {object} userResponse - User response object
 * @param   {object} assessment - Assessment object
 * @returns {object} - Visualization data
 */
const generateVisualizationData = (userResponse, assessment) => {
  // Category scores chart data
  const categoryScoresData = userResponse.categoryScores.map(score => ({
    category: score.category,
    score: score.score,
    // Normalize score to 0-100 scale for visualization
    normalizedScore: Math.min(100, Math.max(0, score.score))
  }));
  
  // Progress over time data (if we had timestamped responses)
  const progressOverTimeData = generateProgressOverTimeData(userResponse);
  
  // Difficulty distribution data
  const difficultyDistributionData = generateDifficultyDistributionData(userResponse, assessment);
  
  // Time distribution data
  const timeDistributionData = generateTimeDistributionData(userResponse);
  
  // Overall statistics
  const overallStats = {
    totalQuestions: assessment.questions.length,
    answeredQuestions: userResponse.responses.length,
    totalTime: calculateTotalTime(userResponse),
    averageTimePerQuestion: calculateAverageTimePerQuestion(userResponse),
    score: userResponse.score,
    maxPossibleScore: assessment.questions.length
  };
  
  return {
    categoryScores: categoryScoresData,
    progressOverTime: progressOverTimeData,
    difficultyDistribution: difficultyDistributionData,
    timeDistribution: timeDistributionData,
    overallStats
  };
};

/**
 * @desc    Generate progress over time data
 * @param   {object} userResponse - User response object
 * @returns {array} - Progress over time data points
 */
const generateProgressOverTimeData = (userResponse) => {
  // For now, we'll create a simple progression
  // In a real implementation, we would track scores over time
  const dataPoints = [];
  const totalQuestions = userResponse.responses.length;
  
  for (let i = 1; i <= totalQuestions; i++) {
    // Simulate progress increasing over time
    const progress = Math.round((i / totalQuestions) * 100);
    dataPoints.push({
      questionNumber: i,
      progress,
      timestamp: userResponse.startTime.getTime() + (i * 60000) // Every minute
    });
  }
  
  return dataPoints;
};

/**
 * @desc    Generate difficulty distribution data
 * @param   {object} userResponse - User response object
 * @param   {object} assessment - Assessment object
 * @returns {array} - Difficulty distribution data
 */
const generateDifficultyDistributionData = (userResponse, assessment) => {
  const difficultyCounts = {
    1: 0, // Very Easy
    2: 0, // Easy
    3: 0, // Medium
    4: 0, // Hard
    5: 0  // Very Hard
  };
  
  userResponse.responses.forEach(response => {
    const question = assessment.questions.find(q => 
      q._id.toString() === response.question.toString()
    );
    
    if (question && question.difficulty) {
      difficultyCounts[question.difficulty]++;
    }
  });
  
  return Object.keys(difficultyCounts).map(difficulty => ({
    difficulty: parseInt(difficulty),
    count: difficultyCounts[difficulty],
    label: getDifficultyLabel(parseInt(difficulty))
  }));
};

/**
 * @desc    Generate time distribution data
 * @param   {object} userResponse - User response object
 * @returns {array} - Time distribution data
 */
const generateTimeDistributionData = (userResponse) => {
  const timeRanges = {
    '0-30s': 0,
    '30-60s': 0,
    '1-2m': 0,
    '2-5m': 0,
    '5m+': 0
  };
  
  userResponse.responses.forEach(response => {
    if (response.timeTaken) {
      if (response.timeTaken <= 30) {
        timeRanges['0-30s']++;
      } else if (response.timeTaken <= 60) {
        timeRanges['30-60s']++;
      } else if (response.timeTaken <= 120) {
        timeRanges['1-2m']++;
      } else if (response.timeTaken <= 300) {
        timeRanges['2-5m']++;
      } else {
        timeRanges['5m+']++;
      }
    }
  });
  
  return Object.keys(timeRanges).map(range => ({
    range,
    count: timeRanges[range]
  }));
};

/**
 * @desc    Calculate total time spent on assessment
 * @param   {object} userResponse - User response object
 * @returns {number} - Total time in seconds
 */
const calculateTotalTime = (userResponse) => {
  if (userResponse.startTime && userResponse.endTime) {
    return Math.round((userResponse.endTime - userResponse.startTime) / 1000);
  }
  return 0;
};

/**
 * @desc    Calculate average time per question
 * @param   {object} userResponse - User response object
 * @returns {number} - Average time in seconds
 */
const calculateAverageTimePerQuestion = (userResponse) => {
  const totalTime = calculateTotalTime(userResponse);
  if (userResponse.responses.length > 0) {
    return Math.round(totalTime / userResponse.responses.length);
  }
  return 0;
};

/**
 * @desc    Get difficulty label for visualization
 * @param   {number} difficulty - Difficulty level (1-5)
 * @returns {string} - Difficulty label
 */
const getDifficultyLabel = (difficulty) => {
  switch (difficulty) {
    case 1: return 'Very Easy';
    case 2: return 'Easy';
    case 3: return 'Medium';
    case 4: return 'Hard';
    case 5: return 'Very Hard';
    default: return 'Unknown';
  }
};

module.exports = {
  getVisualizationData
};