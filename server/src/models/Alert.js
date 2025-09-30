// server/src/models/Alert.js
//This model holds the main message and sender's information

const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
    subject: {
        type: String,
        required: true,
        trim: true,
    },
    message: {
        type: String,
        required: true,
    },
    sender: { // The Admin or Faculty who created the alert
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    recipient: { // The specific User who receives the alert
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    relatedAction: {
        type: String, // e.g., 'FEE_PAYMENT', 'ASSIGNMENT_SUBMISSION', 'DOCUMENT_UPLOAD'
        required: true,
    },
    relatedEntityId: {
        type: mongoose.Schema.Types.ObjectId, // ID of the specific fee, assignment, etc.
        default: null,
    },
}, { timestamps: true });

const Alert = mongoose.model('Alert', alertSchema);
module.exports = Alert;