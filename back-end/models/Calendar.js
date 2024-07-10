const { db1 } = require("../config/database");
const mongoose = require('mongoose');

const todoSchema = new mongoose.Schema({
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

const Todo = db1.model('todo-inputs', todoSchema);

module.exports = Todo;
