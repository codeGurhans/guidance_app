const College = require('../models/College');

// Get all active colleges
/**
 * @desc    Get all active colleges
 * @route   GET /api/colleges
 * @access  Public
 * @param   {object} req - Express request object
 * @param   {object} res - Express response object
 * @returns {object} - Array of colleges
 */
const getColleges = async (req, res) => {
  try {
    // Extract query parameters
    const { 
      page = 1, 
      limit = 10, 
      search, 
      type, 
      program, 
      facility,
      minGpa,
      maxGpa,
      minFees,
      maxFees,
      accreditation,
      establishedBefore,
      establishedAfter,
      studentCapacityMin,
      studentCapacityMax,
      latitude,
      longitude,
      radius = 50, // default radius in kilometers
      sortBy = 'name',
      sortOrder = 'asc'
    } = req.query;
    
    // Build query
    const query = { isActive: true };
    
    // Add search filter
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { 'address.city': { $regex: search, $options: 'i' } },
        { 'address.state': { $regex: search, $options: 'i' } }
      ];
    }
    
    // Add type filter
    if (type) {
      query.type = type;
    }
    
    // Add program filter
    if (program) {
      query['programs.name'] = { $regex: program, $options: 'i' };
    }
    
    // Add facility filter
    if (facility) {
      query.facilities = { $regex: facility, $options: 'i' };
    }
    
    // Add GPA filters
    if (minGpa || maxGpa) {
      query['admissionRequirements.gpa'] = {};
      if (minGpa) query['admissionRequirements.gpa'].$gte = parseFloat(minGpa);
      if (maxGpa) query['admissionRequirements.gpa'].$lte = parseFloat(maxGpa);
    }
    
    // Add fees filters
    if (minFees || maxFees) {
      query['fees.undergraduate'] = {};
      if (minFees) query['fees.undergraduate'].$gte = parseFloat(minFees);
      if (maxFees) query['fees.undergraduate'].$lte = parseFloat(maxFees);
    }
    
    // Add accreditation filter
    if (accreditation) {
      query['accreditation.status'] = accreditation;
    }
    
    // Add established year filters
    if (establishedBefore || establishedAfter) {
      query.established = {};
      if (establishedAfter) query.established.$gte = parseInt(establishedAfter);
      if (establishedBefore) query.established.$lte = parseInt(establishedBefore);
    }
    
    // Add student capacity filters
    if (studentCapacityMin || studentCapacityMax) {
      query.studentCapacity = {};
      if (studentCapacityMin) query.studentCapacity.$gte = parseInt(studentCapacityMin);
      if (studentCapacityMax) query.studentCapacity.$lte = parseInt(studentCapacityMax);
    }
    
    // Handle geolocation search
    let colleges = [];
    let totalCount = 0;
    
    if (latitude && longitude) {
      // If latitude and longitude are provided, use geospatial query
      const collegesWithDistance = await College.aggregate([
        {
          $geoNear: {
            near: {
              type: "Point",
              coordinates: [parseFloat(longitude), parseFloat(latitude)]
            },
            distanceField: "distance",
            maxDistance: radius * 1000, // convert to meters
            spherical: true
          }
        },
        {
          $match: query
        },
        {
          $sort: { distance: 1 }
        },
        {
          $skip: (page - 1) * limit
        },
        {
          $limit: parseInt(limit)
        }
      ]);
      
      colleges = collegesWithDistance;
      
      // Get total count for pagination
      const countResult = await College.aggregate([
        {
          $geoNear: {
            near: {
              type: "Point",
              coordinates: [parseFloat(longitude), parseFloat(latitude)]
            },
            distanceField: "distance",
            maxDistance: radius * 1000, // convert to meters
            spherical: true
          }
        },
        {
          $match: query
        },
        {
          $count: "totalCount"
        }
      ]);
      
      totalCount = countResult.length > 0 ? countResult[0].totalCount : 0;
    } else {
      // Standard query without geolocation
      // Build sort object
      const sort = {};
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
      
      // Execute query with pagination
      colleges = await College.find(query)
        .sort(sort)
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .exec();
      
      // Get total count
      totalCount = await College.countDocuments(query);
    }
    
    res.status(200).json({
      colleges,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page,
      totalCount
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get a specific college by ID
/**
 * @desc    Get a specific college by ID
 * @route   GET /api/colleges/:id
 * @access  Public
 * @param   {object} req - Express request object
 * @param   {object} res - Express response object
 * @returns {object} - College object
 */
const getCollegeById = async (req, res) => {
  try {
    const college = await College.findById(req.params.id);
    
    if (!college || !college.isActive) {
      return res.status(404).json({ message: 'College not found' });
    }
    
    res.status(200).json(college);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get colleges near a specific location
/**
 * @desc    Get colleges near a specific location
 * @route   GET /api/colleges/nearby
 * @access  Public
 * @param   {object} req - Express request object
 * @param   {object} res - Express response object
 * @returns {object} - Array of nearby colleges
 */
const getNearbyColleges = async (req, res) => {
  try {
    const { longitude, latitude, radius = 50 } = req.query; // radius in kilometers
    
    if (!longitude || !latitude) {
      return res.status(400).json({ message: 'Longitude and latitude are required' });
    }
    
    const colleges = await College.find({
      isActive: true,
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [parseFloat(longitude), parseFloat(latitude)]
          },
          $maxDistance: radius * 1000 // convert to meters
        }
      }
    });
    
    res.status(200).json(colleges);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get colleges by program
/**
 * @desc    Get colleges offering a specific program
 * @route   GET /api/colleges/programs/:programName
 * @access  Public
 * @param   {object} req - Express request object
 * @param   {object} res - Express response object
 * @returns {object} - Array of colleges
 */
const getCollegesByProgram = async (req, res) => {
  try {
    const { programName } = req.params;
    
    const colleges = await College.find({
      isActive: true,
      'programs.name': { $regex: programName, $options: 'i' }
    });
    
    res.status(200).json(colleges);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getColleges,
  getCollegeById,
  getNearbyColleges,
  getCollegesByProgram
};