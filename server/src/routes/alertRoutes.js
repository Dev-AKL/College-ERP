// server/src/routes/alertRoutes.js

const express = require('express');
const router = express.Router();
const {
    sendAlert,
    getStudentAlerts,
    markAlertAsRead,
    getAlertsForVerification,
    resolveAlert,
} = require('../controllers/alertController');
const { protect } = require('../../middleware/authMiddleware');

// General Alert Routes (All Users)
router.post('/send', protect, sendAlert);

// Student Routes (Viewing)
router.get('/history', protect, getStudentAlerts);
router.put('/read/:alertStatusId', protect, markAlertAsRead); // Student marks as read

// Admin/Faculty Routes (Monitor & Resolve)
router.get('/verification', protect, getAlertsForVerification);
router.put('/resolve/:alertStatusId', protect, resolveAlert); // Admin/Faculty confirms resolution

module.exports = router;