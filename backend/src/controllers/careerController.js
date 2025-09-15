const CareerPath = require('../models/CareerPath');
const UserResponse = require('../models/UserResponse');
const Assessment = require('../models/Assessment');
const mongoose = require('mongoose');

// Get all active career paths
/**
 * @desc    Get all active career paths
 * @route   GET /api/careers
 * @access  Public
 * @param   {object} req - Express request object
 * @param   {object} res - Express response object
 * @returns {object} - Array of career paths
 */
const getCareerPaths = async (req, res) => {
  try {
    const careerPaths = await CareerPath.find({ isActive: true });
    res.status(200).json(careerPaths);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get a specific career path by ID
/**
 * @desc    Get a specific career path by ID
 * @route   GET /api/careers/:id
 * @access  Public
 * @param   {object} req - Express request object
 * @param   {object} res - Express response object
 * @returns {object} - Career path object
 */
const getCareerPathById = async (req, res) => {
  try {
    const careerPath = await CareerPath.findById(req.params.id);
    
    if (!careerPath || !careerPath.isActive) {
      return res.status(404).json({ message: 'Career path not found' });
    }
    
    res.status(200).json(careerPath);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get career path recommendations based on user assessment
/**
 * @desc    Get career path recommendations based on user assessment
 * @route   GET /api/careers/recommendations/:assessmentId
 * @access  Private
 * @param   {object} req - Express request object
 * @param   {object} res - Express response object
 * @returns {object} - Array of recommended career paths
 */
const getRecommendations = async (req, res) => {
  try {
    // req.user is set in the auth middleware
    const userId = req.user._id;
    const assessmentId = req.params.assessmentId;
    
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

    // Get the user's completed assessment
    const userResponse = await UserResponse.findOne({
      user: userId,
      assessment: actualAssessmentId,
      isCompleted: true
    }).populate('assessment');
    
    if (!userResponse) {
      return res.status(404).json({ message: 'Completed assessment not found' });
    }
    
    // Get all active career paths
    const careerPaths = await CareerPath.find({ isActive: true });
    
    // Score each career path based on user's category scores
    const userCategoryScores = {};
    userResponse.categoryScores.forEach(score => {
      userCategoryScores[score.category] = {
        score: score.score,
        averageScore: score.averageScore || 0,
        questionCount: score.questionCount || 1
      };
    });
    
    const scoredCareerPaths = careerPaths.map(careerPath => {
      let matchScore = 0;
      let matchedCategories = 0;
      let totalWeight = 0;

      const userCategories = Object.keys(userCategoryScores);

      careerPath.categories.forEach(careerCategory => {
          userCategories.forEach(userCategory => {
              const cleanCareerCategory = careerCategory.toLowerCase();
              const cleanUserCategory = userCategory.toLowerCase();

              // Perfect match gets a bonus
              if (cleanCareerCategory === cleanUserCategory) {
                  const userScore = userCategoryScores[userCategory].score;
                  const questionCount = userCategoryScores[userCategory].questionCount;
                  // Weight by number of questions in the category for more reliable scores
                  const weight = Math.log(questionCount + 1); // Logarithmic weighting
                  matchScore += userScore * 1.5 * weight;
                  matchedCategories++;
                  totalWeight += weight;
              }
              // Partial match gets partial score
              else if (cleanCareerCategory.includes(cleanUserCategory) || cleanUserCategory.includes(cleanCareerCategory)) {
                  const userScore = userCategoryScores[userCategory].score;
                  const questionCount = userCategoryScores[userCategory].questionCount;
                  const weight = Math.log(questionCount + 1) * 0.5; // Reduced weight for partial matches
                  matchScore += userScore * 0.5 * weight;
                  totalWeight += weight;
              }
          });
      });

      // Add a bonus based on the number of matched categories
      if (matchedCategories > 1 && totalWeight > 0) {
          matchScore *= (1 + (matchedCategories - 1) * 0.1); // 10% bonus for each additional match
      }

      // Normalize score by total weight for fair comparison
      const normalizedScore = totalWeight > 0 ? matchScore / totalWeight : matchScore;

      return {
        ...careerPath.toObject(),
        matchScore: normalizedScore,
        matchedCategories: matchedCategories
      };
    });
    
    // Sort by match score (highest first)
    scoredCareerPaths.sort((a, b) => b.matchScore - a.matchScore);
    
    // Return top 5 recommendations
    const recommendations = scoredCareerPaths.slice(0, 5);
    
    res.status(200).json(recommendations);
  } catch (error) {
    console.error('Error in getRecommendations:', error);
    res.status(500).json({ message: 'Server error getting recommendations.', details: error.message });
  }
};

// Compare multiple career paths
/**
 * @desc    Compare multiple career paths
 * @route   POST /api/careers/compare
 * @access  Public
 * @param   {object} req - Express request object
 * @param   {object} res - Express response object
 * @returns {object} - Comparison data for career paths
 */
const compareCareerPaths = async (req, res) => {
  try {
    const { careerPathIds } = req.body;
    
    if (!careerPathIds || !Array.isArray(careerPathIds) || careerPathIds.length === 0) {
      return res.status(400).json({ message: 'Please provide career path IDs to compare' });
    }
    
    // Get the specified career paths
    const careerPaths = await CareerPath.find({
      _id: { $in: careerPathIds },
      isActive: true
    });
    
    if (careerPaths.length !== careerPathIds.length) {
      return res.status(404).json({ message: 'One or more career paths not found' });
    }
    
    // Prepare comparison data
    const comparisonData = {
      careerPaths: careerPaths.map(cp => ({
        id: cp._id,
        title: cp.title,
        description: cp.description,
        educationLevel: cp.educationLevel,
        salaryRange: cp.salaryRange,
        jobGrowth: cp.jobGrowth,
        requiredSkills: cp.requiredSkills
      })),
      comparisonMetrics: [
        'Education Level',
        'Salary Range',
        'Job Growth',
        'Required Skills'
      ]
    };
    
    res.status(200).json(comparisonData);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getCareerPaths,
  getCareerPathById,
  getRecommendations,
  compareCareerPaths
};