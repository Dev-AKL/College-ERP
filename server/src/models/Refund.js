// server/src/models/Refund.js

const mongoose = require('mongoose');

const refundSchema = new mongoose.Schema({
    originalTransactionId: {
        type: String,
        required: true,
    },
    originalFeeEntry: { // Reference to the specific fee entry in StudentDetails.fees
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    },
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    adminProcessedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    refundAmount: {
        type: Number,
        required: true,
    },
    reason: {
        type: String,
        required: true,
    },
    refundStatus: {
        type: String,
        enum: ['Processed', 'Pending', 'Failed'],
        default: 'Processed',
    },
    refundProcessedAt: {
        type: Date,
        default: Date.now,
    },
    // In a real system, you'd store the destination bank/UPI details here too.
}, { timestamps: true });

const Refund = mongoose.model('Refund', refundSchema);
module.exports = Refund;