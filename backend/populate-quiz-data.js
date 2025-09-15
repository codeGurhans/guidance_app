const mongoose = require('mongoose');
const Question = require('./src/models/Question');
const Assessment = require('./src/models/Assessment');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Sample questions
const sampleQuestions = [
  {
    text: "How do you feel about solving complex mathematical problems?",
    type: "rating",
    options: [
      { text: "I dislike it", value: 1 },
      { text: "I'm neutral", value: 2 },
      { text: "I enjoy it", value: 3 },
      { text: "I love it", value: 4 },
      { text: "I'm passionate about it", value: 5 }
    ],
    categories: ["math", "logic"],
    difficulty: 2
  },
  {
    text: "Which of the following activities do you find most engaging?",
    type: "mcq",
    options: [
      { text: "Writing creative stories", value: "creativity" },
      { text: "Solving puzzles", value: "logic" },
      { text: "Working with numbers", value: "math" },
      { text: "Conducting experiments", value: "science" },
      { text: "Helping others", value: "social" }
    ],
    categories: ["creativity", "logic", "math", "science", "social"],
    difficulty: 1
  },
  {
    text: "How would you handle a situation where a team member is not contributing to a group project?",
    type: "scenario",
    options: [
      { text: "Confront them directly", value: "direct" },
      { text: "Speak to the teacher/facilitator", value: "authority" },
      { text: "Try to motivate them", value: "motivational" },
      { text: "Take on their responsibilities", value: "responsible" },
      { text: "Ignore the situation", value: "avoidant" }
    ],
    categories: ["leadership", "communication", "responsibility"],
    difficulty: 3
  },
  {
    text: "How important is it for you to have a stable career with predictable income?",
    type: "rating",
    options: [
      { text: "Not important at all", value: 1 },
      { text: "Slightly important", value: 2 },
      { text: "Moderately important", value: 3 },
      { text: "Very important", value: 4 },
      { text: "Extremely important", value: 5 }
    ],
    categories: ["career-stability"],
    difficulty: 1
  },
  {
    text: "Which type of work environment would you prefer?",
    type: "mcq",
    options: [
      { text: "Structured office setting", value: "structured" },
      { text: "Flexible remote work", value: "flexible" },
      { text: "Collaborative team environment", value: "collaborative" },
      { text: "Independent work", value: "independent" },
      { text: "Fast-paced startup", value: "dynamic" }
    ],
    categories: ["work-environment"],
    difficulty: 2
  }
];

// Sample assessment
const sampleAssessment = {
  title: "Career Guidance Assessment",
  description: "An assessment to help identify your interests and strengths for career guidance",
  categories: ["math", "logic", "creativity", "science", "social", "leadership", "communication", "responsibility", "career-stability", "work-environment"],
  timeLimit: 30, // 30 minutes
  scoring: "adaptive"
};

async function populateDatabase() {
  try {
    // Clear existing questions and assessments
    await Question.deleteMany({});
    await Assessment.deleteMany({});
    
    // Insert sample questions
    const questions = await Question.insertMany(sampleQuestions);
    console.log(`Inserted ${questions.length} questions`);
    
    // Create assessment with the questions
    const assessment = new Assessment({
      ...sampleAssessment,
      questions: questions.map(q => q._id)
    });
    
    await assessment.save();
    console.log(`Inserted assessment: ${assessment.title}`);
    
    console.log('Database population complete!');
    process.exit(0);
  } catch (error) {
    console.error('Error populating database:', error);
    process.exit(1);
  }
}

populateDatabase();