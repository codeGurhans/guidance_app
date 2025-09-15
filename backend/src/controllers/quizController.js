const mongoose = require('mongoose');
const Question = require('../models/Question');
const Assessment = require('../models/Assessment');
const UserResponse = require('../models/UserResponse');

// Get all active assessments
/**
 * @desc    Get all active assessments
 * @route   GET /api/quiz/assessments
 * @access  Public
 * @param   {object} req - Express request object
 * @param   {object} res - Express response object
 * @returns {object} - Array of assessments
 */
const getAssessments = async (req, res) => {
  try {
    const assessments = await Assessment.find({ isActive: true });
    res.status(200).json(assessments);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get a specific assessment by ID
/**
 * @desc    Get a specific assessment by ID
 * @route   GET /api/quiz/assessments/:id
 * @access  Public
 * @param   {object} req - Express request object
 * @param   {object} res - Express response object
 * @returns {object} - Assessment object
 */
const getAssessmentById = async (req, res) => {
  try {
    const { id } = req.params;
    let assessment;

    // If a specific non-ObjectId is used (like '1' for a default quiz), find the first active one.
    // Otherwise, if it's a valid ObjectId, find by that ID.
    if (id === '1') {
      assessment = await Assessment.findOne({ isActive: true });
      if (assessment) {
        // Only populate if assessment has a populate method (i.e., it's a Mongoose document)
        if (typeof assessment.populate === 'function') {
          assessment = await assessment.populate('questions');
        }
      }
    } else if (mongoose.Types.ObjectId.isValid(id)) {
      assessment = await Assessment.findById(id);
      if (assessment) {
        // Only populate if assessment has a populate method (i.e., it's a Mongoose document)
        if (typeof assessment.populate === 'function') {
          assessment = await assessment.populate('questions');
        }
      }
    }

    if (!assessment) {
      return res.status(404).json({ message: 'Assessment not found' });
    }
    
    res.status(200).json(assessment);
  } catch (error) {
    console.error('Error in getAssessmentById:', error);
    res.status(500).json({ message: 'Server error fetching assessment.', details: error.message });
  }
};

// Start a new assessment for a user
/**
 * @desc    Start a new assessment for a user
 * @route   POST /api/quiz/assessments/:id/start
 * @access  Private
 * @param   {object} req - Express request object
 * @param   {object} res - Express response object
 * @returns {object} - User response object
 */
const startAssessment = async (req, res) => {
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

    if (!assessment || !assessment.isActive) {
      return res.status(404).json({ message: 'Assessment not found or not active' });
    }
    
    // Use the found assessment's actual _id for relations
    const actualAssessmentId = assessment._id;

    // Check if user already has an incomplete response for this assessment
    const existingResponse = await UserResponse.findOne({
      user: userId,
      assessment: actualAssessmentId,
      isCompleted: false
    });
    
    if (existingResponse) {
      return res.status(200).json({
        message: 'Assessment already started',
        userResponse: existingResponse
      });
    }
    
    // Create a new user response
    const userResponse = new UserResponse({
      user: userId,
      assessment: actualAssessmentId,
      responses: [],
      startTime: new Date(),
      isCompleted: false,
      timeAnalytics: {
        totalTime: 0,
        averageTimePerQuestion: 0,
        timeDistribution: []
      },
      difficultyAnalytics: {
        distribution: [],
        performanceByDifficulty: []
      },
      progressTracking: []
    });
    
    const savedUserResponse = await userResponse.save();
    
    res.status(201).json({
      message: 'Assessment started successfully',
      userResponse: savedUserResponse
    });
  } catch (error) {
    console.error('Error in startAssessment:', error);
    res.status(500).json({ message: 'Server error starting assessment.', details: error.message });
  }
};

// Get next question for adaptive assessment
/**
 * @desc    Get next question based on adaptive algorithm
 * @route   GET /api/quiz/assessments/:id/next-question
 * @access  Private
 * @param   {object} req - Express request object
 * @param   {object} res - Express response object
 * @returns {object} - Next question object
 */
const getNextQuestion = async (req, res) => {
  try {
    // req.user is set in the auth middleware
    const userId = req.user._id;
    const assessmentId = req.params.id;
    
    let assessment;
    // Handle non-ObjectId for default quiz
    if (assessmentId === '1') {
      assessment = await Assessment.findOne({ isActive: true }).populate('questions');
    } else if (mongoose.Types.ObjectId.isValid(assessmentId)) {
      assessment = await Assessment.findById(assessmentId).populate('questions');
    }

    if (!assessment) {
      return res.status(404).json({ message: 'Assessment not found' });
    }

    // Use the found assessment's actual _id for relations
    const actualAssessmentId = assessment._id;
    
    // Find the user response
    const userResponse = await UserResponse.findOne({
      user: userId,
      assessment: actualAssessmentId,
      isCompleted: false
    });
    
    if (!userResponse) {
      return res.status(404).json({ message: 'Active assessment not found for this user.' });
    }
    
    // Get next question using adaptive algorithm
    const nextQuestion = await selectNextQuestion(userResponse, assessment);
    
    if (!nextQuestion) {
      return res.status(404).json({ message: 'No more questions available.' });
    }
    
    res.status(200).json({
      question: nextQuestion,
      progress: calculateProgress(userResponse, assessment)
    });
  } catch (error) {
    console.error('Error in getNextQuestion:', error);
    res.status(500).json({ message: 'Server error getting next question.', details: error.message });
  }
};

// Submit an answer to a question
/**
 * @desc    Submit an answer to a question
 * @route   POST /api/quiz/assessments/:id/questions/:questionId
 * @access  Private
 * @param   {object} req - Express request object
 * @param   {object} res - Express response object
 * @returns {object} - Updated user response object
 */
const submitAnswer = async (req, res) => {
  try {
    // req.user is set in the auth middleware
    const userId = req.user._id;
    const assessmentId = req.params.id;
    const questionId = req.params.questionId;
    const { answer, timeTaken, confidence } = req.body;

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
    
    // Find the user response
    const userResponse = await UserResponse.findOne({
      user: userId,
      assessment: actualAssessmentId,
      isCompleted: false
    });
    
    if (!userResponse) {
      return res.status(404).json({ message: 'Active assessment not found for this user.' });
    }
    
    // Check if the question exists in the assessment
    if (!assessment.questions.map(q => q.toString()).includes(questionId)) {
      return res.status(400).json({ message: 'Question not part of this assessment' });
    }
    
    // Check if this question has already been answered
    const existingResponseIndex = userResponse.responses.findIndex(
      response => response.question.toString() === questionId
    );
    
    if (existingResponseIndex >= 0) {
      // Update existing response
      userResponse.responses[existingResponseIndex].answer = answer;
      if (timeTaken) {
        userResponse.responses[existingResponseIndex].timeTaken = timeTaken;
      }
      if (confidence !== undefined) {
        userResponse.responses[existingResponseIndex].confidence = confidence;
      }
    } else {
      // Add new response
      userResponse.responses.push({
        question: questionId,
        answer,
        timeTaken,
        confidence
      });
    }
    
    const updatedUserResponse = await userResponse.save();
    
    res.status(200).json({
      message: 'Answer submitted successfully',
      userResponse: updatedUserResponse
    });
  } catch (error) {
    console.error('Error in submitAnswer:', error);
    res.status(500).json({ message: 'Server error submitting answer.', details: error.message });
  }
};

// Pause an assessment
/**
 * @desc    Pause an assessment
 * @route   POST /api/quiz/assessments/:id/pause
 * @access  Private
 * @param   {object} req - Express request object
 * @param   {object} res - Express response object
 * @returns {object} - Updated user response object
 */
const pauseAssessment = async (req, res) => {
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
    
    // Find the user response
    const userResponse = await UserResponse.findOne({
      user: userId,
      assessment: actualAssessmentId,
      isCompleted: false
    });
    
    if (!userResponse) {
      return res.status(404).json({ message: 'Active assessment not found for this user.' });
    }
    
    // Update pause time
    userResponse.pausedAt = new Date();
    userResponse.isPaused = true;
    
    const updatedUserResponse = await userResponse.save();
    
    res.status(200).json({
      message: 'Assessment paused successfully',
      userResponse: updatedUserResponse
    });
  } catch (error) {
    console.error('Error in pauseAssessment:', error);
    res.status(500).json({ message: 'Server error pausing assessment.', details: error.message });
  }
};

