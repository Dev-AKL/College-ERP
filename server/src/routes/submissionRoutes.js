// server/src/routes/submissionRoutes.js
//Student's side backend.

const express = require('express');
const router = express.Router();
const { uploadSubmission, submitAssignment, getStudentAssignments } = require('../controllers/submissionController');
const { protect } = require('../../middleware/authMiddleware');

// Route for student to submit an assignment (uploadSubmission middleware handles the file)
router.post('/submit/:assignmentId', protect, uploadSubmission.single('submissionFile'), submitAssignment);

// Route for student to view all assignments and their status
router.get('/student/all', protect, getStudentAssignments);

module.exports = router;