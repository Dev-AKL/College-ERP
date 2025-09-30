//This will be operated by the admin. the exam schedule creation and operation and all the things

// server/src/models/ExamSchedule.js

const mongoose = require('mongoose');

const examScheduleSchema = new mongoose.Schema({
    semester: { type: String, required: true },
    course: { type: String, required: true }, // e.g., "B.Tech"
    subject: { type: String, required: true },
    examDate: { type: Date, required: true },
    startTime: { type: String, required: true }, // e.g., "09:30 AM"
    endTime: { type: String, required: true },
    examinationHall: { type: String, required: true },
    invigilator: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Admin user
}, { timestamps: true });

const ExamSchedule = mongoose.model('ExamSchedule', examScheduleSchema);
module.exports = ExamSchedule;