// Resume an assessment
/**
 * @desc    Resume a paused assessment
 * @route   POST /api/quiz/assessments/:id/resume
 * @access  Private
 * @param   {object} req - Express request object
 * @param   {object} res - Express response object
 * @returns {object} - Updated user response object
 */
const resumeAssessment = async (req, res) => {
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
    
    // Find the user response
    const userResponse = await UserResponse.findOne({
      user: userId,
      assessment: actualAssessmentId,
      isCompleted: false,
      isPaused: true
    });
    
    if (!userResponse) {
      return res.status(404).json({ message: 'Paused assessment not found for this user.' });
    }
    
    // Clear pause time and mark as not paused
    const pauseDuration = new Date() - userResponse.pausedAt;
    userResponse.pausedAt = null;
    userResponse.isPaused = false;
    userResponse.totalPauseTime += pauseDuration;
    
    const updatedUserResponse = await userResponse.save();
    
    res.status(200).json({
      message: 'Assessment resumed successfully',
      userResponse: updatedUserResponse
    });
  } catch (error) {
    console.error('Error in resumeAssessment:', error);
    res.status(500).json({ message: 'Server error resuming assessment.', details: error.message });
  }
};

// Complete an assessment
/**
 * @desc    Complete an assessment
 * @route   POST /api/quiz/assessments/:id/complete
 * @access  Private
 * @param   {object} req - Express request object
 * @param   {object} res - Express response object
 * @returns {object} - Completed user response object with scores
 */
