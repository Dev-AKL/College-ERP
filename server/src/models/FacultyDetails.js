// server/src/models/FacultyDetails.js

const mongoose = require('mongoose');

const facultyDetailsSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  qualification: { // e.g., "Ph.D. in Computer Science"
    type: String,
    required: true,
  },
  contactNo: String,
  department: String, // e.g., "Computer Science", "Mechanical Engineering"
  designation: { // e.g., Assistant Professor, HOD
    type: String,
    required: true,
  },
  professionalLinks: { // For LinkedIn, ResearchGate, etc.
    linkedin: String,
    other: String,
  },
  additionalEmail: String,
}, {
  timestamps: true,
});

const FacultyDetails = mongoose.model('FacultyDetails', facultyDetailsSchema);
module.exports = FacultyDetails;