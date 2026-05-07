const Notification = require('../models/Notification');

const createNotification = async (req, res) => {
    try {
        const { _id } = req.user;
        const { notification } = req.body;

        const newData = new Notification({
            userId: _id,
            ...notification    
        });
        const savedData = await newData.save();
        res.json(savedData);
    } catch (error) {
        res.status(500).json({ message: 'Error saving data', error });
    }
};

const getNotification = async (req, res) => {
    try {
        const { _id } = req.user;

        const notifications = await Notification.find({ userId: _id }).sort({ time: -1 });
        res.json(notifications);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching notifications', error });
    }
}

const updateNotification = async (req, res) => {
    try {
        const { _id } = req.user;
        
        const updatedNotification = await Notification.updateMany(
            { userId: _id },
            { isRead: true },
            { new: true }
        );

        res.json(updatedNotification);
    } catch (error) {
        return res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
}

const deleteNotification = async (req, res) => {
    try {
        const { _id } = req.user;

        const deleteResult = await Notification.deleteMany({ userId: _id });
        res.json(deleteResult);
    } catch (err) {
        res.status(500).json({ message: 'Error deleteing notifications', error: err.message });
    }
}

module.exports = {
    createNotification,
    getNotification,
    updateNotification,
    deleteNotification
}