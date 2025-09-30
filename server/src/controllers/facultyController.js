// server/src/controllers/facultyController.js

const ClassSchedule = require('../models/ClassSchedule');
const Attendance = require('../models/Attendance');
const User = require('../models/User');

// Helper function to format date for comparison (YYYY-MM-DD)
const formatDateToCompare = (date) => {
    return date.toISOString().split('T')[0];
};

const getDailySchedule = async (req, res) => {
    try {
        const facultyId = req.user._id;
        const today = new Date();
        const todayString = formatDateToCompare(today);
        const dayOfWeek = today.toLocaleDateString('en-US', { weekday: 'long' });

        // 1. Check for Holiday/Cancellation on the Academic Calendar
        const admin = await User.findOne({ role: 'admin' }).select('academicCalendar');
        const isAcademicBreak = admin.academicCalendar.some(event =>
            formatDateToCompare(event.date) === todayString && event.type === 'holiday'
        );

        if (isAcademicBreak) {
            return res.status(200).json({ message: 'You have no classes to take today (Scheduled Holiday).' });
        }

        // 2. Fetch all scheduled classes for today
        const scheduledClasses = await ClassSchedule.find({
            faculty: facultyId,
            dayOfWeek: dayOfWeek,
            isCanceled: false,
        });

        if (scheduledClasses.length === 0) {
            return res.status(200).json({ message: 'You have no classes to take today.' });
        }

        // 3. Check for specific class cancellations (Admin Announcements/Ad-hoc)
        const activeClasses = scheduledClasses.filter(classItem => {
            const isCanceledByAdmin = admin.academicCalendar.some(event =>
                formatDateToCompare(event.date) === todayString && 
                event.type === 'cancellation' &&
                event.title.includes(classItem.subject) // Simple way to check cancellation by subject name
            );
            return !isCanceledByAdmin;
        });
        
        if (activeClasses.length === 0) {
            return res.status(200).json({ message: 'All scheduled classes for today have been canceled.' });
        }

        res.status(200).json(activeClasses);

    } catch (error) {
        console.error("Error fetching daily schedule:", error);
        res.status(500).json({ message: 'Server error fetching schedule.' });
    }
};

const takeAttendance = async (req, res) => {
    try {
        const { classScheduleId, studentAttendance } = req.body; // studentAttendance is an array of { studentId, status }
        const facultyId = req.user._id;

        // Prevent duplicate attendance records for the same class/day
        const existingAttendance = await Attendance.findOne({
            classSchedule: classScheduleId,
            date: { $gte: new Date().setHours(0, 0, 0, 0), $lt: new Date().setHours(23, 59, 59, 999) }
        });

        if (existingAttendance) {
             return res.status(400).json({ message: 'Attendance for this class has already been recorded today.' });
        }
        
        // Map frontend data to the database schema
        const students = studentAttendance.map(sa => ({
            student: sa.studentId,
            status: sa.status,
        }));

        const newAttendance = await Attendance.create({
            classSchedule: classScheduleId,
            faculty: facultyId,
            students,
        });

        res.status(201).json({
            message: 'Attendance recorded successfully',
            attendance: newAttendance,
        });

    } catch (error) {
        res.status(500).json({ message: 'Server error recording attendance.' });
    }
};

module.exports = { getDailySchedule, takeAttendance };