// server/src/models/Attendance.js

const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
    classSchedule: { type: mongoose.Schema.Types.ObjectId, ref: 'ClassSchedule', required: true },
    faculty: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, required: true, default: Date.now },
    isTaken: { type: Boolean, default: true }, // Ensures we know attendance was attempted
    students: [{
        student: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        status: {
            type: String,
            enum: ['Present', 'Absent', 'Leave'],
            default: 'Absent',
        },
    }],
}, { timestamps: true });

const Attendance = mongoose.model('Attendance', attendanceSchema);
module.exports = Attendance;