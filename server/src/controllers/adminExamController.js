// server/src/controllers/adminExamController.js

const ExamSchedule = require('../models/ExamSchedule');
const Result = require('../models/Result');

// Admin: Create a new exam schedule entry
const createExamSchedule = async (req, res) => {
    try {
        const createdBy = req.user._id;
        // Assume req.body contains all necessary fields like semester, subject, examDate, etc.
        const newSchedule = await ExamSchedule.create({
            ...req.body,
            createdBy,
        });

        res.status(201).json({ message: 'Exam scheduled successfully', schedule: newSchedule });
    } catch (error) {
        res.status(500).json({ message: 'Error scheduling exam', details: error.message });
    }
};

// Admin: View all results (for oversight)
const viewAllResults = async (req, res) => {
    try {
        const results = await Result.find({})
            .populate('student', 'name studentDetails') // Populate student name and ID
            .select('-gradedBy'); // Don't show who graded the exam

        res.status(200).json(results);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching all results' });
    }
};

// Admin: Override a grade (Security sensitive)
const overrideGrade = async (req, res) => {
    try {
        const { resultId } = req.params;
        const { newMarks, newGrade, reason } = req.body;

        const updatedResult = await Result.findByIdAndUpdate(resultId, {
            marksObtained: newMarks,
            grade: newGrade,
            overrideReason: reason,
            published: true, // Auto-publish after admin override
        }, { new: true });

        res.status(200).json({ message: 'Grade overridden and published', result: updatedResult });
    } catch (error) {
        res.status(500).json({ message: 'Error overriding grade' });
    }
};

module.exports = { createExamSchedule, viewAllResults, overrideGrade };