const completeAssessment = async (req, res) => {
  try {
    // req.user is set in the auth middleware
    const userId = req.user._id;
    const assessmentId = req.params.id;
    
    let assessment;
    // Handle non-ObjectId for default quiz
    if (assessmentId === '1') {
      assessment = await Assessment.findOne({ isActive: true }).populate('questions');
    } else if (mongoose.Types.ObjectId.isValid(assessmentId)) {
      assessment = await Assessment.findById(assessmentId).populate('questions');
    }

    if (!assessment) {
      return res.status(404).json({ message: 'Assessment not found' });
    }

    // Use the found assessment's actual _id for relations
    const actualAssessmentId = assessment._id;

    // Find the user response
    const userResponse = await UserResponse.findOne({
      user: userId,
      assessment: actualAssessmentId,
      isCompleted: false
    });
    
    if (!userResponse) {
      return res.status(404).json({ message: 'Active assessment not found' });
    }
    
    // Mark as completed
    userResponse.isCompleted = true;
    userResponse.endTime = new Date();
    
    // Calculate scores using enhanced scoring functions
    userResponse.score = calculateTotalScore(userResponse.responses, assessment);
    userResponse.categoryScores = calculateCategoryScores(userResponse.responses, assessment);
    
    // Calculate max possible score
    userResponse.maxScore = calculateMaxPossibleScore(assessment);
    
    // Initialize time analytics if not already present
    if (!userResponse.timeAnalytics) {
      userResponse.timeAnalytics = {};
    }
    
    // Update time analytics
    const totalTimeSeconds = (userResponse.endTime - userResponse.startTime - userResponse.totalPauseTime) / 1000;
    userResponse.timeAnalytics.totalTime = totalTimeSeconds;
    userResponse.timeAnalytics.averageTimePerQuestion = 
      userResponse.responses.length > 0 ? totalTimeSeconds / userResponse.responses.length : 0;
    
    // Update time distribution
    userResponse.timeAnalytics.timeDistribution = calculateTimeDistribution(userResponse.responses);
    
    // Initialize difficulty analytics if not already present
    if (!userResponse.difficultyAnalytics) {
      userResponse.difficultyAnalytics = {};
    }
    
    // Update difficulty analytics
    userResponse.difficultyAnalytics.distribution = calculateDifficultyDistribution(userResponse.responses, assessment);
    userResponse.difficultyAnalytics.performanceByDifficulty = calculatePerformanceByDifficulty(userResponse.responses, assessment);
    
    // Update progress tracking
    userResponse.progressTracking = calculateProgressTracking(userResponse.responses, assessment);
    
    const completedUserResponse = await userResponse.save();
    
    res.status(200).json({
      message: 'Assessment completed successfully',
      userResponse: completedUserResponse
    });
  } catch (error) {
    console.error('Error in completeAssessment:', error);
    res.status(500).json({ message: 'Server error completing assessment.', details: error.message });
  }
};

