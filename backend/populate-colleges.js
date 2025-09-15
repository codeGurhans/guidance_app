const mongoose = require('mongoose');
const College = require('./src/models/College');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Sample colleges
const sampleColleges = [
  {
    name: "Delhi University",
    description: "One of India's premier universities offering a wide range of undergraduate and postgraduate programs.",
    address: {
      street: "University Enclave, South Campus",
      city: "New Delhi",
      state: "Delhi",
      country: "India",
      zipCode: "110021"
    },
    location: {
      type: "Point",
      coordinates: [77.2167, 28.5900] // [longitude, latitude]
    },
    contact: {
      phone: "+91-11-27661111",
      email: "contact@du.ac.in",
      website: "https://www.du.ac.in"
    },
    type: "University",
    programs: [
      {
        name: "Bachelor of Arts",
        level: "Bachelor",
        duration: 3,
        description: "Comprehensive undergraduate program in arts and humanities"
      },
      {
        name: "Bachelor of Science",
        level: "Bachelor",
        duration: 3,
        description: "Undergraduate program in various science disciplines"
      }
    ],
    admissionRequirements: {
      gpa: 8.5,
      standardizedTests: [
        {
          name: "CUET",
          minimumScore: 70
        }
      ],
      additionalRequirements: [
        "Entrance exam",
        "Personal interview"
      ]
    },
    facilities: [
      "Library",
      "Laboratories",
      "Hostel",
      "Sports Complex",
      "Medical Facility"
    ],
    accreditation: {
      status: "Accredited",
      agency: "NAAC"
    },
    established: 1922,
    studentCapacity: 50000,
    fees: {
      undergraduate: 5000,
      postgraduate: 8000
    }
  },
  {
    name: "Indian Institute of Technology Bombay",
    description: "Premier institute for technology and engineering education in India.",
    address: {
      street: "IIT Bombay, Powai",
      city: "Mumbai",
      state: "Maharashtra",
      country: "India",
      zipCode: "400076"
    },
    location: {
      type: "Point",
      coordinates: [72.9167, 19.1333] // [longitude, latitude]
    },
    contact: {
      phone: "+91-22-25761111",
      email: "contact@iitb.ac.in",
      website: "https://www.iitb.ac.in"
    },
    type: "Institute",
    programs: [
      {
        name: "Bachelor of Technology",
        level: "Bachelor",
        duration: 4,
        description: "Undergraduate program in various engineering disciplines"
      },
      {
        name: "Master of Technology",
        level: "Master",
        duration: 2,
        description: "Postgraduate program in specialized engineering fields"
      }
    ],
    admissionRequirements: {
      gpa: 9.0,
      standardizedTests: [
        {
          name: "JEE Advanced",
          minimumScore: 85
        }
      ],
      additionalRequirements: [
        "Entrance exam",
        "Personal interview"
      ]
    },
    facilities: [
      "Library",
      "Laboratories",
      "Hostel",
      "Sports Complex",
      "Medical Facility",
      "Research Centers"
    ],
    accreditation: {
      status: "Accredited",
      agency: "NAAC"
    },
    established: 1958,
    studentCapacity: 10000,
    fees: {
      undergraduate: 100000,
      postgraduate: 120000
    }
  },
  {
    name: "Jawaharlal Nehru University",
    description: "Leading research university in India, known for its programs in social sciences and humanities.",
    address: {
      street: "School of International Studies",
      city: "New Delhi",
      state: "Delhi",
      country: "India",
      zipCode: "110067"
    },
    location: {
      type: "Point",
      coordinates: [77.1667, 28.5333] // [longitude, latitude]
    },
    contact: {
      phone: "+91-11-26701111",
      email: "contact@jnu.ac.in",
      website: "https://www.jnu.ac.in"
    },
    type: "University",
    programs: [
      {
        name: "Bachelor of Arts (Honors)",
        level: "Bachelor",
        duration: 3,
        description: "Honors undergraduate program in arts and humanities"
      },
      {
        name: "Master of Arts",
        level: "Master",
        duration: 2,
        description: "Postgraduate program in various arts and humanities disciplines"
      }
    ],
    admissionRequirements: {
      gpa: 8.0,
      standardizedTests: [
        {
          name: "JNUEE",
          minimumScore: 60
        }
      ],
      additionalRequirements: [
        "Entrance exam",
        "Personal interview"
      ]
    },
    facilities: [
      "Library",
      "Laboratories",
      "Hostel",
      "Sports Complex",
      "Medical Facility"
    ],
    accreditation: {
      status: "Accredited",
      agency: "NAAC"
    },
    established: 1969,
    studentCapacity: 8000,
    fees: {
      undergraduate: 8000,
      postgraduate: 12000
    }
  }
];

async function populateColleges() {
  try {
    // Clear existing colleges
    await College.deleteMany({});
    
    // Insert sample colleges
    const colleges = await College.insertMany(sampleColleges);
    console.log(`Inserted ${colleges.length} colleges`);
    
    console.log('Colleges population complete!');
    process.exit(0);
  } catch (error) {
    console.error('Error populating colleges:', error);
    process.exit(1);
  }
}

populateColleges();