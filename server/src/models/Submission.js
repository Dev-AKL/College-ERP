// server/src/models/Submission.js

const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
    assignment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Assignment',
        required: true,
    },
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    filePath: { // Path to the file uploaded by the student
        type: String,
        required: true,
    },
    isSubmitted: {
        type: Boolean,
        default: true,
    },
    grade: {
        type: Number,
        default: null,
    },
    feedback: String,
    submittedAt: {
        type: Date,
        default: Date.now,
    }
}, {
    timestamps: true,
});

const Submission = mongoose.model('Submission', submissionSchema);
module.exports = Submission;