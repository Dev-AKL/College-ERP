// src/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['student', 'faculty', 'admin'],
    default: 'student',
  },

  studentDetails: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'StudentDetails',
  },
  detailsComplete: {
    type: Boolean,
    default: false,
  },

  academicCalendar: [{
        title: String,
        date: Date,
        type: {
            type: String,
            enum: ['holiday', 'event', 'cancellation'],
        },
    }],
  
}, {
  timestamps: true
});

// Hash the password before saving a new user
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to compare entered password with hashed password
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
module.exports = User;