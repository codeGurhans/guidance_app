const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const { validateUserProfile } = require('../utils/validation');

// Validate email format
const validateEmail = (email) => {
  const re = /\S+@\S+\.\S+/;
  return re.test(email);
};

// Register a new user
/**
 * @desc    Register a new user
 * @route   POST /api/users/register
 * @access  Public
 * @param   {object} req - Express request object
 * @param   {object} res - Express response object
 * @returns {object} - User object
 */
const registerUser = async (req, res) => {
  const { email, password, age, gender, grade, academicInterests, location } = req.body;

  // Validate required fields
  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  if (!password) {
    return res.status(400).json({ message: 'Password is required' });
  }

  // Validate email format
  if (!validateEmail(email)) {
    return res.status(400).json({ message: 'Invalid email format' });
  }

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create new user with extended profile information
    const user = new User({
      email,
      password,
      age,
      gender,
      grade,
      academicInterests,
      location,
    });

    // Save user to database (password will be hashed by pre-save hook)
    const savedUser = await user.save();

    // Generate JWT token
    const token = generateToken(savedUser._id);

    // Return user data and token (excluding password)
    res.status(201).json({
      _id: savedUser._id,
      email: savedUser.email,
      age: savedUser.age,
      gender: savedUser.gender,
      grade: savedUser.grade,
      academicInterests: savedUser.academicInterests,
      location: savedUser.location,
      token,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Login a user
/**
 * @desc    Authenticate user & get token
 * @route   POST /api/users/login
 * @access  Public
 * @param   {object} req - Express request object
 * @param   {object} res - Express response object
 * @returns {object} - User object with token
 */
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  // Validate required fields
  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  if (!password) {
    return res.status(400).json({ message: 'Password is required' });
  }

  try {
    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check if password is correct
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = generateToken(user._id);

    // Return user data and token (excluding password)
    res.status(200).json({
      _id: user._id,
      email: user.email,
      token,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get user profile
/**
 * @desc    Get user profile
 * @route   GET /api/users/profile
 * @access  Private
 * @param   {object} req - Express request object
 * @param   {object} res - Express response object
 * @returns {object} - User object
 */
const getProfile = async (req, res) => {
  try {
    // req.user is set in the auth middleware
    res.status(200).json(req.user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Update user profile
/**
 * @desc    Update user profile
 * @route   PUT /api/users/profile
 * @access  Private
 * @param   {object} req - Express request object
 * @param   {object} res - Express response object
 * @returns {object} - Updated user object
 */
const updateProfile = async (req, res) => {
  try {
    // req.user is set in the auth middleware
    const userId = req.user._id;
    
    // Get the fields to update from request body
    const updates = req.body;
    
    // Validate the profile data
    const validation = validateUserProfile(updates);
    if (!validation.isValid) {
      return res.status(400).json({ 
        message: 'Validation error', 
        errors: validation.errors 
      });
    }
    
    // Remove email and password from updates for security
    delete updates.email;
    delete updates.password;
    
    // Update the user
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Upload user avatar
/**
 * @desc    Upload user avatar
 * @route   POST /api/users/avatar
 * @access  Private
 * @param   {object} req - Express request object
 * @param   {object} res - Express response object
 * @returns {object} - Updated user object
 */
const upload = require('../middleware/upload');

// Upload user avatar
/**
 * @desc    Upload user avatar
 * @route   POST /api/users/avatar
 * @access  Private
 * @param   {object} req - Express request object
 * @param   {object} res - Express response object
 * @returns {object} - Updated user object
 */
const uploadAvatar = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ message: err });
    }
    if (req.file == undefined) {
      return res.status(400).json({ message: 'Error: No File Selected!' });
    }

    try {
      const user = await User.findById(req.user._id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      user.avatar = `/uploads/${req.file.filename}`;
      const updatedUser = await user.save();

      res.status(200).json({
        message: 'Avatar uploaded successfully',
        avatarUrl: updatedUser.avatar
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  });
};

// Update privacy settings
/**
 * @desc    Update user privacy settings
 * @route   PUT /api/users/privacy
 * @access  Private
 * @param   {object} req - Express request object
 * @param   {object} res - Express response object
 * @returns {object} - Updated user object
 */
const updatePrivacySettings = async (req, res) => {
  try {
    // req.user is set in the auth middleware
    const userId = req.user._id;
    
    // Get the privacy settings to update from request body
    const privacySettings = req.body;
    
    // Validate the privacy settings
    const validation = validateUserProfile({ privacySettings });
    if (!validation.isValid) {
      return res.status(400).json({ 
        message: 'Validation error', 
        errors: validation.errors 
      });
    }
    
    // Update the user's privacy settings
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: { privacySettings } },
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Export user data (GDPR compliance)
/**
 * @desc    Export user data
 * @route   GET /api/users/export
 * @access  Private
 * @param   {object} req - Express request object
 * @param   {object} res - Express response object
 * @returns {object} - User data in JSON format
 */
const exportUserData = async (req, res) => {
  try {
    // req.user is set in the auth middleware
    const userId = req.user._id;
    
    // Find the user and return their data
    const user = await User.findById(userId).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Format the data for export
    const exportData = {
      userData: {
        id: user._id,
        email: user.email,
        age: user.age,
        gender: user.gender,
        grade: user.grade,
        academicInterests: user.academicInterests,
        location: user.location,
        avatar: user.avatar,
        privacySettings: user.privacySettings,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      exportDate: new Date().toISOString(),
    };
    
    res.status(200).json(exportData);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete user account (GDPR compliance)
/**
 * @desc    Delete user account
 * @route   DELETE /api/users/account
 * @access  Private
 * @param   {object} req - Express request object
 * @param   {object} res - Express response object
 * @returns {object} - Success message
 */
const deleteAccount = async (req, res) => {
  try {
    // req.user is set in the auth middleware
    const userId = req.user._id;
    
    // Find and delete the user
    const user = await User.findByIdAndDelete(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.status(200).json({ message: 'Account deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getProfile,
  updateProfile,
  uploadAvatar,
  updatePrivacySettings,
  exportUserData,
  deleteAccount,
};