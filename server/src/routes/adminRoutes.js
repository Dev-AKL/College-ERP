// server/src/routes/adminRoutes.js

const express = require('express');
const router = express.Router();
const { upload, uploadQrCode, getQrCodeUrl } = require('../controllers/adminController');
const { protect } = require('../../middleware/authMiddleware');
const { getPaymentForVerification, processRefund } = require('../controllers/adminController'); // Import the new functions

// Admin: Route to search for a paid fee entry for verification (UX Flow Step 1)
router.get('/financials/payment-verify', protect, getPaymentForVerification);

// Admin: Route to process and record the refund transaction (UX Flow Step 2)
router.post('/financials/refund', protect, processRefund);

router.post('/upload-qr', protect, upload.single('qrCode'), uploadQrCode);
router.get('/qr-code', protect, getQrCodeUrl);

module.exports = router;