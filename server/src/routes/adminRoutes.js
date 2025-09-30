// server/src/routes/adminRoutes.js

const express = require('express');
const router = express.Router();
const { upload, uploadQrCode, getQrCodeUrl } = require('../controllers/adminController');
const { protect } = require('../../middleware/authMiddleware');

router.post('/upload-qr', protect, upload.single('qrCode'), uploadQrCode);
router.get('/qr-code', protect, getQrCodeUrl);

module.exports = router;