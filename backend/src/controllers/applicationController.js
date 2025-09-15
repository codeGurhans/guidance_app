const StudentApplication = require('../models/StudentApplication');
const College = require('../models/College');
const User = require('../models/User');

// Check eligibility for a program
/**
 * @desc    Check eligibility for a program
 * @route   POST /api/eligibility/check
 * @access  Private
 * @param   {object} req - Express request object
 * @param   {object} res - Express response object
 * @returns {object} - Eligibility result
 */
const checkEligibility = async (req, res) => {
  try {
    const { collegeId, programName, academicScore, testScores } = req.body;
    const userId = req.user._id;
    
    // Validate required fields
    if (!collegeId || !programName || academicScore === undefined) {
      return res.status(400).json({ message: 'College ID, program name, and academic score are required' });
    }
    
    // Get college details
    const college = await College.findById(collegeId);
    if (!college) {
      return res.status(404).json({ message: 'College not found' });
    }
    
    // Find the program in college programs
    const program = college.programs.find(p => p.name.toLowerCase() === programName.toLowerCase());
    if (!program) {
      return res.status(404).json({ message: 'Program not found in this college' });
    }
    
    // Get user details
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check eligibility criteria
    let isEligible = true;
    let ineligibilityReasons = [];
    
    // Check GPA/academic score
    if (college.admissionRequirements && college.admissionRequirements.gpa) {
      if (academicScore < college.admissionRequirements.gpa) {
        isEligible = false;
        ineligibilityReasons.push(`Academic score (${academicScore}) is below the minimum required (${college.admissionRequirements.gpa})`);
      }
    }
    
    // Check standardized test scores
    if (college.admissionRequirements && college.admissionRequirements.standardizedTests && testScores) {
      college.admissionRequirements.standardizedTests.forEach(reqTest => {
        const userTest = testScores.find(t => t.testName.toLowerCase() === reqTest.name.toLowerCase());
        if (!userTest) {
          isEligible = false;
          ineligibilityReasons.push(`Missing required test: ${reqTest.name}`);
        } else if (userTest.score < reqTest.minimumScore) {
          isEligible = false;
          ineligibilityReasons.push(`${reqTest.name} score (${userTest.score}) is below the minimum required (${reqTest.minimumScore})`);
        }
      });
    }
    
    // Additional requirements check (simplified)
    if (college.admissionRequirements && college.admissionRequirements.additionalRequirements) {
      // In a real implementation, you would check against user's documents or other data
      // For now, we'll just note that additional requirements exist
    }
    
    const result = {
      isEligible,
      ineligibilityReasons,
      college: {
        id: college._id,
        name: college.name,
        type: college.type
      },
      program: {
        name: program.name,
        level: program.level,
        duration: program.duration
      },
      requirements: {
        gpa: college.admissionRequirements?.gpa,
        standardizedTests: college.admissionRequirements?.standardizedTests,
        additionalRequirements: college.admissionRequirements?.additionalRequirements
      },
      userScores: {
        academicScore,
        testScores
      }
    };
    
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get user's applications
/**
 * @desc    Get user's applications
 * @route   GET /api/applications
 * @access  Private
 * @param   {object} req - Express request object
 * @param   {object} res - Express response object
 * @returns {object} - Array of user's applications
 */
const getUserApplications = async (req, res) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 10, status } = req.query;
    
    // Build query
    const query = { student: userId, isActive: true };
    
    // Add status filter
    if (status) {
      query.status = status;
    }
    
    // Execute query with pagination
    const applications = await StudentApplication.find(query)
      .populate('college', 'name type')
      .sort({ applicationDate: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();
    
    // Get total count
    const totalCount = await StudentApplication.countDocuments(query);
    
    res.status(200).json({
      applications,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page,
      totalCount
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get a specific application by ID
/**
 * @desc    Get a specific application by ID
 * @route   GET /api/applications/:id
 * @access  Private
 * @param   {object} req - Express request object
 * @param   {object} res - Express response object
 * @returns {object} - Application object
 */
const getApplicationById = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;
    
    const application = await StudentApplication.findOne({ _id: id, student: userId })
      .populate('college', 'name type address')
      .populate('student', 'email');
    
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }
    
    res.status(200).json(application);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Create a new application
/**
 * @desc    Create a new application
 * @route   POST /api/applications
 * @access  Private
 * @param   {object} req - Express request object
 * @param   {object} res - Express response object
 * @returns {object} - Created application
 */
const createApplication = async (req, res) => {
  try {
    const userId = req.user._id;
    const { collegeId, program, academicScore, testScores, documents, notes } = req.body;
    
    // Validate required fields
    if (!collegeId || !program || academicScore === undefined) {
      return res.status(400).json({ message: 'College ID, program, and academic score are required' });
    }
    
    // Check if college exists
    const college = await College.findById(collegeId);
    if (!college) {
      return res.status(404).json({ message: 'College not found' });
    }
    
    // Check if user has already applied to this program at this college
    const existingApplication = await StudentApplication.findOne({ 
      student: userId, 
      college: collegeId, 
      program 
    });
    
    if (existingApplication) {
      return res.status(400).json({ message: 'You have already applied to this program at this college' });
    }
    
    // Create new application
    const application = new StudentApplication({
      student: userId,
      college: collegeId,
      program,
      academicScore,
      testScores,
      documents,
      notes
    });
    
    const savedApplication = await application.save();
    
    // Populate references
    await savedApplication.populate('college', 'name type');
    await savedApplication.populate('student', 'email');
    
    res.status(201).json(savedApplication);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Update an application
/**
 * @desc    Update an application
 * @route   PUT /api/applications/:id
 * @access  Private
 * @param   {object} req - Express request object
 * @param   {object} res - Express response object
 * @returns {object} - Updated application
 */
const updateApplication = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;
    const { status, academicScore, testScores, documents, notes, interview } = req.body;
    
    // Find the application
    const application = await StudentApplication.findOne({ _id: id, student: userId });
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }
    
    // Only allow updating certain fields if application is still in "Applied" status
    if (application.status === 'Applied') {
      if (academicScore !== undefined) application.academicScore = academicScore;
      if (testScores !== undefined) application.testScores = testScores;
      if (documents !== undefined) application.documents = documents;
      if (notes !== undefined) application.notes = notes;
    }
    
    // Allow updating status (this would typically be done by college admins)
    if (status !== undefined) {
      // In a real implementation, you would check if the user has permission to update status
      // For now, we'll allow it for demo purposes
      application.status = status;
    }
    
    // Update interview details
    if (interview !== undefined) {
      application.interview = interview;
    }
    
    const updatedApplication = await application.save();
    
    // Populate references
    await updatedApplication.populate('college', 'name type');
    await updatedApplication.populate('student', 'email');
    
    res.status(200).json(updatedApplication);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete an application
/**
 * @desc    Delete an application
 * @route   DELETE /api/applications/:id
 * @access  Private
 * @param   {object} req - Express request object
 * @param   {object} res - Express response object
 * @returns {object} - Success message
 */
const deleteApplication = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;
    
    // Find the application
    const application = await StudentApplication.findOne({ _id: id, student: userId });
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }
    
    // Only allow deleting if application is in "Applied" status
    if (application.status !== 'Applied') {
      return res.status(400).json({ message: 'Cannot delete application that is not in "Applied" status' });
    }
    
    // Mark as inactive instead of deleting
    application.isActive = false;
    await application.save();
    
    res.status(200).json({ message: 'Application withdrawn successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get application status history
/**
 * @desc    Get application status history
 * @route   GET /api/applications/:id/history
 * @access  Private
 * @param   {object} req - Express request object
 * @param   {object} res - Express response object
 * @returns {object} - Application status history
 */
const getApplicationHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;
    
    const application = await StudentApplication.findOne({ _id: id, student: userId })
      .select('statusHistory');
    
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }
    
    res.status(200).json(application.statusHistory);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  checkEligibility,
  getUserApplications,
  getApplicationById,
  createApplication,
  updateApplication,
  deleteApplication,
  getApplicationHistory
};