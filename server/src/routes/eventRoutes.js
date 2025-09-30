// server/src/routes/eventRoutes.js

const express = require('express');
const router = express.Router();
const { 
    uploadPoster,
    createEvent,
    getAllUpcomingEvents,
    getMyEvents,
    getEventParticipants,
    registerForEvent
} = require('../controllers/eventController');
const { protect } = require('../../middleware/authMiddleware');

// Public/General View Routes (All Users)
router.get('/upcoming', protect, getAllUpcomingEvents);
router.post('/register/:eventId', protect, registerForEvent);

// Admin/Faculty Management Routes
router.post('/create', protect, uploadPoster.single('eventPoster'), createEvent); // Handles file upload
router.get('/my-events', protect, getMyEvents);
router.get('/participants/:eventId', protect, getEventParticipants);

module.exports = router;