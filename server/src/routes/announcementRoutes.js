// server/src/routes/announcementRoutes.js

const express = require('express');
const router = express.Router();
const {
    createAnnouncement,
    getUnreadNotificationCount,
    getNotificationHistory,
    markNotificationAsRead,
    getSentAnnouncements
} = require('../controllers/announcementController');
const { protect } = require('../../middleware/authMiddleware');

// Admin/Faculty/Student: Get unread count (Bell Icon)
router.get('/count/unread', protect, getUnreadNotificationCount);

// Admin/Faculty/Student: Get full history (Dedicated Dashboard Section)
router.get('/history', protect, getNotificationHistory);

// Admin: Create a new announcement
router.post('/create', protect, createAnnouncement);

// Admin: View all sent announcements
router.get('/sent', protect, getSentAnnouncements);

// All Users: Mark a message as read (Modal Acknowledgment)
router.put('/read/:notificationId', protect, markNotificationAsRead);

module.exports = router;