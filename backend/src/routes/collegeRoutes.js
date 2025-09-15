const express = require('express');
const {
  getColleges,
  getCollegeById,
  getNearbyColleges,
  getCollegesByProgram
} = require('../controllers/collegeController');

const router = express.Router();

// Public routes
router.get('/', getColleges);
router.get('/:id', getCollegeById);
router.get('/nearby', getNearbyColleges);
router.get('/programs/:programName', getCollegesByProgram);

module.exports = router;