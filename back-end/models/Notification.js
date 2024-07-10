const mongoose = require('mongoose');
const { db2 } = require("../config/database");

const notificationSchema = new mongoose.Schema({
    message: String,
    time: Date
});

const Notification = db2.model('notifications', notificationSchema);

module.exports = Notification;
