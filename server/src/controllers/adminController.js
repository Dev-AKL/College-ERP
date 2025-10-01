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
    const key = crypto.createHash('sha256').update(String(process.env.ENCRYPTION_KEY)).digest('base64').slice(0, 32);

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

//Logic for User Management Section

// server/src/controllers/adminController.js

const FacultyDetails = require('../models/FacultyDetails');
const Attendance = require('../models/Attendance');
const Submission = require('../models/Submission');
const Result = require('../models/Result');
const Alert = require('../models/Alert');
const UserAlertStatus = require('../models/UserAlertStatus');
const EventRegistration = require('../models/EventRegistration'); // Make sure this is imported
const fs = require('fs/promises'); // For file system operations

// Helper function to handle the deletion of a single file from the server
const deleteFile = async (filePath) => {
    if (filePath) {
        try {
            // Construct the local server path from the stored public URL
            const localPath = path.join(__dirname, '..', '..', filePath); 
            await fs.unlink(localPath);
        } catch (err) {
            // Ignore if the file doesn't exist (EENOENT), but log other errors
            if (err.code !== 'ENOENT') {
                console.error(`Failed to delete file ${filePath}:`, err);
            }
        }
    }
};

// --- Admin: Search and View Users (UX Flow Step 1) ---
const searchUsers = async (req, res) => {
    try {
        const { query, role } = req.query;
        let filters = {};

        // Filter by role if provided
        if (role) {
            filters.role = role;
        }

        // Search by name or email if query is provided
        if (query) {
            filters.$or = [
                { name: { $regex: query, $options: 'i' } },
                { email: { $regex: query, $options: 'i' } },
            ];
        }

        // Fetch users, excluding the password field
        const users = await User.find(filters)
            .select('-password -__v')
            .sort('name'); 

        // Note: For hackathon simplicity, searching by Student ID/Roll No 
        // would require an additional query across the StudentDetails collection.

        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: 'Error searching users.', details: error.message });
    }
};

// --- Admin: Update User Role/Details (UX Flow Step 2) ---
const updateUserInfoByAdmin = async (req, res) => {
    try {
        const { userId } = req.params;
        const { name, email, role } = req.body; // Add more fields as needed

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { name, email, role },
            { new: true, runValidators: true }
        ).select('-password -__v');

        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found.' });
        }

        res.status(200).json({ message: 'User profile updated successfully.', user: updatedUser });
    } catch (error) {
        res.status(500).json({ message: 'Error updating user info.', details: error.message });
    }
};

// --- Admin: Delete User (Cascading Delete - UX Flow Step 3) ---
const deleteUserByAdmin = async (req, res) => {
    try {
        const { userId } = req.params;
        const userToDelete = await User.findById(userId);

        if (!userToDelete) {
            return res.status(404).json({ message: 'User not found.' });
        }

        // CRITICAL SECURITY CHECK: Prevent deleting another admin unless explicitly allowed.
        if (userToDelete.role === 'admin' && req.user._id.toString() !== userId) {
             return res.status(403).json({ message: 'Forbidden: Cannot delete another admin account.' });
        }
        
        // --- 1. Perform Cascading Delete on Linked Data ---
        
        // A. Delete Profile Details (Faculty or Student)
        if (userToDelete.role === 'faculty' && userToDelete.facultyDetails) {
            await FacultyDetails.findByIdAndDelete(userToDelete.facultyDetails);
        } else if (userToDelete.role === 'student' && userToDelete.studentDetails) {
            // Note: In a full system, you would check if StudentDetails is the correct model to delete
            await StudentDetails.findByIdAndDelete(userToDelete.studentDetails);
        }
        
        // B. Delete Academic/Record Data
        if (userToDelete.role === 'student') {
            await Result.deleteMany({ student: userId });
            
            // Delete Submissions and their physical files
            const submissions = await Submission.find({ student: userId });
            for (const sub of submissions) {
                await deleteFile(sub.filePath); // Physical file deletion
            }
            await Submission.deleteMany({ student: userId });
        }
        
        // C. Clean up Attendance Records (Removes the user's entry from all past class records)
        await Attendance.updateMany(
            { 'students.student': userId },
            { $pull: { students: { student: userId } } }
        );

        // D. Delete Alerts and Alert Statuses
        await Alert.deleteMany({ $or: [{ sender: userId }, { recipient: userId }] });
        await UserAlertStatus.deleteMany({ user: userId });

        // E. Delete Event Registrations
        await EventRegistration.deleteMany({ participant: userId });

        // --- 2. Final Delete of User Document ---
        await User.findByIdAndDelete(userId);

        res.status(200).json({ message: `User ${userToDelete.email} and all associated records have been permanently deleted.` });

    } catch (error) {
        console.error('CRITICAL Error during cascading user deletion:', error);
        res.status(500).json({ message: 'Server error during deletion process.' });
    }
};

