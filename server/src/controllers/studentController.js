// server/src/controllers/studentController.js

const User = require('../models/User');
const StudentDetails = require('../models/StudentDetails'); // Import the new model

const updateStudentDetails = async (req, res) => {
  try {
    const userId = req.user.id;
    const { rollNo, studentId, stream, course, courseTenure, contactNo, additionalEmail } = req.body;

    // Check if a StudentDetails document already exists for this user
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
      studentDetails.detailsComplete = true;

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
        detailsComplete: true,
      });
    }

    // Now, update the User model to link to the StudentDetails document
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        studentDetails: studentDetails._id,
        detailsComplete: true,
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
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { updateStudentDetails };