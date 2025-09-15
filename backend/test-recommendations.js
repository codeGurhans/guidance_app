require('dotenv').config();
const mongoose = require('mongoose');
const CareerPath = require('./src/models/CareerPath');
const UserResponse = require('./src/models/UserResponse');
const Assessment = require('./src/models/Assessment');

mongoose.connect(process.env.MONGO_URI.replace('localhost', '127.0.0.1')).then(async () => {
  try {
    // Get the current assessment
    const assessment = await Assessment.findOne({ isActive: true });
    console.log('Current assessment:', assessment.title);
    
    // Get a completed response for this assessment
    const userResponse = await UserResponse.findOne({ 
      assessment: assessment._id, 
      isCompleted: true 
    });
    
    if (!userResponse) {
      console.log('No completed response found for current assessment');
      mongoose.disconnect();
      return;
    }
    
    console.log('User response found with category scores:');
    userResponse.categoryScores.forEach(score => {
      console.log(`- ${score.category}: ${score.score}`);
    });
    
    // Get all active career paths
    const careerPaths = await CareerPath.find({ isActive: true });
    console.log(`\nFound ${careerPaths.length} career paths:`);
    
    // Score each career path based on user's category scores
    const userCategoryScores = {};
    userResponse.categoryScores.forEach(score => {
      userCategoryScores[score.category] = {
        score: score.score,
        averageScore: score.averageScore || 0,
        questionCount: score.questionCount || 1
      };
    });
    
    console.log('\nScoring career paths...');
    
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
                  console.log(`MATCH: ${careerCategory} === ${userCategory} (score: ${userScore})`);
              }
              // Partial match gets partial score
              else if (cleanCareerCategory.includes(cleanUserCategory) || cleanUserCategory.includes(cleanCareerCategory)) {
                  const userScore = userCategoryScores[userCategory].score;
                  const questionCount = userCategoryScores[userCategory].questionCount;
                  const weight = Math.log(questionCount + 1) * 0.5; // Reduced weight for partial matches
                  matchScore += userScore * 0.5 * weight;
                  totalWeight += weight;
                  console.log(`PARTIAL MATCH: ${careerCategory} ~= ${userCategory} (score: ${userScore})`);
              }
          });
      });

      // Add a bonus based on the number of matched categories
      if (matchedCategories > 1 && totalWeight > 0) {
          matchScore *= (1 + (matchedCategories - 1) * 0.1); // 10% bonus for each additional match
      }

      // Normalize score by total weight for fair comparison
      const normalizedScore = totalWeight > 0 ? matchScore / totalWeight : matchScore;

      console.log(`${careerPath.title}: matchScore=${matchScore}, matchedCategories=${matchedCategories}, normalizedScore=${normalizedScore}\n`);

      return {
        ...careerPath.toObject(),
        matchScore: normalizedScore,
        matchedCategories: matchedCategories
      };
    });
    
    // Sort by match score (highest first)
    scoredCareerPaths.sort((a, b) => b.matchScore - a.matchScore);
    
    console.log('Sorted recommendations:');
    scoredCareerPaths.forEach((career, index) => {
      console.log(`${index + 1}. ${career.title} (score: ${career.matchScore}, matches: ${career.matchedCategories})`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    mongoose.disconnect();
  }
});