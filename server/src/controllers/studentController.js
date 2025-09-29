// server/src/controllers/studentController.js

const User = require('../models/User');
const StudentDetails = require('../models/StudentDetails'); 
const crypto = require('crypto');
require('dotenv').config();

const updateStudentDetails = async (req, res) => {
  try {
    const userId = req.user._id; // Use _id from the user object
    const { rollNo, studentId, stream, course, courseTenure, contactNo, additionalEmail } = req.body;

    let studentDetails = await StudentDetails.findOne({ user: userId });

    if (studentDetails) {
      // If it exists, update it
      studentDetails.rollNo = rollNo;
      studentDetails.studentId = studentId;
      studentDetails.stream = stream;
      studentDetails.course = course;
      studentDetails.courseTenure = courseTenure;
      studentDetails.contactNo = contactNo;
      studentDetails.additionalEmail = additionalEmail;

      await studentDetails.save();
    } else {
      // If it doesn't exist, create a new one
      studentDetails = await StudentDetails.create({
        user: userId,
        rollNo,
        studentId,
        stream,
        course,
        courseTenure,
        contactNo,
        additionalEmail,
      });
    }

    // Now, update the User model to link to the StudentDetails document
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        studentDetails: studentDetails._id,
        detailsComplete: true, // This sets the user's detailsComplete to true
      },
      { new: true }
    ).populate('studentDetails'); 

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      message: 'Student details updated successfully',
      user: updatedUser,
    });
  } catch (error) {
    console.error('Server error during student details update:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// New: Get a student's fee details
const getStudentFees = async (req, res) => {
  try {
    const userId = req.user._id;

    const studentDetails = await StudentDetails.findOne({ user: userId });
    
    if (!studentDetails) {
      return res.status(404).json({ message: 'Student details not found' });
    }
    
    res.status(200).json({
      fees: studentDetails.fees,
      qrCodeUrl: 'your_qr_code_url_here', 
    });
    
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// New: Confirm a fee payment
const confirmFeePayment = async (req, res) => {
  try {
    const userId = req.user._id;
    const { semester, amount, transactionId } = req.body;

    const algorithm = 'aes-256-cbc';
    const key = crypto.createHash('sha256').update(String(process.env.ENCRYPTION_KEY)).digest('base64').substr(0, 32);
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    let encrypted = cipher.update(transactionId, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const encryptedTransactionId = iv.toString('hex') + ':' + encrypted;

    const studentDetails = await StudentDetails.findOne({ user: userId });

    if (!studentDetails) {
      return res.status(404).json({ message: 'Student details not found' });
    }

    // Find the fee entry and update its status
    const feeEntry = studentDetails.fees.find(fee => fee.semester === semester);
    if (!feeEntry) {
      return res.status(404).json({ message: 'Fee entry not found for this semester' });
    }

    feeEntry.status = 'paid';
    feeEntry.transactionId = encryptedTransactionId;
    feeEntry.paidAt = new Date();

    await studentDetails.save();

    res.status(200).json({
      message: 'Payment confirmed successfully',
      fees: studentDetails.fees,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { updateStudentDetails, getStudentFees, confirmFeePayment };