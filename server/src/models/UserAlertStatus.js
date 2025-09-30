// server/src/models/UserAlertStatus.js
//This model manages the status for the student's view and the resolution state.

const mongoose = require('mongoose');

const userAlertStatusSchema = new mongoose.Schema({
    alert: { // Reference to the main alert content
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Alert',
        required: true,
    },
    user: { // The recipient (Student)
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    isRead: {
        type: Boolean,
        default: false,
    },
    studentActionTaken: { // Tracks if the student has completed the required action
        type: Boolean,
        default: false,
    },
    status: {
        type: String,
        enum: ['Active', 'Waiting for Confirmation', 'Resolved'],
        default: 'Active',
    },
    resolvedBy: { // Admin or Faculty who confirmed the resolution
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null,
    },
}, { timestamps: true });

const UserAlertStatus = mongoose.model('UserAlertStatus', userAlertStatusSchema);
module.exports = UserAlertStatus;