// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

//Routing for user authentication

const authRoutes = require('./src/routes/authRoutes');

app.use('/api/auth', authRoutes);

const studentRoutes = require('./src/routes/studentRoutes');

app.use('/api/students', studentRoutes);

const adminRoutes = require('./src/routes/adminRoutes');

app.use('/api/admin', adminRoutes);

const assignmentRoutes = require('./src/routes/assignmentRoutes');
const submissionRoutes = require('./src/routes/submissionRoutes');

// Serve static files from the 'uploads' directory
app.use('/uploads', express.static('uploads'));
app.use('/uploads/submissions', express.static('uploads/submissions'));
app.use('/uploads/assignments', express.static('uploads/assignments'));

// Connect the new routes
app.use('/api/assignments', assignmentRoutes);
app.use('/api/submissions', submissionRoutes);

// MongoDB Connection
const MONGO_URI = process.env.MONGO_URI;
mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => console.error('MongoDB connection error:', err));

// Basic route for testing
app.get('/', (req, res) => {
  res.send('Welcome to the College ERP API!');
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});