// Get user's assessment results
/**
 * @desc    Get user's assessment results
 * @route   GET /api/quiz/results/:id
 * @access  Private
 * @param   {object} req - Express request object
 * @param   {object} res - Express response object
 * @returns {object} - User response object with results
 */
const getAssessmentResults = async (req, res) => {
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
    
    res.status(200).json(userResponse);
  } catch (error) {
    console.error('Error in getAssessmentResults:', error);
    res.status(500).json({ message: 'Server error getting results.', details: error.message });
  }
};

// Enhanced scoring functions
const calculateTotalScore = (responses, assessment) => {
  let score = 0;
  
  responses.forEach(response => {
    const question = assessment.questions.find(q => q._id.toString() === response.question.toString());
    if (question) {
      // For rating questions, use the numeric value with weighting
      if (question.type === 'rating') {
        const option = question.options.find(opt => opt.value === response.answer);
        if (option) {
          const baseValue = typeof option.value === 'number' ? option.value : 0;
          // Weight by difficulty (higher difficulty questions are worth more)
          const difficultyWeight = question.difficulty / 3; // Normalize to 1.0 for medium difficulty
          score += baseValue * difficultyWeight;
        }
      }
      // For MCQ and scenario questions, give points based on difficulty
      else {
        score += question.difficulty; // Difficulty 1-5 points
      }
    }
  });
  
  return Math.round(score);
};

const calculateCategoryScores = (responses, assessment) => {
  const categoryScores = {};
  
  responses.forEach(response => {
    const question = assessment.questions.find(q => q._id.toString() === response.question.toString());
    if (question && question.categories) {
      question.categories.forEach(category => {
        if (!categoryScores[category]) {
          categoryScores[category] = {
            totalScore: 0,
            questionCount: 0,
            weightedScore: 0,
            maxScore: 0
          };
        }
        
        categoryScores[category].questionCount += 1;
        
        // For rating questions, use the numeric value with weighting
        if (question.type === 'rating') {
          const option = question.options.find(opt => opt.value === response.answer);
          if (option) {
            const baseValue = typeof option.value === 'number' ? option.value : 0;
            // Weight by difficulty (higher difficulty questions are worth more)
            const difficultyWeight = question.difficulty / 3; // Normalize to 1.0 for medium difficulty
            const weightedValue = baseValue * difficultyWeight;
            categoryScores[category].totalScore += baseValue;
            categoryScores[category].weightedScore += weightedValue;
          }
        }
        // For MCQ and scenario questions, give points based on difficulty
        else {
          categoryScores[category].totalScore += 1;
          categoryScores[category].weightedScore += question.difficulty;
        }
        
        // Update max possible score for this category
        categoryScores[category].maxScore += question.difficulty;
      });
    }
  });
  
  // Convert to array format with normalized scores
  return Object.keys(categoryScores).map(category => {
    const stats = categoryScores[category];
    const averageScore = stats.questionCount > 0 ? stats.totalScore / stats.questionCount : 0;
    const normalizedWeightedScore = stats.weightedScore; // Already weighted
    
    return {
      category,
      score: Math.round(normalizedWeightedScore),
      maxScore: stats.maxScore,
      averageScore: Math.round(averageScore * 100) / 100,
      questionCount: stats.questionCount,
      weightedScore: normalizedWeightedScore
    };
  });
};

// Calculate max possible score
const calculateMaxPossibleScore = (assessment) => {
  let maxScore = 0;
  
  assessment.questions.forEach(question => {
    // For rating questions, use the max option value with weighting
    if (question.type === 'rating') {
      const maxOptionValue = Math.max(...question.options.map(opt => 
        typeof opt.value === 'number' ? opt.value : 0
      ));
      // Weight by difficulty (higher difficulty questions are worth more)
      const difficultyWeight = question.difficulty / 3; // Normalize to 1.0 for medium difficulty
      maxScore += maxOptionValue * difficultyWeight;
    }
    // For MCQ and scenario questions, give points based on difficulty
    else {
      maxScore += question.difficulty; // Difficulty 1-5 points
    }
  });
  
  return Math.round(maxScore);
};

