const User = require('../models/User');
const StudentSegment = require('../models/StudentSegment');
const UserSegment = require('../models/UserSegment');
const UserResponse = require('../models/UserResponse');
const Assessment = require('../models/Assessment');
const CareerPath = require('../models/CareerPath');

/**
 * @desc    Get analytics data for user segments
 * @route   GET /api/analytics/segment-analytics
 * @access  Private (Admin)
 * @param   {object} req - Express request object
 * @param   {object} res - Express response object
 * @returns {object} - Analytics data for user segments
 */
const getSegmentAnalytics = async (req, res) => {
  try {
    // Get total number of users
    const totalUsers = await User.countDocuments();
    
    // Get all segments with their user counts
    const segments = await StudentSegment.find().sort({ userCount: -1 });
    
    // Get user segmentation distribution
    const segmentDistribution = segments.map(segment => ({
      segmentId: segment._id,
      segmentName: segment.name,
      userCount: segment.userCount,
      percentage: totalUsers > 0 ? (segment.userCount / totalUsers * 100).toFixed(2) : 0,
    }));
    
    // Get recent user classifications
    const recentClassifications = await UserSegment.find()
      .populate('user', 'email createdAt')
      .populate('segment', 'name')
      .sort({ createdAt: -1 })
      .limit(10);
    
    res.status(200).json({
      totalUsers,
      segments: segmentDistribution,
      recentClassifications,
    });
  } catch (error) {
    console.error('Error in getSegmentAnalytics:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @desc    Get detailed analytics for a specific segment
 * @route   GET /api/analytics/segment/:id/analytics
 * @access  Private (Admin)
 * @param   {object} req - Express request object
 * @param   {object} res - Express response object
 * @returns {object} - Detailed analytics for a specific segment
 */
const getSegmentDetails = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get the segment
    const segment = await StudentSegment.findById(id);
    if (!segment) {
      return res.status(404).json({ message: 'Segment not found' });
    }
    
    // Get users in this segment
    const userSegments = await UserSegment.find({ segment: id })
      .populate('user', 'email age gender grade academicInterests location createdAt')
      .sort({ confidenceScore: -1 });
    
    // Calculate statistics
    const totalUsers = userSegments.length;
    const averageConfidence = userSegments.reduce((sum, userSeg) => 
      sum + userSeg.confidenceScore, 0) / totalUsers || 0;
    
    // Get demographic breakdown
    const ageGroups = {};
    const genders = {};
    const grades = {};
    const locations = {};
    
    userSegments.forEach(userSeg => {
      const user = userSeg.user;
      
      // Age groups
      if (user.age) {
        const ageGroup = Math.floor(user.age / 10) * 10;
        ageGroups[ageGroup] = (ageGroups[ageGroup] || 0) + 1;
      }
      
      // Gender
      if (user.gender) {
        genders[user.gender] = (genders[user.gender] || 0) + 1;
      }
      
      // Grade
      if (user.grade) {
        grades[user.grade] = (grades[user.grade] || 0) + 1;
      }
      
      // Location
      if (user.location) {
        locations[user.location] = (locations[user.location] || 0) + 1;
      }
    });
    
    res.status(200).json({
      segment,
      totalUsers,
      averageConfidence: averageConfidence.toFixed(2),
      demographics: {
        ageGroups,
        genders,
        grades,
        locations,
      },
      users: userSegments.slice(0, 20), // Limit to first 20 users
    });
  } catch (error) {
    console.error('Error in getSegmentDetails:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @desc    Get user analytics data
 * @route   GET /api/analytics/user/:userId
 * @access  Private
 * @param   {object} req - Express request object
 * @param   {object} res - Express response object
 * @returns {object} - Analytics data for a specific user
 */
const getUserAnalytics = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Verify user is requesting their own data or is admin
    if (req.user._id.toString() !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    // Get user assessments
    const userResponses = await UserResponse.find({ 
      user: userId, 
      isCompleted: true 
    }).populate('assessment', 'title questions').populate('categoryScores');
    
    // Calculate user progress metrics
    const totalAssessments = userResponses.length;
    const completedAssessments = userResponses.filter(ur => ur.isCompleted).length;
    
    // Calculate category scores over time
    const categoryTrends = {};
    const skillDevelopment = {};
    
    userResponses.forEach(response => {
      response.categoryScores.forEach(score => {
        if (!categoryTrends[score.category]) {
          categoryTrends[score.category] = [];
        }
        categoryTrends[score.category].push({
          assessmentId: response.assessment._id,
          assessmentTitle: response.assessment.title,
          score: score.score,
          date: response.endTime
        });
        
        // Track skill development
        if (!skillDevelopment[score.category]) {
          skillDevelopment[score.category] = {
            initialScore: score.score,
            currentScore: score.score,
            improvement: 0
          };
        } else {
          skillDevelopment[score.category].currentScore = score.score;
          skillDevelopment[score.category].improvement = 
            skillDevelopment[score.category].currentScore - skillDevelopment[score.category].initialScore;
        }
      });
    });
    
    // Calculate overall progress
    const overallProgress = totalAssessments > 0 ? 
      Math.round((completedAssessments / totalAssessments) * 100) : 0;
    
    // Get career paths explored
    const careerPaths = await CareerPath.find({ 
      'categories': { $in: Object.keys(skillDevelopment) } 
    }).limit(10);
    
    res.status(200).json({
      progress: {
        totalAssessments,
        completedAssessments,
        overallProgress
      },
      categoryTrends,
      skillDevelopment,
      careerPathsExplored: careerPaths.length,
      recommendedCareerPaths: careerPaths.slice(0, 5)
    });
  } catch (error) {
    console.error('Error in getUserAnalytics:', error);
    res.status(500).json({ message: 'Server error getting user analytics' });
  }
};

/**
 * @desc    Get comparative analytics for multiple users or segments
 * @route   POST /api/analytics/comparative
 * @access  Private (Admin)
 * @param   {object} req - Express request object
 * @param   {object} res - Express response object
 * @returns {object} - Comparative analytics data
 */
const getComparativeAnalytics = async (req, res) => {
  try {
    const { userIds, segmentIds } = req.body;
    
    // Validate request
    if ((!userIds || userIds.length === 0) && (!segmentIds || segmentIds.length === 0)) {
      return res.status(400).json({ message: 'Please provide userIds or segmentIds for comparison' });
    }
    
    let usersToCompare = [];
    
    // Get users from user IDs
    if (userIds && userIds.length > 0) {
      const userDocs = await User.find({ _id: { $in: userIds } });
      usersToCompare = [...usersToCompare, ...userDocs];
    }
    
    // Get users from segment IDs
    if (segmentIds && segmentIds.length > 0) {
      const userSegments = await UserSegment.find({ 
        segment: { $in: segmentIds } 
      }).populate('user');
      
      const segmentUsers = userSegments.map(us => us.user);
      usersToCompare = [...usersToCompare, ...segmentUsers];
    }
    
    // Remove duplicates
    const uniqueUsers = [...new Map(usersToCompare.map(user => [user._id.toString(), user])).values()];
    
    // Get analytics for each user
    const userAnalyticsPromises = uniqueUsers.map(user => getUserAnalyticsForUser(user));
    const userAnalytics = await Promise.all(userAnalyticsPromises);
    
    // Aggregate comparative data
    const aggregatedData = aggregateComparativeData(userAnalytics);
    
    res.status(200).json({
      usersCompared: uniqueUsers.length,
      comparativeData: aggregatedData
    });
  } catch (error) {
    console.error('Error in getComparativeAnalytics:', error);
    res.status(500).json({ message: 'Server error getting comparative analytics' });
  }
};

/**
 * @desc    Helper function to get analytics for a specific user
 * @param   {object} user - User document
 * @returns {object} - Analytics data for the user
 */
const getUserAnalyticsForUser = async (user) => {
  try {
    const userResponses = await UserResponse.find({ 
      user: user._id, 
      isCompleted: true 
    }).populate('assessment', 'title questions').populate('categoryScores');
    
    const totalAssessments = userResponses.length;
    const completedAssessments = userResponses.filter(ur => ur.isCompleted).length;
    
    // Calculate average scores by category
    const categoryScores = {};
    let totalScoreSum = 0;
    
    userResponses.forEach(response => {
      totalScoreSum += response.score || 0;
      
      response.categoryScores.forEach(score => {
        if (!categoryScores[score.category]) {
          categoryScores[score.category] = {
            total: 0,
            count: 0,
            average: 0
          };
        }
        categoryScores[score.category].total += score.score;
        categoryScores[score.category].count += 1;
      });
    });
    
    // Calculate averages
    Object.keys(categoryScores).forEach(category => {
      categoryScores[category].average = 
        categoryScores[category].total / categoryScores[category].count;
    });
    
    const averageScore = totalAssessments > 0 ? totalScoreSum / totalAssessments : 0;
    
    return {
      userId: user._id,
      email: user.email,
      age: user.age,
      gender: user.gender,
      grade: user.grade,
      location: user.location,
      totalAssessments,
      completedAssessments,
      averageScore,
      categoryScores
    };
  } catch (error) {
    console.error('Error in getUserAnalyticsForUser:', error);
    return null;
  }
};

/**
 * @desc    Helper function to aggregate comparative data
 * @param   {array} userAnalytics - Array of user analytics data
 * @returns {object} - Aggregated comparative data
 */
const aggregateComparativeData = (userAnalytics) => {
  // Filter out any null analytics
  const validAnalytics = userAnalytics.filter(analytics => analytics !== null);
  
  if (validAnalytics.length === 0) {
    return {};
  }
  
  // Aggregate category scores
  const aggregatedCategoryScores = {};
  
  validAnalytics.forEach(analytics => {
    Object.keys(analytics.categoryScores).forEach(category => {
      if (!aggregatedCategoryScores[category]) {
        aggregatedCategoryScores[category] = {
          totalAverage: 0,
          userCount: 0,
          minScore: Infinity,
          maxScore: -Infinity
        };
      }
      
      const categoryData = analytics.categoryScores[category];
      aggregatedCategoryScores[category].totalAverage += categoryData.average;
      aggregatedCategoryScores[category].userCount += 1;
      aggregatedCategoryScores[category].minScore = 
        Math.min(aggregatedCategoryScores[category].minScore, categoryData.average);
      aggregatedCategoryScores[category].maxScore = 
        Math.max(aggregatedCategoryScores[category].maxScore, categoryData.average);
    });
  });
  
  // Calculate final averages
  Object.keys(aggregatedCategoryScores).forEach(category => {
    const data = aggregatedCategoryScores[category];
    aggregatedCategoryScores[category].averageScore = data.totalAverage / data.userCount;
  });
  
  return {
    categoryScores: aggregatedCategoryScores,
    totalUsers: validAnalytics.length
  };
};

module.exports = {
  getSegmentAnalytics,
  getSegmentDetails,
  getUserAnalytics,
  getComparativeAnalytics
};;