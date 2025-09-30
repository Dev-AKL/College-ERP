// server/src/controllers/adminController.js

const User = require('../models/User');
const StudentDetails = require('../models/StudentDetails'); 
const crypto = require('crypto');
require('dotenv').config();
const multer = require('multer');
const path = require('path');

// Configure Multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// Controller to upload the QR code
const uploadQrCode = async (req, res) => {
  try {
    const adminId = req.user._id; // Assumes a logged-in admin
    const qrCodeUrl = `/uploads/${req.file.filename}`;

    const updatedAdmin = await User.findByIdAndUpdate(
      adminId,
      { qrCodeUrl },
      { new: true, runValidators: true }
    );

    if (!updatedAdmin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    res.status(200).json({
      message: 'QR code uploaded successfully',
      qrCodeUrl: updatedAdmin.qrCodeUrl,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Function to get all student payments
const getAllStudentPayments = async (req, res) => {
  try {
    const studentPayments = await StudentDetails.find({ 'fees.status': 'paid' })
      .select('user fees.semester fees.amount fees.status fees.transactionId fees.paidAt')
      .populate('user', 'name email');

    const algorithm = 'aes-256-cbc';
    const key = crypto.createHash('sha256').update(String(process.env.ENCRYPTION_KEY)).digest('base64').substr(0, 32);

    // Decrypt the transaction ID for each payment
    const decryptedPayments = studentPayments.map(payment => {
      const decryptedFees = payment.fees.map(fee => {
        if (fee.transactionId) {
          const parts = fee.transactionId.split(':');
          const iv = Buffer.from(parts[0], 'hex');
          const encrypted = parts[1];
          const decipher = crypto.createDecipheriv(algorithm, key, iv);
          let decrypted = decipher.update(encrypted, 'hex', 'utf8');
          decrypted += decipher.final('utf8');
          return { ...fee._doc, transactionId: decrypted };
        }
        return fee;
      });
      return { ...payment._doc, fees: decryptedFees };
    });

    res.status(200).json(decryptedPayments);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const getQrCodeUrl = async (req, res) => {
  try {
    const admin = await User.findOne({ role: 'admin' });
    if (!admin || !admin.qrCodeUrl) {
      return res.status(404).json({ message: 'QR code not found' });
    }
    res.status(200).json({ qrCodeUrl: admin.qrCodeUrl });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { upload, uploadQrCode, getAllStudentPayments, getQrCodeUrl };