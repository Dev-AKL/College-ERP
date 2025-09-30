// server/src/controllers/eventController.js

const Event = require('../models/Event');
const EventRegistration = require('../models/EventRegistration');
const multer = require('multer');
const path = require('path');

// --- Multer Setup for Event Poster Uploads ---
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/events/posters/');
  },
  filename: function (req, file, cb) {
    cb(null, 'POSTER_' + Date.now() + path.extname(file.originalname));
  },
});
const uploadPoster = multer({ storage: storage });

// --- Core Event Management ---

// Admin/Faculty: Create a new event (Modals Flow)
const createEvent = async (req, res) => {
    try {
        const createdBy = req.user._id;
        const posterPath = req.file ? `/uploads/events/posters/${req.file.filename}` : undefined;
        
        const newEvent = await Event.create({
            ...req.body,
            createdBy,
            posterPath,
        });

        res.status(201).json({ message: 'Event created successfully', event: newEvent });
    } catch (error) {
        res.status(500).json({ message: 'Error creating event', details: error.message });
    }
};

// Admin/Faculty/Student: Get all upcoming events (Dashboard/Cards View)
const getAllUpcomingEvents = async (req, res) => {
    try {
        const events = await Event.find({ eventDate: { $gte: new Date() } }) // Only future events
            .select('title eventDate location category posterPath') // Key details for cards
            .sort('eventDate');

        res.status(200).json(events);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching events' });
    }
};

// Admin/Faculty: Get events created by a specific faculty (My Events)
const getMyEvents = async (req, res) => {
    try {
        const myEvents = await Event.find({ createdBy: req.user._id }).sort('-eventDate');
        res.status(200).json(myEvents);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching your events' });
    }
};

// Admin/Faculty: View all participants for a specific event
const getEventParticipants = async (req, res) => {
    try {
        const { eventId } = req.params;
        const participants = await EventRegistration.find({ event: eventId, isConfirmed: true })
            .select('name email participant -_id') // Show only successfully submitted participants
            .populate('participant', 'studentDetails'); 

        res.status(200).json(participants);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching participants' });
    }
};

// Student/Faculty: Register for an event (Modal Form Submission)
const registerForEvent = async (req, res) => {
    try {
        const { eventId } = req.params;
        const participantId = req.user._id;
        const { name, email } = req.body; // Assuming name/email are sent from the form

        // Prevent duplicate registration
        const existing = await EventRegistration.findOne({ event: eventId, participant: participantId });
        if (existing) {
            return res.status(400).json({ message: 'You are already registered for this event.' });
        }

        const newRegistration = await EventRegistration.create({
            event: eventId,
            participant: participantId,
            name,
            email,
        });

        res.status(201).json({ message: 'Registration successful', registration: newRegistration });
    } catch (error) {
        res.status(500).json({ message: 'Error registering for event' });
    }
};

module.exports = {
    uploadPoster,
    createEvent,
    getAllUpcomingEvents,
    getMyEvents,
    getEventParticipants,
    registerForEvent
};