// ... (Existing imports: User, StudentDetails, crypto, etc.)
const Refund = require('../models/Refund'); // Import the new model

// Helper function to decrypt the transaction ID
const decryptTransactionId = (encryptedTransactionId) => {
    try {
        const algorithm = 'aes-256-cbc';
        const key = crypto.createHash('sha256').update(String(process.env.ENCRYPTION_KEY)).digest('base64').slice(0, 32);
        
        const parts = encryptedTransactionId.split(':');
        const iv = Buffer.from(parts[0], 'hex');
        const encrypted = parts[1];
        
        const decipher = crypto.createDecipheriv(algorithm, key, iv);
        let decrypted = decipher.update(encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    } catch (error) {
        console.error('Decryption failed:', error);
        return 'DECRYPTION_FAILED';
    }
};

// Admin: Get a specific payment for refund verification
const getPaymentForVerification = async (req, res) => {
    try {
        const { studentId, semester } = req.query; // Admin searches by student ID and semester

        const studentDetails = await StudentDetails.findOne({ user: studentId });

        if (!studentDetails) {
            return res.status(404).json({ message: 'Student not found.' });
        }

        const feeEntry = studentDetails.fees.find(fee => fee.semester === semester && fee.status === 'paid');
        
        if (!feeEntry) {
            return res.status(404).json({ message: 'Paid fee entry not found for this semester.' });
        }

        // Decrypt the sensitive transaction ID for Admin viewing
        const decryptedTransactionId = decryptTransactionId(feeEntry.transactionId);

        res.status(200).json({
            message: 'Payment details fetched successfully.',
            feeDetails: {
                ...feeEntry.toObject(),
                transactionId: decryptedTransactionId // Display decrypted ID
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching payment details.', details: error.message });
    }
};

// Admin: Process and record a refund (UX Flow Step 2)
const processRefund = async (req, res) => {
    try {
        const adminProcessedBy = req.user._id;
        const { originalFeeEntryId, studentId, refundAmount, reason, originalTransactionId } = req.body;

        // 1. Record the refund transaction
        const newRefund = await Refund.create({
            originalTransactionId: originalTransactionId, // Stored as plain text in Refund model (auditing)
            originalFeeEntry: originalFeeEntryId,
            student: studentId,
            adminProcessedBy,
            refundAmount,
            reason,
        });

        // 2. Update the specific fee entry in StudentDetails (Optional: Mark status)
        // In this implementation, we simply record the refund but don't alter the fee status from 'paid'
        // to keep the original payment record clean. You might add a 'refunded' field to StudentDetails.fees
        
        // 3. Send Notification to Student (UX Flow Step 3)
        // In a real system, you would trigger your alert/notification system here
        
        res.status(200).json({
            message: 'Refund successfully processed and logged.',
            refund: newRefund,
        });
    } catch (error) {
        res.status(500).json({ message: 'Error processing refund.', details: error.message });
    }
};

module.exports = { searchUsers, updateUserInfoByAdmin, deleteUserByAdmin ,upload, uploadQrCode, getAllStudentPayments, getQrCodeUrl, getPaymentForVerification,processRefund };