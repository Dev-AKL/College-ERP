// server/src/models/Announcement.js
//This model holds the main body and targeting information for the announcement.

const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
    },
    content: {
        type: String,
        required: true,
    },
    createdBy: { // The Admin user who created the announcement
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    recipientRoles: [{ // Target groups: ['student', 'faculty', 'admin', 'departmentName']
        type: String,
        required: true,
    }],
    publishDate: {
        type: Date,
        default: Date.now,
    },
    expiryDate: Date, // When the announcement should be archived/removed
    type: {
        type: String,
        enum: ['General', 'Event', 'Holiday', 'Urgent'], // For filtering
        default: 'General',
    },
    // Optional: Reference to an associated Event or ClassSchedule ID
    relatedEntity: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event', // Can be used for Event or other related data
    },
}, { timestamps: true });

const Announcement = mongoose.model('Announcement', announcementSchema);
module.exports = Announcement;