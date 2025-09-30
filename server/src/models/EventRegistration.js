// server/src/models/EventRegistration.js

const mongoose = require('mongoose');

const eventRegistrationSchema = new mongoose.Schema({
    event: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event',
        required: true,
    },
    participant: { // The User who registered
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    name: { type: String, required: true },
    email: { type: String, required: true },
    // You can add more registration fields here if the form requires it
    isConfirmed: { // Can be used for attendance tracking if needed
        type: Boolean,
        default: true, // Assuming form submission is successful confirmation
    }
}, { timestamps: true });

const EventRegistration = mongoose.model('EventRegistration', eventRegistrationSchema);
module.exports = EventRegistration;