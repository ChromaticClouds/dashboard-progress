const Notification = require('../models/Notification');

const createNotification = async (req, res) => {
    try {
        const newData = new Notification(req.body);
        const savedData = await newData.save();
        res.json(savedData);
    } catch (error) {
        res.status(500).json({ message: 'Error saving data', error });
    }
};

const getNotification = async (req, res) => {
    try {
        const notifications = await Notification.find().sort({ time: -1 });
        res.json(notifications);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching notifications', error });
    }
}

module.exports = { 
    createNotification,
    getNotification
}