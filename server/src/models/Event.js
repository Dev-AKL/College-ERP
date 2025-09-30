// server/src/models/Event.js

const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        required: true,
    },
    eventDate: {
        type: Date,
        required: true,
    },
    startTime: String,
    endTime: String,
    location: String,
    category: {
        type: String,
        enum: ['Academic', 'Cultural', 'Sports', 'General'],
        default: 'General',
    },
    posterPath: String, // Path to the uploaded event poster
    isRegistrationRequired: {
        type: Boolean,
        default: false,
    },
    createdBy: { // Can be Admin or Faculty
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
}, { timestamps: true });

const Event = mongoose.model('Event', eventSchema);
module.exports = Event;