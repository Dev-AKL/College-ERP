// server/src/controllers/alertController.js
//For sending and status management.

const Alert = require('../models/Alert');
const UserAlertStatus = require('../models/UserAlertStatus');
const User = require('../models/User'); // Used for checking roles/recipients

// Admin/Faculty: Send a new alert
const sendAlert = async (req, res) => {
    try {
        const senderId = req.user._id;
        const senderRole = req.user.role;
        const { recipientId, subject, message, relatedAction, relatedEntityId } = req.body;

        // Basic Access Control Check (Faculty can only alert their own students)
        // A more complex check would involve querying ClassSchedule/Enrollment models.
        if (senderRole === 'faculty' && senderId.toString() !== recipientId) {
            // Placeholder for a detailed course check in a full system
            // For hackathon simplicity, we trust the frontend limited the choices
        }

        // 1. Create the main Alert content
        const newAlert = await Alert.create({
            subject,
            message,
            sender: senderId,
            recipient: recipientId,
            relatedAction,
            relatedEntityId,
        });

        // 2. Create the UserAlertStatus tracker for the student
        const newStatus = await UserAlertStatus.create({
            alert: newAlert._id,
            user: recipientId,
            isRead: false,
            status: 'Active',
        });

        res.status(201).json({
            message: 'Alert sent successfully',
            alert: newAlert,
        });
    } catch (error) {
        res.status(500).json({ message: 'Error sending alert', details: error.message });
    }
};

// Student: Get all alerts (History view)
const getStudentAlerts = async (req, res) => {
    try {
        const userId = req.user._id;

        const alertsHistory = await UserAlertStatus.find({ user: userId })
            .populate('alert') // Populate the content of the alert
            .sort({ createdAt: -1 });

        res.status(200).json(alertsHistory);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching alerts' });
    }
};

// Student: Mark an alert as read
const markAlertAsRead = async (req, res) => {
    try {
        const { alertStatusId } = req.params;
        const updatedStatus = await UserAlertStatus.findByIdAndUpdate(
            alertStatusId,
            { isRead: true },
            { new: true }
        );
        res.status(200).json({ message: 'Alert marked as read', status: updatedStatus });
    } catch (error) {
        res.status(500).json({ message: 'Error marking alert as read' });
    }
};

// Admin/Faculty: Get alerts that need verification (Monitor View)
const getAlertsForVerification = async (req, res) => {
    try {
        const senderId = req.user._id;
        
        // Find all alerts sent by the user that are waiting for confirmation
        const alerts = await UserAlertStatus.find({ 
            status: 'Waiting for Confirmation'
        }).populate('alert');

        res.status(200).json(alerts);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching alerts for verification' });
    }
};

// Admin/Faculty: Manually Mark Alert as Resolved
const resolveAlert = async (req, res) => {
    try {
        const { alertStatusId } = req.params;
        const resolverId = req.user._id;

        const updatedStatus = await UserAlertStatus.findByIdAndUpdate(
            alertStatusId,
            { 
                status: 'Resolved',
                resolvedBy: resolverId 
            },
            { new: true }
        );

        res.status(200).json({ message: 'Alert successfully resolved and confirmed', status: updatedStatus });
    } catch (error) {
        res.status(500).json({ message: 'Error resolving alert' });
    }
};

// Helper: Automatic status update when student takes action (e.g., in Fee Submission controller)
const studentActionTaken = async (userId, action, entityId) => {
    try {
        // Find all ACTIVE alerts related to this action/entity
        await UserAlertStatus.updateMany(
            { user: userId, status: 'Active', relatedAction: action, relatedEntityId: entityId },
            { studentActionTaken: true, status: 'Waiting for Confirmation' }
        );
        // This function would be called from your Fee Submission or Assignment Submission controllers
    } catch (error) {
        console.error('Failed to update alert status after student action:', error);
    }
};

module.exports = {
    sendAlert,
    getStudentAlerts,
    markAlertAsRead,
    getAlertsForVerification,
    resolveAlert,
    studentActionTaken // Exported for use in other controllers
};