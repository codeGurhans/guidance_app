const AdmissionEvent = require('../models/AdmissionEvent');
const College = require('../models/College');

// Get all admission events
/**
 * @desc    Get all admission events
 * @route   GET /api/admission-events
 * @access  Public
 * @param   {object} req - Express request object
 * @param   {object} res - Express response object
 * @returns {object} - Array of admission events
 */
const getAdmissionEvents = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      collegeId, 
      program, 
      eventType, 
      startDate, 
      endDate,
      sortBy = 'startDate',
      sortOrder = 'asc'
    } = req.query;
    
    // Build query
    const query = { isActive: true };
    
    // Add college filter
    if (collegeId) {
      query.college = collegeId;
    }
    
    // Add program filter
    if (program) {
      query.program = program;
    }
    
    // Add event type filter
    if (eventType) {
      query.eventType = eventType;
    }
    
    // Add date range filters
    if (startDate || endDate) {
      query.startDate = {};
      if (startDate) query.startDate.$gte = new Date(startDate);
      if (endDate) query.startDate.$lte = new Date(endDate);
    }
    
    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
    
    // Execute query with pagination
    const events = await AdmissionEvent.find(query)
      .populate('college', 'name')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();
    
    // Get total count
    const totalCount = await AdmissionEvent.countDocuments(query);
    
    res.status(200).json({
      events,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page,
      totalCount
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get a specific admission event by ID
/**
 * @desc    Get a specific admission event by ID
 * @route   GET /api/admission-events/:id
 * @access  Public
 * @param   {object} req - Express request object
 * @param   {object} res - Express response object
 * @returns {object} - Admission event object
 */
const getAdmissionEventById = async (req, res) => {
  try {
    const event = await AdmissionEvent.findById(req.params.id)
      .populate('college', 'name address');
    
    if (!event || !event.isActive) {
      return res.status(404).json({ message: 'Admission event not found' });
    }
    
    res.status(200).json(event);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Create a new admission event
/**
 * @desc    Create a new admission event
 * @route   POST /api/admission-events
 * @access  Private/Admin
 * @param   {object} req - Express request object
 * @param   {object} res - Express response object
 * @returns {object} - Created admission event
 */
const createAdmissionEvent = async (req, res) => {
  try {
    const { college, title, description, eventType, program, startDate, endDate, isAllDay, isRecurring, recurrencePattern, reminders } = req.body;
    
    // Validate required fields
    if (!college || !title || !eventType || !startDate) {
      return res.status(400).json({ message: 'College, title, event type, and start date are required' });
    }
    
    // Check if college exists
    const collegeExists = await College.findById(college);
    if (!collegeExists) {
      return res.status(404).json({ message: 'College not found' });
    }
    
    // Create new event
    const event = new AdmissionEvent({
      college,
      title,
      description,
      eventType,
      program,
      startDate,
      endDate,
      isAllDay,
      isRecurring,
      recurrencePattern,
      reminders
    });
    
    const savedEvent = await event.save();
    
    // Populate college information
    await savedEvent.populate('college', 'name');
    
    res.status(201).json(savedEvent);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Update an admission event
/**
 * @desc    Update an admission event
 * @route   PUT /api/admission-events/:id
 * @access  Private/Admin
 * @param   {object} req - Express request object
 * @param   {object} res - Express response object
 * @returns {object} - Updated admission event
 */
const updateAdmissionEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const { college, title, description, eventType, program, startDate, endDate, isAllDay, isRecurring, recurrencePattern, reminders } = req.body;
    
    // Find the event
    const event = await AdmissionEvent.findById(id);
    if (!event) {
      return res.status(404).json({ message: 'Admission event not found' });
    }
    
    // Update event fields
    if (college !== undefined) {
      // Check if college exists
      const collegeExists = await College.findById(college);
      if (!collegeExists) {
        return res.status(404).json({ message: 'College not found' });
      }
      event.college = college;
    }
    
    if (title !== undefined) event.title = title;
    if (description !== undefined) event.description = description;
    if (eventType !== undefined) event.eventType = eventType;
    if (program !== undefined) event.program = program;
    if (startDate !== undefined) event.startDate = startDate;
    if (endDate !== undefined) event.endDate = endDate;
    if (isAllDay !== undefined) event.isAllDay = isAllDay;
    if (isRecurring !== undefined) event.isRecurring = isRecurring;
    if (recurrencePattern !== undefined) event.recurrencePattern = recurrencePattern;
    if (reminders !== undefined) event.reminders = reminders;
    
    const updatedEvent = await event.save();
    
    // Populate college information
    await updatedEvent.populate('college', 'name');
    
    res.status(200).json(updatedEvent);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete an admission event
/**
 * @desc    Delete an admission event
 * @route   DELETE /api/admission-events/:id
 * @access  Private/Admin
 * @param   {object} req - Express request object
 * @param   {object} res - Express response object
 * @returns {object} - Success message
 */
const deleteAdmissionEvent = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find the event
    const event = await AdmissionEvent.findById(id);
    if (!event) {
      return res.status(404).json({ message: 'Admission event not found' });
    }
    
    // Delete the event
    await event.remove();
    
    res.status(200).json({ message: 'Admission event deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get upcoming admission events
/**
 * @desc    Get upcoming admission events
 * @route   GET /api/admission-events/upcoming
 * @access  Public
 * @param   {object} req - Express request object
 * @param   {object} res - Express response object
 * @returns {object} - Array of upcoming admission events
 */
const getUpcomingAdmissionEvents = async (req, res) => {
  try {
    const { limit = 10, collegeId, program } = req.query;
    
    // Build query for upcoming events
    const query = { 
      isActive: true,
      startDate: { $gte: new Date() }
    };
    
    // Add college filter
    if (collegeId) {
      query.college = collegeId;
    }
    
    // Add program filter
    if (program) {
      query.program = program;
    }
    
    // Execute query
    const events = await AdmissionEvent.find(query)
      .populate('college', 'name')
      .sort({ startDate: 1 })
      .limit(limit * 1)
      .exec();
    
    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getAdmissionEvents,
  getAdmissionEventById,
  createAdmissionEvent,
  updateAdmissionEvent,
  deleteAdmissionEvent,
  getUpcomingAdmissionEvents
};