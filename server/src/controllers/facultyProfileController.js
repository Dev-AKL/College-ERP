// server/src/controllers/facultyProfileController.js

const User = require('../models/User');
const FacultyDetails = require('../models/FacultyDetails');

const updateFacultyDetails = async (req, res) => {
  try {
    // Get the user ID from the authenticated request (via JWT middleware)
    const userId = req.user._id; 
    const { qualification, contactNo, department, designation, linkedin, other, additionalEmail } = req.body;

    // 1. Prepare professionalLinks object from request body
    const professionalLinks = { linkedin, other };

    // 2. Find the existing FacultyDetails document linked to the User
    let facultyDetails = await FacultyDetails.findOne({ user: userId });

    // 3. Logic to UPDATE or CREATE the FacultyDetails document
    if (facultyDetails) {
      // **A. UPDATE EXISTING DETAILS**
      facultyDetails.qualification = qualification;
      facultyDetails.contactNo = contactNo;
      facultyDetails.department = department;
      facultyDetails.designation = designation;
      facultyDetails.professionalLinks = professionalLinks;
      facultyDetails.additionalEmail = additionalEmail;
      await facultyDetails.save(); // Save the changes to the existing document
    } else {
      // **B. CREATE NEW DETAILS (First login/form submission)**
      facultyDetails = await FacultyDetails.create({
        user: userId,
        qualification,
        contactNo,
        department,
        designation,
        professionalLinks,
        additionalEmail,
      });
    }

    // 4. Update the core User model (Link details and set detailsComplete to true)
    // This step ensures the user is marked as fully onboarded.
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        facultyDetails: facultyDetails._id, // Link to the FacultyDetails document
        detailsComplete: true, // Mark profile as complete
      },
      { new: true }
    ).populate('facultyDetails'); // Populate the details for the response

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // 5. Send success response
    res.status(200).json({
      message: 'Faculty details updated successfully',
      user: updatedUser,
    });
  } catch (error) {
    console.error('Server error during faculty details update:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// We only export the update function. No delete function is created or exposed.
module.exports = { updateFacultyDetails };