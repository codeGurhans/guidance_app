/**
 * Calculate total score for a user's responses
 * @param {Array} responses - Array of user responses
 * @param {Object} assessment - Assessment object with questions
 * @returns {Number} - Total score
 */
const calculateTotalScore = (responses, assessment) => {
  // For now, just count the number of responses
  return responses.length;
};

/**
 * Calculate category scores for a user's responses
 * @param {Array} responses - Array of user responses
 * @param {Object} assessment - Assessment object with questions
 * @returns {Array} - Array of category scores
 */
const calculateCategoryScores = (responses, assessment) => {
  // Initialize category scores object
  const categoryScores = {};
  
  // Get all categories from the assessment
  const allCategories = assessment.categories || [];
  
  // Initialize all categories with 0 score
  allCategories.forEach(category => {
    categoryScores[category] = 0;
  });
  
  // Calculate scores based on responses
  responses.forEach(response => {
    const question = assessment.questions.find(q => q._id.toString() === response.question.toString());
    if (question && question.categories) {
      question.categories.forEach(category => {
        if (categoryScores.hasOwnProperty(category)) {
          // For now, just increment by 1 for each response in a category
          categoryScores[category] += 1;
        }
      });
    }
  });
  
  // Convert to array format
  return Object.keys(categoryScores).map(category => ({
    category,
    score: categoryScores[category]
  }));
};

/**
 * Calculate weighted score based on question difficulty
 * @param {Array} responses - Array of user responses
 * @param {Object} assessment - Assessment object with questions
 * @returns {Number} - Weighted total score
 */
const calculateWeightedScore = (responses, assessment) => {
  let totalScore = 0;
  
  responses.forEach(response => {
    const question = assessment.questions.find(q => q._id.toString() === response.question.toString());
    if (question) {
      // Weight based on difficulty (1-5 scale)
      const weight = question.difficulty || 1;
      totalScore += weight;
    }
  });
  
  return totalScore;
};

/**
 * Calculate adaptive score based on response time
 * @param {Array} responses - Array of user responses
 * @param {Object} assessment - Assessment object with questions
 * @returns {Number} - Adaptive total score
 */
const calculateAdaptiveScore = (responses, assessment) => {
  let totalScore = 0;
  
  responses.forEach(response => {
    const question = assessment.questions.find(q => q._id.toString() === response.question.toString());
    if (question) {
      // Base score
      let score = 1;
      
      // Adjust based on time taken (faster is better, but not too fast)
      if (response.timeTaken) {
        if (response.timeTaken < 5) {
          // Very fast, might be guessing
          score *= 0.8;
        } else if (response.timeTaken < 15) {
          // Good speed
          score *= 1.2;
        } else if (response.timeTaken < 30) {
          // Normal speed
          score *= 1.0;
        } else {
          // Slow, might indicate difficulty
          score *= 0.9;
        }
      }
      
      totalScore += score;
    }
  });
  
  return Math.round(totalScore * 10) / 10; // Round to 1 decimal place
};

module.exports = {
  calculateTotalScore,
  calculateCategoryScores,
  calculateWeightedScore,
  calculateAdaptiveScore
};