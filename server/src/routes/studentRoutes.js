// server/src/routes/studentRoutes.js

const express = require('express');
const router = express.Router();
const { updateStudentDetails } = require('../controllers/studentController');
const { protect } = require('../../middleware/authMiddleware');

router.put('/details', protect, updateStudentDetails);

module.exports = router;