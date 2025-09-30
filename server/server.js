// server.js

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const path = require('path'); // Core Node.js module for file paths

const app = express();
const PORT = process.env.PORT || 5000;

// --- Middleware ---
app.use(cors());
app.use(express.json()); // To parse incoming JSON requests

// --- Static File Serving (for uploads like QR codes and assignments) ---
// Note: This must be before any route handlers to work correctly.
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/uploads/submissions', express.static(path.join(__dirname, 'uploads/submissions')));
app.use('/uploads/assignments', express.static(path.join(__dirname, 'uploads/assignments')));
app.use('/uploads/events/posters', express.static(path.join(__dirname, 'uploads/events/posters')));


// --- Route Imports ---
const authRoutes = require('./src/routes/authRoutes');
const studentRoutes = require('./src/routes/studentRoutes');
const facultyRoutes = require('./src/routes/facultyRoutes'); // New Attendance Routes
const adminExamRoutes = require('./src/routes/adminExamRoutes'); // Exam Scheduling
const facultyResultRoutes = require('./src/routes/facultyResultRoutes'); // Faculty Grading
const studentExamRoutes = require('./src/routes/studentExamRoutes'); // Student Exam Viewing
const announcementRoutes = require('./src/routes/announcementRoutes'); // Alerts/Notifications
const assignmentRoutes = require('./src/routes/assignmentRoutes'); // Faculty Assignment Management
const submissionRoutes = require('./src/routes/submissionRoutes'); // Student Submission
const facultyProfileRoutes = require('./src/routes/facultyProfileRoutes');

// --- Route Mounting ---
app.use('/api/auth', authRoutes); // Login, Signup, Password Reset
app.use('/api/students', studentRoutes); // Student Details & General Data
app.use('/api/faculty', facultyRoutes); // Faculty Schedules & Attendance
app.use('/api/assignments', assignmentRoutes); // Faculty Assignment Management
app.use('/api/submissions', submissionRoutes); // Student Assignment Submission
app.use('/api/announcements', announcementRoutes); // Alerts & Notifications
app.use('/api/admin/exams', adminExamRoutes); // Admin Exam Scheduling & Oversight
app.use('/api/faculty/results', facultyResultRoutes); // Faculty Grading Interface
app.use('/api/student/exams', studentExamRoutes); // Student Exam/Result Viewing
app.use('/api/faculty', facultyProfileRoutes); // Use a dedicated path for faculty actions


// --- MongoDB Connection ---
const MONGO_URI = process.env.MONGO_URI;
mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => console.error('MongoDB connection error:', err));


// --- Basic Test Route ---
app.get('/', (req, res) => {
  res.send('Welcome to the College ERP API! All services are active.');
});

// --- Start the server ---
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});