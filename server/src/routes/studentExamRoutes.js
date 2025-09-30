// server/src/routes/studentExamRoutes.js

const express = require('express');
const router = express.Router();
const { getStudentSchedule, getStudentResults } = require('../controllers/studentExamController');
const { protect } = require('../../middleware/authMiddleware');

// Student: Route to get the student's personal exam schedule
router.get('/schedule', protect, getStudentSchedule);

// Student: Route to get the student's published results
router.get('/results', protect, getStudentResults);

module.exports = router;