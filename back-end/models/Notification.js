const mongoose = require('mongoose');
const { mainDb } = require("../config/database");

const notificationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Users'
    },
    type: {
        type: String,
        default: 'normal'
    },
    message: {
        type: String,
        required: true
    },
    isRead: { 
        type: Boolean,
        default: false
    },
    time: {
        type: Date,
        default: Date.now
    }
});

const Notification = mainDb.model('Notifications', notificationSchema);

module.exports = Notification;
