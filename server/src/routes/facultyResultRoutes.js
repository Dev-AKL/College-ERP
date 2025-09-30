// server/src/routes/facultyResultRoutes.js

const express = require('express');
const router = express.Router();
const { getCoursesForGrading, submitStudentMarks, publishResults } = require('../controllers/facultyResultController');
const { protect } = require('../../middleware/authMiddleware');

// Faculty: Route to get a list of courses needing grading
router.get('/courses', protect, getCoursesForGrading);

// Faculty: Route to save/update marks for a single student
router.post('/marks', protect, submitStudentMarks);

// Faculty: Route to publish all results for a subject/semester
router.put('/publish', protect, publishResults);

module.exports = router;