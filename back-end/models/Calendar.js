const mongoose = require('mongoose');
const { mainDb } = require("../config/database");

const todoSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Users'
    },
    title: String,
    todo: String,
    message: String,
    startDate: Date,
    startTime: String,
    endDate: Date,
    endTime: String,
    color: String,
    event: {
        text: String,
        icon: String
    },
    date: { type: Date, default: Date.now }
});

const Todo = mainDb.model('Todos', todoSchema);

module.exports = Todo;