// Helper function to calculate time distribution
const calculateTimeDistribution = (responses) => {
  const timeRanges = {
    '0-30s': 0,
    '30-60s': 0,
    '1-2m': 0,
    '2-5m': 0,
    '5m+': 0
  };
  
  responses.forEach(response => {
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

// Helper function to calculate difficulty distribution
const calculateDifficultyDistribution = (responses, assessment) => {
  const difficultyCounts = {
    1: 0, // Very Easy
    2: 0, // Easy
    3: 0, // Medium
    4: 0, // Hard
    5: 0  // Very Hard
  };
  
  responses.forEach(response => {
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

// Helper function to calculate performance by difficulty
const calculatePerformanceByDifficulty = (responses, assessment) => {
  const performanceByDifficulty = {
    1: { total: 0, correct: 0 }, // Very Easy
    2: { total: 0, correct: 0 }, // Easy
    3: { total: 0, correct: 0 }, // Medium
    4: { total: 0, correct: 0 }, // Hard
    5: { total: 0, correct: 0 }  // Very Hard
  };
  
  responses.forEach(response => {
    const question = assessment.questions.find(q => 
      q._id.toString() === response.question.toString()
    );
    
    if (question && question.difficulty) {
      performanceByDifficulty[question.difficulty].total++;
      
      // For rating questions, we consider all answers as "correct" (they're subjective)
      if (question.type === 'rating') {
        performanceByDifficulty[question.difficulty].correct++;
      }
      // For MCQ and scenario questions, we would check if the answer is correct
      // In this implementation, we consider all completed answers as correct
      else {
        performanceByDifficulty[question.difficulty].correct++;
      }
    }
  });
  
  return Object.keys(performanceByDifficulty).map(difficulty => {
    const stats = performanceByDifficulty[difficulty];
    const accuracy = stats.total > 0 ? (stats.correct / stats.total) * 100 : 0;
    
    return {
      difficulty: parseInt(difficulty),
      totalQuestions: stats.total,
      correctAnswers: stats.correct,
      accuracy: Math.round(accuracy * 100) / 100
    };
  });
};

// Helper function to get difficulty label
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

// Select next question based on adaptive algorithm
const selectNextQuestion = async (userResponse, assessment) => {
  try {
    // Handle cases where assessment or questions might be null/undefined
    if (!assessment || !assessment.questions || !Array.isArray(assessment.questions)) {
      return null;
    }
    
    // Get questions already answered
    const answeredQuestions = userResponse.responses.map(r => r.question.toString());
    
    // Get available questions (not yet answered)
    const availableQuestions = assessment.questions.filter(
      q => !answeredQuestions.includes(q._id.toString())
    );
    
    // If no more questions, return null
    if (availableQuestions.length === 0) {
      return null;
    }
    
    // If this is the first question, return a medium difficulty question
    if (answeredQuestions.length === 0) {
      const mediumDifficultyQuestions = availableQuestions.filter(q => q.difficulty === 3);
      if (mediumDifficultyQuestions.length > 0) {
        return mediumDifficultyQuestions[Math.floor(Math.random() * mediumDifficultyQuestions.length)];
      }
    }
    
    // Get the last answered question and its correctness
    const lastResponse = userResponse.responses[userResponse.responses.length - 1];
    const lastQuestion = assessment.questions.find(q => 
      q._id.toString() === lastResponse.question.toString()
    );
    
    // Determine the next difficulty level based on the last response
    let targetDifficulty = lastQuestion ? lastQuestion.difficulty : 3;
    
    // Enhanced adaptive algorithm:
    // - If last question was easy (difficulty 1-2) and answered correctly, increase difficulty
    // - If last question was hard (difficulty 4-5) and answered incorrectly, decrease difficulty
    // - Otherwise, keep similar difficulty
    
    if (lastQuestion) {
      // For rating questions, we'll assume correct if rating is 3 or higher
      if (lastQuestion.type === 'rating') {
        const option = lastQuestion.options.find(opt => opt.value === lastResponse.answer);
        const ratingValue = option ? (typeof option.value === 'number' ? option.value : 0) : 0;
        
        if (lastQuestion.difficulty <= 2 && ratingValue >= 3) {
          targetDifficulty = Math.min(5, lastQuestion.difficulty + 1);
        } else if (lastQuestion.difficulty >= 4 && ratingValue < 3) {
          targetDifficulty = Math.max(1, lastQuestion.difficulty - 1);
        }
      }
      // For MCQ and scenario questions, we'll use a simple heuristic
      else {
        // In a real implementation, we would check if the answer was correct
        // For now, we'll randomly adjust difficulty 30% of the time
        if (Math.random() < 0.3) {
          targetDifficulty = Math.min(5, Math.max(1, targetDifficulty + (Math.random() > 0.5 ? 1 : -1)));
        }
      }
    }
    
    // Find questions matching the target difficulty
    const targetDifficultyQuestions = availableQuestions.filter(q => q.difficulty === targetDifficulty);
    
    if (targetDifficultyQuestions.length > 0) {
      return targetDifficultyQuestions[Math.floor(Math.random() * targetDifficultyQuestions.length)];
    }
    
    // If no questions match target difficulty, find closest difficulty
    const sortedByDifficulty = [...availableQuestions].sort((a, b) => 
      Math.abs(a.difficulty - targetDifficulty) - Math.abs(b.difficulty - targetDifficulty)
    );
    
    return sortedByDifficulty[0];
  } catch (error) {
    console.error('Error in selectNextQuestion:', error);
    // Return a random available question as fallback
    if (!assessment || !assessment.questions || !Array.isArray(assessment.questions)) {
      return null;
    }
    
    const answeredQuestions = userResponse && userResponse.responses ? 
      userResponse.responses.map(r => r.question.toString()) : [];
    
    const availableQuestions = assessment.questions.filter(
      q => !answeredQuestions.includes(q._id.toString())
    );
    
    return availableQuestions.length > 0 ? 
      availableQuestions[Math.floor(Math.random() * availableQuestions.length)] : 
      null;
  }
};

// Calculate assessment progress
const calculateProgress = (userResponse, assessment) => {
  const totalQuestions = assessment.questions.length;
  const answeredQuestions = userResponse.responses.length;
  
  if (totalQuestions === 0) return 0;
  
  return Math.round((answeredQuestions / totalQuestions) * 100);
};

// Helper function to calculate progress tracking
const calculateProgressTracking = (responses, assessment) => {
  const progressTracking = [];
  let cumulativeScore = 0;
  
  responses.forEach((response, index) => {
    const question = assessment.questions.find(q => 
      q._id.toString() === response.question.toString()
    );
    
    if (question) {
      // Add score for this question
      if (question.type === 'rating') {
        const option = question.options.find(opt => opt.value === response.answer);
        if (option) {
          const baseValue = typeof option.value === 'number' ? option.value : 0;
          // Weight by difficulty (higher difficulty questions are worth more)
          const difficultyWeight = question.difficulty / 3; // Normalize to 1.0 for medium difficulty
          cumulativeScore += baseValue * difficultyWeight;
        }
      } else {
        cumulativeScore += question.difficulty; // Difficulty 1-5 points
      }
      
      // Add progress tracking point
      progressTracking.push({
        timestamp: new Date(),
        questionIndex: index,
        cumulativeScore: Math.round(cumulativeScore),
        timeElapsed: response.timeTaken || 0
      });
    }
  });
  
  return progressTracking;
};

module.exports = {
  getAssessments,
  getAssessmentById,
  startAssessment,
  getNextQuestion,
  submitAnswer,
  pauseAssessment,
  resumeAssessment,
  completeAssessment,
  getAssessmentResults,
  calculateTotalScore,
  calculateCategoryScores,
  calculateMaxPossibleScore,
  calculateTimeDistribution,
  calculateDifficultyDistribution,
  calculatePerformanceByDifficulty,
  selectNextQuestion,
  calculateProgress,
  calculateProgressTracking
};