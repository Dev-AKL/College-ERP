// server/src/models/ClassSchedule.js

const mongoose = require('mongoose');

const classScheduleSchema = new mongoose.Schema({
    course: { type: String, required: true },
    subject: { type: String, required: true },
    faculty: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    dayOfWeek: {
        type: String,
        required: true,
        enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    },
    startTime: { type: String, required: true }, // e.g., "09:00"
    endTime: { type: String, required: true },   // e.g., "10:00"
    isCanceled: { type: Boolean, default: false }, // For ad-hoc, long-term cancellations
    cancellationReason: String,
}, { timestamps: true });

const ClassSchedule = mongoose.model('ClassSchedule', classScheduleSchema);
module.exports = ClassSchedule;