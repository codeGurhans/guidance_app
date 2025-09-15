const mongoose = require('mongoose');
const HistoricalAdmission = require('./src/models/HistoricalAdmission');
const College = require('./src/models/College');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function populateHistoricalAdmissionData() {
  try {
    // Clear existing historical admission data
    await HistoricalAdmission.deleteMany({});
    
    // Get some colleges to associate with data
    const colleges = await College.find({}).limit(3);
    
    if (colleges.length === 0) {
      console.log('No colleges found. Please populate colleges first.');
      process.exit(1);
    }
    
    // Sample historical admission data
    const sampleData = [
      // College 1 - B.Tech program
      {
        college: colleges[0]._id,
        program: "B.Tech",
        academicYear: "2020-2021",
        category: "General",
        cutoffScore: 85.5,
        cutoffRank: 1500,
        totalSeats: 120,
        totalApplicants: 8500,
        seatsFilled: 118,
        admissionRate: 0.98,
        averageAdmittedScore: 87.2,
        scoreStandardDeviation: 3.5,
        statistics: {
          percentile90: 92.1,
          percentile75: 88.5,
          percentile25: 83.2,
          percentile10: 80.5,
          minScore: 78.0,
          maxScore: 95.5
        }
      },
      {
        college: colleges[0]._id,
        program: "B.Tech",
        academicYear: "2021-2022",
        category: "General",
        cutoffScore: 86.8,
        cutoffRank: 1350,
        totalSeats: 120,
        totalApplicants: 9200,
        seatsFilled: 120,
        admissionRate: 1.0,
        averageAdmittedScore: 88.5,
        scoreStandardDeviation: 3.2,
        statistics: {
          percentile90: 93.2,
          percentile75: 89.8,
          percentile25: 84.5,
          percentile10: 81.8,
          minScore: 79.5,
          maxScore: 96.8
        }
      },
      {
        college: colleges[0]._id,
        program: "B.Tech",
        academicYear: "2022-2023",
        category: "General",
        cutoffScore: 87.5,
        cutoffRank: 1200,
        totalSeats: 120,
        totalApplicants: 9800,
        seatsFilled: 120,
        admissionRate: 1.0,
        averageAdmittedScore: 89.1,
        scoreStandardDeviation: 3.0,
        statistics: {
          percentile90: 94.0,
          percentile75: 90.5,
          percentile25: 85.2,
          percentile10: 82.5,
          minScore: 80.0,
          maxScore: 97.5
        }
      },
      // College 1 - B.Tech program - OBC category
      {
        college: colleges[0]._id,
        program: "B.Tech",
        academicYear: "2022-2023",
        category: "OBC",
        cutoffScore: 82.0,
        cutoffRank: 2500,
        totalSeats: 36,
        totalApplicants: 3200,
        seatsFilled: 36,
        admissionRate: 1.0,
        averageAdmittedScore: 83.5,
        scoreStandardDeviation: 2.8,
        statistics: {
          percentile90: 88.0,
          percentile75: 85.5,
          percentile25: 80.0,
          percentile10: 77.5,
          minScore: 75.0,
          maxScore: 92.0
        }
      },
      // College 2 - MBBS program
      {
        college: colleges[1]._id,
        program: "MBBS",
        academicYear: "2020-2021",
        category: "General",
        cutoffScore: 92.0,
        cutoffRank: 800,
        totalSeats: 100,
        totalApplicants: 15000,
        seatsFilled: 100,
        admissionRate: 1.0,
        averageAdmittedScore: 93.5,
        scoreStandardDeviation: 2.0,
        statistics: {
          percentile90: 96.0,
          percentile75: 94.5,
          percentile25: 91.0,
          percentile10: 89.5,
          minScore: 87.0,
          maxScore: 98.5
        }
      },
      {
        college: colleges[1]._id,
        program: "MBBS",
        academicYear: "2021-2022",
        category: "General",
        cutoffScore: 93.5,
        cutoffRank: 650,
        totalSeats: 100,
        totalApplicants: 16500,
        seatsFilled: 100,
        admissionRate: 1.0,
        averageAdmittedScore: 94.8,
        scoreStandardDeviation: 1.8,
        statistics: {
          percentile90: 97.0,
          percentile75: 95.5,
          percentile25: 92.0,
          percentile10: 90.5,
          minScore: 88.0,
          maxScore: 99.0
        }
      },
      {
        college: colleges[1]._id,
        program: "MBBS",
        academicYear: "2022-2023",
        category: "General",
        cutoffScore: 94.2,
        cutoffRank: 550,
        totalSeats: 100,
        totalApplicants: 18000,
        seatsFilled: 100,
        admissionRate: 1.0,
        averageAdmittedScore: 95.5,
        scoreStandardDeviation: 1.5,
        statistics: {
          percentile90: 97.5,
          percentile75: 96.0,
          percentile25: 92.5,
          percentile10: 91.0,
          minScore: 89.0,
          maxScore: 99.5
        }
      }
    ];
    
    // Insert sample historical admission data
    const data = await HistoricalAdmission.insertMany(sampleData);
    console.log(`Inserted ${data.length} historical admission records`);
    
    console.log('Historical admission data population complete!');
    process.exit(0);
  } catch (error) {
    console.error('Error populating historical admission data:', error);
    process.exit(1);
  }
}

populateHistoricalAdmissionData();