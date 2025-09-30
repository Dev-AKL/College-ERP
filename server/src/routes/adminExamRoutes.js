// server/src/routes/adminExamRoutes.js

const express = require('express');
const router = express.Router();
const { createExamSchedule, viewAllResults, overrideGrade } = require('../controllers/adminExamController');
const { protect } = require('../../middleware/authMiddleware'); // Your universal protection middleware

// Admin: Route to create a new exam schedule entry
router.post('/schedule', protect, createExamSchedule);

// Admin: Route to view all results for oversight
router.get('/results/all', protect, viewAllResults);

// Admin: Route to override a specific student's grade
router.put('/grade/override/:resultId', protect, overrideGrade);

module.exports = router;