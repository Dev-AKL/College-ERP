// server/src/controllers/studentExamController.js

const ExamSchedule = require('../models/ExamSchedule');
const Result = require('../models/Result');

// Student: Get their exam schedule
const getStudentSchedule = async (req, res) => {
    try {
        // For simplicity, assuming the student's current course/semester is known (e.g., from their User details)
        const studentCourse = 'B.Tech'; // Replace with dynamic value from req.user
        const studentSemester = 'Semester 3'; // Replace with dynamic value from req.user

        const schedule = await ExamSchedule.find({ 
            course: studentCourse, 
            semester: studentSemester 
        }).sort('examDate'); // Show schedules chronologically

        res.status(200).json(schedule);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching exam schedule' });
    }
};

// Student: Get their published results
const getStudentResults = async (req, res) => {
    try {
        const studentId = req.user._id;

        const results = await Result.find({ 
            student: studentId, 
            published: true 
        }).sort('-semester -updatedAt');

        res.status(200).json(results);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching results' });
    }
};

module.exports = { getStudentSchedule, getStudentResults };