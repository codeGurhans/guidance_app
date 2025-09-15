const StudentSegment = require('../models/StudentSegment');

const createDefaultSegments = async () => {
  try {
    // Check if segments already exist
    const existingSegments = await StudentSegment.countDocuments();
    if (existingSegments > 0) {
      console.log('Default segments already exist');
      return;
    }

    // Create default segments
    const segments = [
      {
        name: 'High Achievers',
        description: 'Students with excellent academic performance and strong interest in competitive fields',
        criteria: {
          academicPerformance: {
            minGPA: 8.5,
            maxGPA: 10,
          },
          interests: ['Science', 'Mathematics', 'Engineering', 'Medicine'],
        },
      },
      {
        name: 'Creative Thinkers',
        description: 'Students with interests in arts, literature, and creative fields',
        criteria: {
          interests: ['Arts', 'Literature', 'Music', 'Design', 'Writing'],
        },
      },
      {
        name: 'Rural Students',
        description: 'Students from rural areas who may need additional support',
        criteria: {
          location: 'Rural',
        },
      },
      {
        name: 'Financial Need',
        description: 'Students who may require financial assistance for higher education',
        criteria: {
          financialStatus: 'low',
        },
      },
      {
        name: 'STEM Enthusiasts',
        description: 'Students with strong interest in Science, Technology, Engineering, and Mathematics',
        criteria: {
          interests: ['Science', 'Technology', 'Engineering', 'Mathematics', 'Computer Science'],
        },
      },
    ];

    // Insert the segments
    await StudentSegment.insertMany(segments);
    console.log('Default segments created successfully');
  } catch (error) {
    console.error('Error creating default segments:', error);
  }
};

module.exports = createDefaultSegments;