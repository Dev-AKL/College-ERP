// server/src/models/Assignment.js

const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: String,
    dueDate: {
        type: Date,
        required: true,
    },
    course: { // To easily link assignments to specific courses
        type: String,
        required: true,
    },
    subject: {
        type: String,
        required: true,
    },
    faculty: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    // Optional: Path to instructions file uploaded by faculty
    instructionsPath: String,
    isGraded: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: true,
});

const Assignment = mongoose.model('Assignment', assignmentSchema);
module.exports = Assignment;