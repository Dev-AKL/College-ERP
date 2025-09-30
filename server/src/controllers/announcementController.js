// server/src/controllers/announcementController.js

const Announcement = require('../models/Announcement');
const Notification = require('../models/Notification');
const User = require('../models/User');

// Admin: Create and Publish a new announcement
const createAnnouncement = async (req, res) => {
    try {
        // NOTE: This assumes the sender is an Admin based on front-end access control
        const createdBy = req.user._id;
        const { title, content, recipientRoles, type, expiryDate, relatedEntity } = req.body;

        const newAnnouncement = await Announcement.create({
            title,
            content,
            createdBy,
            recipientRoles,
            type,
            expiryDate,
            relatedEntity,
        });

        // --- Logic to create Notifications for all target users (Real-Time Push) ---
        
        // 1. Find all target users (simplified query)
        const targetUsers = await User.find({ 
            $or: recipientRoles.map(role => ({ role: role })) // Finds users by their roles
        }).select('_id');

        // 2. Prepare Notification documents
        const notificationDocuments = targetUsers.map(user => ({
            user: user._id,
            announcement: newAnnouncement._id,
            isRead: false,
        }));

        // 3. Create all notifications in one go
        await Notification.insertMany(notificationDocuments);

        res.status(201).json({
            message: 'Announcement published and notifications created.',
            announcement: newAnnouncement,
        });
    } catch (error) {
        res.status(500).json({ message: 'Error creating announcement', details: error.message });
    }
};

// Student/Faculty/Admin: Get a count of unread notifications (Bell Icon)
const getUnreadNotificationCount = async (req, res) => {
    try {
        const userId = req.user._id;
        const count = await Notification.countDocuments({ user: userId, isRead: false });

        res.status(200).json({ unreadCount: count });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching notification count' });
    }
};

// Student/Faculty/Admin: Get Notification History (Dedicated Page: Chronological List)
const getNotificationHistory = async (req, res) => {
    try {
        const userId = req.user._id;
        
        // Fetch notifications and populate the full announcement content
        const history = await Notification.find({ user: userId })
            .populate('announcement')
            .sort({ createdAt: -1 }); // Chronological order

        res.status(200).json(history);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching notification history' });
    }
};

// Student/Faculty/Admin: Mark a notification as read (Message Detail Modal)
const markNotificationAsRead = async (req, res) => {
    try {
        const { notificationId } = req.params;
        const userId = req.user._id;

        const notification = await Notification.findOneAndUpdate(
            { _id: notificationId, user: userId },
            { isRead: true },
            { new: true }
        );

        res.status(200).json({ message: 'Notification marked as read', notification });
    } catch (error) {
        res.status(500).json({ message: 'Error marking notification as read' });
    }
};

// Admin: Manage and View Sent Announcements
const getSentAnnouncements = async (req, res) => {
    try {
        const sentAnnouncements = await Announcement.find({ createdBy: req.user._id })
            .sort({ publishDate: -1 });

        // Optionally, attach read counts/status here for admin oversight

        res.status(200).json(sentAnnouncements);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching sent announcements' });
    }
};


module.exports = {
    createAnnouncement,
    getUnreadNotificationCount,
    getNotificationHistory,
    markNotificationAsRead,
    getSentAnnouncements
};