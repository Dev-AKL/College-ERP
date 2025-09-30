// server/src/models/Notification.js

const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    user: { // The recipient of the notification
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    announcement: { // Reference to the main announcement content
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Announcement',
        required: true,
    },
    isRead: {
        type: Boolean,
        default: false,
    },
    isAcknowledged: { // For the 'dismiss' feature
        type: Boolean,
        default: false,
    },
}, { timestamps: true });

const Notification = mongoose.model('Notification', notificationSchema);
module.exports = Notification;