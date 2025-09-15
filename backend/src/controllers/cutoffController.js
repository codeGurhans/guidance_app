const HistoricalAdmission = require('../models/HistoricalAdmission');
const College = require('../models/College');

// Predict cutoff for a program
/**
 * @desc    Predict cutoff for a program
 * @route   POST /api/cutoff/predict
 * @access  Public
 * @param   {object} req - Express request object
 * @param   {object} res - Express response object
 * @returns {object} - Cutoff prediction
 */
const predictCutoff = async (req, res) => {
  try {
    const { collegeId, programName, category = 'General', academicYear } = req.body;
    
    // Validate required fields
    if (!collegeId || !programName) {
      return res.status(400).json({ message: 'College ID and program name are required' });
    }
    
    // Get college details
    const college = await College.findById(collegeId);
    if (!college) {
      return res.status(404).json({ message: 'College not found' });
    }
    
    // Build query for historical data
    const query = {
      college: collegeId,
      program: programName,
      category: category
    };
    
    // If academic year is specified, use it; otherwise, get the latest data
    if (academicYear) {
      query.academicYear = academicYear;
    }
    
    // Get historical admission data
    let historicalData;
    if (academicYear) {
      // If specific year is requested, get that year's data
      historicalData = await HistoricalAdmission.findOne(query).sort({ academicYear: -1 });
    } else {
      // Otherwise, get the latest available data
      historicalData = await HistoricalAdmission.findOne(query).sort({ academicYear: -1 });
    }
    
    if (!historicalData) {
      return res.status(404).json({ 
        message: 'No historical data found for this program and category',
        prediction: null
      });
    }
    
    // Simple prediction algorithm based on historical trends
    // In a real implementation, you would use more sophisticated ML models
    const prediction = generateCutoffPrediction(historicalData, academicYear);
    
    const result = {
      college: {
        id: college._id,
        name: college.name,
        type: college.type
      },
      program: programName,
      category: category,
      academicYear: academicYear || 'Latest',
      historicalData: {
        academicYear: historicalData.academicYear,
        cutoffScore: historicalData.cutoffScore,
        cutoffRank: historicalData.cutoffRank,
        totalSeats: historicalData.totalSeats,
        totalApplicants: historicalData.totalApplicants,
        admissionRate: historicalData.admissionRate
      },
      prediction: prediction
    };
    
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get historical cutoff data for a program
/**
 * @desc    Get historical cutoff data for a program
 * @route   GET /api/cutoff/history
 * @access  Public
 * @param   {object} req - Express request object
 * @param   {object} res - Express response object
 * @returns {object} - Historical cutoff data
 */
const getHistoricalCutoffs = async (req, res) => {
  try {
    const { collegeId, programName, category = 'General', limit = 5 } = req.query;
    
    // Validate required fields
    if (!collegeId || !programName) {
      return res.status(400).json({ message: 'College ID and program name are required' });
    }
    
    // Build query
    const query = {
      college: collegeId,
      program: programName,
      category: category
    };
    
    // Get historical data
    const historicalData = await HistoricalAdmission.find(query)
      .sort({ academicYear: -1 })
      .limit(parseInt(limit))
      .exec();
    
    if (historicalData.length === 0) {
      return res.status(404).json({ message: 'No historical data found for this program and category' });
    }
    
    // Format the data for charting
    const formattedData = historicalData.map(data => ({
      academicYear: data.academicYear,
      cutoffScore: data.cutoffScore,
      cutoffRank: data.cutoffRank,
      totalSeats: data.totalSeats,
      totalApplicants: data.totalApplicants,
      admissionRate: data.admissionRate
    }));
    
    res.status(200).json(formattedData);
  } catch (error) {
    console.error('Error in getHistoricalCutoffs:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Generate cutoff prediction based on historical data
const generateCutoffPrediction = (historicalData, targetYear) => {
  // This is a simplified prediction algorithm
  // In a real implementation, you would use more sophisticated ML models
  
  // Calculate year difference
  const currentYear = new Date().getFullYear();
  const dataYear = parseInt(historicalData.academicYear);
  const yearDifference = targetYear ? parseInt(targetYear) - dataYear : 1;
  
  // Simple trend analysis
  let predictedCutoff = historicalData.cutoffScore;
  let predictedRank = historicalData.cutoffRank;
  
  // Assume a small increase in competition each year (0.5% to 2%)
  const increasePercentage = 0.5 + (Math.random() * 1.5);
  
  // Adjust based on year difference
  if (yearDifference > 0) {
    predictedCutoff = historicalData.cutoffScore * (1 + (increasePercentage * yearDifference / 100));
    if (historicalData.cutoffRank) {
      predictedRank = Math.max(1, historicalData.cutoffRank * (1 - (increasePercentage * yearDifference / 100)));
    }
  } else if (yearDifference < 0) {
    predictedCutoff = historicalData.cutoffScore * (1 - (increasePercentage * Math.abs(yearDifference) / 100));
    if (historicalData.cutoffRank) {
      predictedRank = historicalData.cutoffRank * (1 + (increasePercentage * Math.abs(yearDifference) / 100));
    }
  }
  
  // Consider admission rate trend
  if (historicalData.admissionRate) {
    // If admission rate is low, cutoff might be higher
    if (historicalData.admissionRate < 0.1) {
      predictedCutoff *= 1.02; // Increase by 2%
    } else if (historicalData.admissionRate > 0.5) {
      predictedCutoff *= 0.98; // Decrease by 2%
    }
  }
  
  return {
    predictedCutoffScore: parseFloat(predictedCutoff.toFixed(2)),
    predictedCutoffRank: predictedRank ? Math.round(predictedRank) : null,
    confidence: 'Moderate', // In a real implementation, this would be calculated
    methodology: 'Simple trend analysis based on historical data',
    factorsConsidered: [
      'Historical cutoff scores',
      'Admission rates',
      'Year-over-year trends'
    ]
  };
};

// Compare cutoffs across multiple colleges
/**
 * @desc    Compare cutoffs across multiple colleges
 * @route   POST /api/cutoff/compare
 * @access  Public
 * @param   {object} req - Express request object
 * @param   {object} res - Express response object
 * @returns {object} - Cutoff comparison
 */
const compareCutoffs = async (req, res) => {
  try {
    const { colleges, programName, category = 'General' } = req.body;
    
    // Validate required fields
    if (!colleges || !Array.isArray(colleges) || colleges.length === 0 || !programName) {
      return res.status(400).json({ message: 'Colleges array and program name are required' });
    }
    
    // Get the latest historical data for each college
    const comparisonData = [];
    
    for (const collegeId of colleges) {
      // Get college details
      const college = await College.findById(collegeId);
      if (!college) continue;
      
      // Get latest historical data
      const historicalData = await HistoricalAdmission.findOne({
        college: collegeId,
        program: programName,
        category: category
      }).sort({ academicYear: -1 });
      
      if (historicalData) {
        comparisonData.push({
          college: {
            id: college._id,
            name: college.name,
            type: college.type
          },
          academicYear: historicalData.academicYear,
          cutoffScore: historicalData.cutoffScore,
          cutoffRank: historicalData.cutoffRank,
          totalSeats: historicalData.totalSeats,
          totalApplicants: historicalData.totalApplicants,
          admissionRate: historicalData.admissionRate
        });
      }
    }
    
    if (comparisonData.length === 0) {
      return res.status(404).json({ message: 'No historical data found for the specified colleges and program' });
    }
    
    res.status(200).json(comparisonData);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  predictCutoff,
  getHistoricalCutoffs,
  compareCutoffs
};