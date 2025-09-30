// server/src/routes/facultyRoutes.js

const express = require('express');
const router = express.Router();
const { getDailySchedule, takeAttendance } = require('../controllers/facultyController');
const { protect } = require('../../middleware/authMiddleware'); // Your protection middleware

// Route 1: Get today's classes based on schedule and holidays
router.get('/schedule/today', protect, getDailySchedule);

// Route 2: Submit the attendance records
router.post('/attendance/record', protect, takeAttendance);

module.exports = router;