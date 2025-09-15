const mongoose = require('mongoose');
const CareerPath = require('./src/models/CareerPath');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Sample career paths
const sampleCareerPaths = [
  {
    title: "Software Engineer",
    description: "Design, develop, and maintain software applications and systems.",
    educationLevel: "Bachelor's Degree",
    salaryRange: {
      min: 60000,
      max: 150000
    },
    jobGrowth: "Rapid",
    requiredSkills: ["Programming", "Problem Solving", "Teamwork", "Communication"],
    categories: ["technology", "engineering", "computer-science"]
  },
  {
    title: "Data Scientist",
    description: "Analyze and interpret complex data to help organizations make informed decisions.",
    educationLevel: "Master's Degree",
    salaryRange: {
      min: 80000,
      max: 180000
    },
    jobGrowth: "Rapid",
    requiredSkills: ["Statistics", "Machine Learning", "Python", "Data Analysis"],
    categories: ["technology", "mathematics", "data"]
  },
  {
    title: "Medical Doctor",
    description: "Diagnose and treat illnesses, injuries, and other health conditions.",
    educationLevel: "Doctorate",
    salaryRange: {
      min: 150000,
      max: 400000
    },
    jobGrowth: "Average",
    requiredSkills: ["Medical Knowledge", "Empathy", "Critical Thinking", "Communication"],
    categories: ["healthcare", "medicine", "science"]
  },
  {
    title: "Teacher",
    description: "Educate students in various subjects and grade levels.",
    educationLevel: "Bachelor's Degree",
    salaryRange: {
      min: 40000,
      max: 80000
    },
    jobGrowth: "Average",
    requiredSkills: ["Communication", "Patience", "Organization", "Adaptability"],
    categories: ["education", "social", "communication"]
  },
  {
    title: "Marketing Manager",
    description: "Plan and execute marketing strategies to promote products and services.",
    educationLevel: "Bachelor's Degree",
    salaryRange: {
      min: 50000,
      max: 150000
    },
    jobGrowth: "Fast",
    requiredSkills: ["Creativity", "Communication", "Analytics", "Leadership"],
    categories: ["business", "marketing", "communication"]
  }
];

async function populateCareerPaths() {
  try {
    // Clear existing career paths
    await CareerPath.deleteMany({});
    
    // Insert sample career paths
    const careerPaths = await CareerPath.insertMany(sampleCareerPaths);
    console.log(`Inserted ${careerPaths.length} career paths`);
    
    console.log('Career paths population complete!');
    process.exit(0);
  } catch (error) {
    console.error('Error populating career paths:', error);
    process.exit(1);
  }
}

populateCareerPaths();