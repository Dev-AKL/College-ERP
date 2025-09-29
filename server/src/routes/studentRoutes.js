// server/src/routes/studentRoutes.js

const express = require('express');
const router = express.Router();
const { updateStudentDetails, getStudentFees, confirmFeePayment } = require('../controllers/studentController');
const { protect } = require('../../middleware/authMiddleware');

router.put('/details', protect, updateStudentDetails);

// New: Route to get fee details
router.get('/fees', protect, getStudentFees);

// New: Route to confirm payment
router.post('/fees/confirm', protect, confirmFeePayment);

module.exports = router;