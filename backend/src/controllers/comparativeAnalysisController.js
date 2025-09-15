const mongoose = require('mongoose');
const UserResponse = require('../models/UserResponse');
const Assessment = require('../models/Assessment');
const CareerPath = require('../models/CareerPath');

/**
 * @desc    Get comparative analysis for different career paths
 * @route   GET /api/quiz/results/:id/comparative-analysis
 * @access  Private
 * @param   {object} req - Express request object
 * @param   {object} res - Express response object
 * @returns {object} - Comparative analysis data
 */
const getComparativeAnalysis = async (req, res) => {
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
    
    // Generate comparative analysis data
    const analysisData = generateComparativeAnalysis(userResponse, assessment);
    
    res.status(200).json(analysisData);
  } catch (error) {
    console.error('Error in getComparativeAnalysis:', error);
    res.status(500).json({ message: 'Server error getting comparative analysis.', details: error.message });
  }
};

/**
 * @desc    Generate comparative analysis data
 * @param   {object} userResponse - User response object
 * @param   {object} assessment - Assessment object
 * @returns {object} - Comparative analysis data
 */
const generateComparativeAnalysis = (userResponse, assessment) => {
  // Get top categories based on user scores
  const topCategories = userResponse.categoryScores
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(score => score.category);
  
  // Generate analysis for top categories
  const categoryAnalysis = topCategories.map(category => ({
    category,
    score: userResponse.categoryScores.find(s => s.category === category)?.score || 0,
    // In a real implementation, we would get career paths related to this category
    relatedCareers: getRelatedCareers(category)
  }));
  
  // Overall analysis
  const overallAnalysis = {
    totalScore: userResponse.score,
    maxPossibleScore: assessment.questions.length,
    percentageScore: Math.round((userResponse.score / assessment.questions.length) * 100),
    strengths: identifyStrengths(userResponse),
    areasForImprovement: identifyAreasForImprovement(userResponse),
    recommendedPaths: generateRecommendations(userResponse)
  };
  
  return {
    topCategories: categoryAnalysis,
    overallAnalysis
  };
};

/**
 * @desc    Get related careers for a category
 * @param   {string} category - Category name
 * @returns {array} - Array of related careers
 */
const getRelatedCareers = (category) => {
  // In a real implementation, we would query the database for careers related to this category
  // For now, we'll return mock data
  const mockCareers = [
    {
      id: 'career-1',
      title: `${category} Specialist`,
      description: `A specialist in ${category} field`,
      averageSalary: '$70,000',
      jobGrowth: 'Average'
    },
    {
      id: 'career-2',
      title: `Senior ${category} Professional`,
      description: `An experienced professional in ${category} field`,
      averageSalary: '$90,000',
      jobGrowth: 'Fast'
    }
  ];
  
  return mockCareers;
};

/**
 * @desc    Identify user's strengths
 * @param   {object} userResponse - User response object
 * @returns {array} - Array of strengths
 */
const identifyStrengths = (userResponse) => {
  // In a real implementation, we would analyze the user's responses to identify strengths
  // For now, we'll return mock data
  return [
    'Strong analytical skills',
    'Good problem-solving abilities',
    'Effective communication'
  ];
};

/**
 * @desc    Identify areas for improvement
 * @param   {object} userResponse - User response object
 * @returns {array} - Array of areas for improvement
 */
const identifyAreasForImprovement = (userResponse) => {
  // In a real implementation, we would analyze the user's responses to identify areas for improvement
  // For now, we'll return mock data
  return [
    'Time management',
    'Technical skills in specific areas',
    'Leadership experience'
  ];
};

/**
 * @desc    Generate career recommendations
 * @param   {object} userResponse - User response object
 * @returns {array} - Array of recommendations
 */
const generateRecommendations = (userResponse) => {
  // In a real implementation, we would generate personalized recommendations
  // For now, we'll return mock data
  return [
    {
      type: 'Education',
      recommendation: 'Consider pursuing a degree in Computer Science',
      priority: 'High'
    },
    {
      type: 'Skill Development',
      recommendation: 'Improve your programming skills through online courses',
      priority: 'Medium'
    },
    {
      type: 'Experience',
      recommendation: 'Gain practical experience through internships',
      priority: 'High'
    }
  ];
};

module.exports = {
  getComparativeAnalysis
};