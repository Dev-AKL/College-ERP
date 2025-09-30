// server/src/controllers/assignmentController.js

const Assignment = require('../models/Assignment');
const Submission = require('../models/Submission');
const multer = require('multer');
const path = require('path');

// Multer setup for assignment files (instructions)
const assignmentStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/assignments/');
  },
  filename: function (req, file, cb) {
    cb(null, 'INSTRUCTION_' + Date.now() + path.extname(file.originalname));
  },
});
const uploadInstructions = multer({ storage: assignmentStorage });

// Create a new assignment
const createAssignment = async (req, res) => {
  try {
    const { title, description, dueDate, course, subject } = req.body;
    const faculty = req.user._id;

    // Check if an instructions file was uploaded
    const instructionsPath = req.file ? `/uploads/assignments/${req.file.filename}` : undefined;

    const newAssignment = await Assignment.create({
      title,
      description,
      dueDate,
      course,
      subject,
      faculty,
      instructionsPath,
    });

    res.status(201).json({
      message: 'Assignment created successfully',
      assignment: newAssignment,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', details: error.message });
  }
};

// Get all assignments for a faculty (to view submissions)
const getFacultyAssignments = async (req, res) => {
  try {
    const faculty = req.user._id;
    // Get assignments created by the faculty
    const assignments = await Assignment.find({ faculty });

    // For each assignment, get the number of submissions
    const assignmentsWithDetails = await Promise.all(assignments.map(async (assignment) => {
        const submissionCount = await Submission.countDocuments({ assignment: assignment._id });
        return {
            ...assignment._doc,
            submissionCount,
        };
    }));
    
    res.status(200).json(assignmentsWithDetails);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Grade a submitted assignment
const gradeSubmission = async (req, res) => {
  try {
    const { submissionId } = req.params;
    const { grade, feedback } = req.body;

    const submission = await Submission.findByIdAndUpdate(
      submissionId,
      { grade, feedback, isGraded: true },
      { new: true }
    );

    // Optional: Update the parent Assignment status if all are graded

    res.status(200).json({
      message: 'Submission graded successfully',
      submission,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { uploadInstructions, createAssignment, getFacultyAssignments, gradeSubmission };