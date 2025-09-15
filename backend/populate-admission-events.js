const mongoose = require('mongoose');
const AdmissionEvent = require('./src/models/AdmissionEvent');
const College = require('./src/models/College');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function populateAdmissionEvents() {
  try {
    // Clear existing admission events
    await AdmissionEvent.deleteMany({});
    
    // Get some colleges to associate with events
    const colleges = await College.find({}).limit(3);
    
    if (colleges.length === 0) {
      console.log('No colleges found. Please populate colleges first.');
      process.exit(1);
    }
    
    // Sample admission events
    const sampleEvents = [
      {
        college: colleges[0]._id,
        title: "Application Deadline for B.Tech",
        description: "Last date to submit applications for B.Tech programs",
        eventType: "Application Deadline",
        program: "B.Tech",
        startDate: new Date(new Date().setDate(new Date().getDate() + 30)),
        isAllDay: true,
        reminders: [
          { type: "email", timeBefore: 1440 }, // 24 hours before
          { type: "email", timeBefore: 10080 } // 1 week before
        ]
      },
      {
        college: colleges[0]._id,
        title: "Entrance Exam for B.Tech",
        description: "JEE Main entrance examination for B.Tech admissions",
        eventType: "Exam Date",
        program: "B.Tech",
        startDate: new Date(new Date().setDate(new Date().getDate() + 45)),
        endDate: new Date(new Date().setDate(new Date().getDate() + 45)),
        isAllDay: true,
        reminders: [
          { type: "email", timeBefore: 1440 } // 24 hours before
        ]
      },
      {
        college: colleges[1]._id,
        title: "Application Deadline for MBBS",
        description: "Last date to submit applications for MBBS programs",
        eventType: "Application Deadline",
        program: "MBBS",
        startDate: new Date(new Date().setDate(new Date().getDate() + 20)),
        isAllDay: true,
        reminders: [
          { type: "email", timeBefore: 1440 }, // 24 hours before
          { type: "email", timeBefore: 10080 } // 1 week before
        ]
      },
      {
        college: colleges[1]._id,
        title: "Entrance Exam for MBBS",
        description: "NEET entrance examination for MBBS admissions",
        eventType: "Exam Date",
        program: "MBBS",
        startDate: new Date(new Date().setDate(new Date().getDate() + 35)),
        endDate: new Date(new Date().setDate(new Date().getDate() + 35)),
        isAllDay: true,
        reminders: [
          { type: "email", timeBefore: 1440 } // 24 hours before
        ]
      },
      {
        college: colleges[2]._id,
        title: "Counseling Session",
        description: "Counseling session for selected candidates",
        eventType: "Counseling",
        program: "B.Tech",
        startDate: new Date(new Date().setDate(new Date().getDate() + 60)),
        endDate: new Date(new Date().setDate(new Date().getDate() + 60)),
        isAllDay: true,
        reminders: [
          { type: "email", timeBefore: 1440 } // 24 hours before
        ]
      }
    ];
    
    // Insert sample admission events
    const events = await AdmissionEvent.insertMany(sampleEvents);
    console.log(`Inserted ${events.length} admission events`);
    
    console.log('Admission events population complete!');
    process.exit(0);
  } catch (error) {
    console.error('Error populating admission events:', error);
    process.exit(1);
  }
}

populateAdmissionEvents();