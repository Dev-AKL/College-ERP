// server/src/controllers/submissionController.js

const Assignment = require('../models/Assignment');
const Submission = require('../models/Submission');
const multer = require('multer');
const path = require('path');

// Multer setup for student submissions
const submissionStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/submissions/');
  },
  filename: function (req, file, cb) {
    cb(null, 'SUBMISSION_' + Date.now() + path.extname(file.originalname));
  },
});
const uploadSubmission = multer({ storage: submissionStorage });

// Submit an assignment
const submitAssignment = async (req, res) => {
  try {
    const student = req.user._id;
    const assignmentId = req.params.assignmentId;
    const filePath = `/uploads/submissions/${req.file.filename}`;

    // Prevent duplicate submissions: check if a submission already exists
    const existingSubmission = await Submission.findOne({ assignment: assignmentId, student });
    if (existingSubmission) {
        return res.status(400).json({ message: 'You have already submitted this assignment.' });
    }

    const newSubmission = await Submission.create({
      assignment: assignmentId,
      student,
      filePath,
    });

    res.status(201).json({
      message: 'Assignment submitted successfully',
      submission: newSubmission,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all assignments available to a student (with submission status)
const getStudentAssignments = async (req, res) => {
    try {
        const student = req.user._id;
        // Logic to determine which courses/subjects the student is enrolled in would go here.
        // For simplicity, we'll fetch all assignments for now.

        const assignments = await Assignment.find({});
        
        const assignmentsWithStatus = await Promise.all(assignments.map(async (assignment) => {
            const submission = await Submission.findOne({ assignment: assignment._id, student });
            return {
                ...assignment._doc,
                submissionStatus: submission ? (submission.grade !== null ? 'Graded' : 'Submitted') : 'Pending',
                submissionDetails: submission ? submission : null,
            };
        }));

        res.status(200).json(assignmentsWithStatus);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { uploadSubmission, submitAssignment, getStudentAssignments };