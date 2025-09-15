const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Assessment = require('./models/Assessment');
const Question = require('./models/Question');

// Load environment variables
dotenv.config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    // Ensure we're using IPv4 localhost
    const mongoUri = process.env.MONGO_URI.replace('localhost', '127.0.0.1');
    
    const conn = await mongoose.connect(mongoUri, {
      // Remove deprecated options
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    console.log('Please make sure MongoDB is running or use a MongoDB Atlas connection string');
    process.exit(1);
  }
};

// Sample questions for the career guidance assessment
const sampleQuestions = [
  {
    text: "I enjoy solving complex mathematical problems",
    type: "rating",
    options: [
      { text: "Strongly Disagree", value: 1 },
      { text: "Disagree", value: 2 },
      { text: "Neutral", value: 3 },
      { text: "Agree", value: 4 },
      { text: "Strongly Agree", value: 5 }
    ],
    categories: ["Mathematics", "Analytical Thinking"],
    difficulty: 2
  },
  {
    text: "I am interested in understanding how living organisms function",
    type: "rating",
    options: [
      { text: "Strongly Disagree", value: 1 },
      { text: "Disagree", value: 2 },
      { text: "Neutral", value: 3 },
      { text: "Agree", value: 4 },
      { text: "Strongly Agree", value: 5 }
    ],
    categories: ["Biology", "Scientific Reasoning"],
    difficulty: 2
  },
  {
    text: "I enjoy creating artistic or creative works",
    type: "rating",
    options: [
      { text: "Strongly Disagree", value: 1 },
      { text: "Disagree", value: 2 },
      { text: "Neutral", value: 3 },
      { text: "Agree", value: 4 },
      { text: "Strongly Agree", value: 5 }
    ],
    categories: ["Arts", "Creativity"],
    difficulty: 1
  },
  {
    text: "I am interested in understanding how businesses operate",
    type: "rating",
    options: [
      { text: "Strongly Disagree", value: 1 },
      { text: "Disagree", value: 2 },
      { text: "Neutral", value: 3 },
      { text: "Agree", value: 4 },
      { text: "Strongly Agree", value: 5 }
    ],
    categories: ["Business", "Economics"],
    difficulty: 2
  },
  {
    text: "I enjoy working with technology and computers",
    type: "rating",
    options: [
      { text: "Strongly Disagree", value: 1 },
      { text: "Disagree", value: 2 },
      { text: "Neutral", value: 3 },
      { text: "Agree", value: 4 },
      { text: "Strongly Agree", value: 5 }
    ],
    categories: ["Technology", "Computer Science"],
    difficulty: 3
  },
  {
    text: "I am interested in helping people and solving social issues",
    type: "rating",
    options: [
      { text: "Strongly Disagree", value: 1 },
      { text: "Disagree", value: 2 },
      { text: "Neutral", value: 3 },
      { text: "Agree", value: 4 },
      { text: "Strongly Agree", value: 5 }
    ],
    categories: ["Social Sciences", "Humanities"],
    difficulty: 2
  },
  {
    text: "Which of the following subjects do you find most interesting?",
    type: "mcq",
    options: [
      { text: "Mathematics", value: "mathematics" },
      { text: "Science", value: "science" },
      { text: "Literature", value: "literature" },
      { text: "History", value: "history" },
      { text: "Economics", value: "economics" }
    ],
    categories: ["Academic Interests"],
    difficulty: 1
  },
  {
    text: "What type of work environment would you prefer?",
    type: "mcq",
    options: [
      { text: "Office/Corporate", value: "corporate" },
      { text: "Laboratory/Research", value: "research" },
      { text: "Outdoors/Field Work", value: "outdoors" },
      { text: "Creative Studio", value: "creative" },
      { text: "Educational Institution", value: "education" }
    ],
    categories: ["Work Environment"],
    difficulty: 2
  }
];

// Sample assessment
const sampleAssessment = {
  title: "Career Guidance Assessment",
  description: "An assessment to help identify your interests and suggest suitable career paths",
  categories: ["Mathematics", "Biology", "Arts", "Business", "Technology", "Social Sciences", "Academic Interests", "Work Environment"],
  timeLimit: 30,
  isActive: true,
  scoring: "adaptive"
};

const seedDB = async () => {
  try {
    // Connect to database
    await connectDB();
    
    // Clear existing data
    await Question.deleteMany({});
    await Assessment.deleteMany({});
    
    console.log('Existing data cleared');
    
    // Create questions
    const questions = await Question.insertMany(sampleQuestions);
    console.log(`Created ${questions.length} questions`);
    
    // Create assessment with question references
    const questionIds = questions.map(q => q._id);
    const assessmentData = {
      ...sampleAssessment,
      questions: questionIds
    };
    
    const assessment = await Assessment.create(assessmentData);
    console.log(`Created assessment: ${assessment.title}`);
    
    console.log('Database seeding completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

// Run the seed function
if (process.argv[2] === '--import') {
  seedDB();
}