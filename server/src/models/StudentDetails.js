// server/src/models/StudentDetails.js

const mongoose = require('mongoose');

const studentDetailsSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  rollNo: {
    type: String,
    unique: true,
    sparse: true, // Allows null values but enforces uniqueness for non-null values
  },
  studentId: {
    type: String,
    unique: true,
    sparse: true,
  },
  stream: String,
  course: String,
  courseTenure: String,
  contactNo: String,
  additionalEmail: String,

  fees: [{
    semester: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['paid', 'pending'],
      default: 'pending',
    },
    transactionId: String,
    paidAt: Date,
  }],

}, {
  timestamps: true,
});

const StudentDetails = mongoose.model('StudentDetails', studentDetailsSchema);
module.exports = StudentDetails;