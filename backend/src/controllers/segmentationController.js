const User = require('../models/User');
const StudentSegment = require('../models/StudentSegment');
const UserSegment = require('../models/UserSegment');

/**
 * @desc    Classify a student based on their profile
 * @route   POST /api/segmentation/classify
 * @access  Private
 * @param   {object} req - Express request object
 * @param   {object} res - Express response object
 * @returns {object} - Classification result
 */
const classifyStudent = async (req, res) => {
  try {
    // Get the current user
    const user = req.user;
    
    // Get all segments
    const segments = await StudentSegment.find();
    
    // Find the best matching segment for the user
    let bestSegment = null;
    let highestScore = 0;
    
    for (const segment of segments) {
      const score = calculateSegmentMatchScore(user, segment);
      if (score > highestScore) {
        highestScore = score;
        bestSegment = segment;
      }
    }
    
    // If we found a matching segment, save the classification
    if (bestSegment) {
      try {
        // Check if the user is already classified in this segment
        const existingClassification = await UserSegment.findOne({
          user: user._id,
          segment: bestSegment._id,
        });
        
        if (!existingClassification) {
          // Create a new classification
          await UserSegment.create({
            user: user._id,
            segment: bestSegment._id,
            confidenceScore: highestScore,
          });
          
          // Update the segment's user count
          await StudentSegment.findByIdAndUpdate(
            bestSegment._id,
            { $inc: { userCount: 1 } },
            { new: true }
          );
        }
      } catch (dbError) {
        console.error('Database error during classification:', dbError);
        // Continue with the response even if we can't save the classification
      }
    }
    
    res.status(200).json({
      segment: bestSegment,
      confidenceScore: highestScore,
    });
  } catch (error) {
    console.error('Error in classifyStudent:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @desc    Get user's segments
 * @route   GET /api/segmentation/user-segments
 * @access  Private
 * @param   {object} req - Express request object
 * @param   {object} res - Express response object
 * @returns {object} - User's segments
 */
const getUserSegments = async (req, res) => {
  try {
    // Get the current user
    const user = req.user;
    
    // Find all segments for this user
    const userSegments = await UserSegment.find({ user: user._id })
      .populate('segment')
      .sort({ confidenceScore: -1 });
    
    res.status(200).json(userSegments);
  } catch (error) {
    console.error('Error in getUserSegments:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @desc    Get all student segments
 * @route   GET /api/segmentation/segments
 * @access  Public
 * @param   {object} req - Express request object
 * @param   {object} res - Express response object
 * @returns {object} - All student segments
 */
const getAllSegments = async (req, res) => {
  try {
    const segments = await StudentSegment.find().sort({ userCount: -1 });
    res.status(200).json(segments);
  } catch (error) {
    console.error('Error in getAllSegments:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @desc    Create a new student segment
 * @route   POST /api/segmentation/segments
 * @access  Private (Admin)
 * @param   {object} req - Express request object
 * @param   {object} res - Express response object
 * @returns {object} - Created segment
 */
const createSegment = async (req, res) => {
  try {
    const { name, description, criteria } = req.body;
    
    const segment = new StudentSegment({
      name,
      description,
      criteria,
    });
    
    const savedSegment = await segment.save();
    res.status(201).json(savedSegment);
  } catch (error) {
    console.error('Error in createSegment:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @desc    Calculate how well a user matches a segment
 * @param   {object} user - User object
 * @param   {object} segment - Segment object
 * @returns {number} - Match score between 0 and 1
 */
const calculateSegmentMatchScore = (user, segment) => {
  let score = 0;
  let totalCriteria = 0;
  
  // Check academic performance criteria
  if (segment.criteria.academicPerformance) {
    totalCriteria++;
    const { minGPA, maxGPA } = segment.criteria.academicPerformance;
    
    // For simplicity, we'll assume a GPA field exists on the user
    // In a real implementation, this would be calculated from user's academic history
    const userGPA = user.gpa || 0;
    
    if ((!minGPA || userGPA >= minGPA) && (!maxGPA || userGPA <= maxGPA)) {
      score++;
    }
  }
  
  // Check interests criteria
  if (segment.criteria.interests && segment.criteria.interests.length > 0) {
    totalCriteria++;
    const userInterests = user.academicInterests || [];
    
    // Calculate overlap between user interests and segment interests
    const overlap = userInterests.filter(interest => 
      segment.criteria.interests.includes(interest)
    ).length;
    
    if (overlap > 0) {
      score += overlap / segment.criteria.interests.length;
    }
  }
  
  // Check location criteria
  if (segment.criteria.location) {
    totalCriteria++;
    if (user.location && user.location.includes(segment.criteria.location)) {
      score++;
    }
  }
  
  // Check financial status criteria
  if (segment.criteria.financialStatus) {
    totalCriteria++;
    // For simplicity, we'll assume a financialStatus field exists on the user
    // In a real implementation, this would be determined from user's financial information
    if (user.financialStatus === segment.criteria.financialStatus) {
      score++;
    }
  }
  
  // Return the match score as a percentage
  return totalCriteria > 0 ? score / totalCriteria : 0;
};

module.exports = {
  classifyStudent,
  getUserSegments,
  getAllSegments,
  createSegment,
};