// server/src/routes/adminRoutes.js

const express = require('express');
const router = express.Router();
const { upload, uploadQrCode } = require('../controllers/adminController');
const { protect } = require('../../middleware/authMiddleware');

router.post('/upload-qr', protect, upload.single('qrCode'), uploadQrCode);

module.exports = router;