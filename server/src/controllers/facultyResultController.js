// server/src/controllers/facultyResultController.js

const Result = require('../models/Result');
const User = require('../models/User');

// Faculty: Get list of subjects/courses needing grading
const getCoursesForGrading = async (req, res) => {
    try {
        const facultyId = req.user._id;
        // In a real system, you'd check which subjects/courses the faculty teaches
        // For simplicity, we'll return a placeholder list of courses
        // You would query your Course or ClassSchedule model here
        const courses = [
            { subject: "Calculus I", semester: "Semester 1", count: 50, status: "Ready" },
            { subject: "Data Structures", semester: "Semester 3", count: 65, status: "Grading in Progress" },
        ];

        res.status(200).json(courses);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching grading courses' });
    }
};

// Faculty: Submit marks for a student
const submitStudentMarks = async (req, res) => {
    try {
        const gradedBy = req.user._id;
        const { studentId, subject, semester, marksObtained } = req.body;

        // Simple logic to determine Pass/Fail and Grade
        const status = marksObtained >= 40 ? 'Pass' : 'Fail';
        const grade = marksObtained >= 90 ? 'A' : (marksObtained >= 80 ? 'B' : 'C'); // Simplified grading

        const newResult = await Result.findOneAndUpdate(
            { student: studentId, subject, semester },
            { marksObtained, status, grade, gradedBy, published: false }, // Not published yet
            { new: true, upsert: true } // Create if not exists
        );

        res.status(201).json({ message: 'Marks saved successfully', result: newResult });
    } catch (error) {
        res.status(500).json({ message: 'Error submitting marks' });
    }
};

// Faculty: Bulk Publish Results for a subject/semester
const publishResults = async (req, res) => {
    try {
        const { subject, semester } = req.body;
        
        // Find all results for the subject/semester and mark as published
        const updateResult = await Result.updateMany(
            { subject, semester, published: false },
            { published: true }
        );

        // System would send bulk notifications here (UX flow step)

        res.status(200).json({ 
            message: `Successfully published ${updateResult.modifiedCount} results for ${subject}.`
        });
    } catch (error) {
        res.status(500).json({ message: 'Error publishing results' });
    }
};

module.exports = { getCoursesForGrading, submitStudentMarks, publishResults };