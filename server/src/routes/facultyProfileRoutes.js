// server/src/routes/facultyProfileRoutes.js

const express = require('express');
const router = express.Router();
const { updateFacultyDetails } = require('../controllers/facultyProfileController');
const { protect } = require('../../middleware/authMiddleware');

router.put('/profile/details', protect, updateFacultyDetails);

// We DELIBERATELY DO NOT add a router.delete() endpoint here.
// Attempting to delete the profile from the frontend will result in a 404 error.

module.exports = router;