// server/src/models/Result.js
//Faculty or the admin operates with this

const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema({
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    course: { type: String, required: true },
    subject: { type: String, required: true },
    semester: { type: String, required: true },
    marksObtained: { type: Number, required: true },
    maxMarks: { type: Number, default: 100 },
    grade: { type: String },
    status: { type: String, enum: ['Pass', 'Fail', 'Incomplete'], default: 'Incomplete' },
    published: { type: Boolean, default: false }, // Only true when ready for student viewing
    gradedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Faculty/Admin
    overrideReason: String, // For admin overrides
}, { timestamps: true });

const Result = mongoose.model('Result', resultSchema);
module.exports = Result;