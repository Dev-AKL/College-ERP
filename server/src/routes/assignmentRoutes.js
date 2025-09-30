// server/src/routes/assignmentRoutes.js

const express = require('express');
const router = express.Router();
const { uploadInstructions, createAssignment, getFacultyAssignments, gradeSubmission } = require('../controllers/assignmentController');
const { protect } = require('../../middleware/authMiddleware');

// Route to create a new assignment (uploadInstructions middleware handles the file)
router.post('/create', protect, uploadInstructions.single('instructionsFile'), createAssignment);

// Route to get all assignments for the faculty to view submissions
router.get('/faculty/all', protect, getFacultyAssignments);

// Route to grade a specific submission
router.put('/grade/:submissionId', protect, gradeSubmission);

module.exports = router;