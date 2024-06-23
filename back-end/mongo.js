const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const app = express();
app.use(bodyParser.json());
app.use(cors());

mongoose.connect('mongodb://localhost:27017/todo-list')
.then(() => console.log('MongoDB connected'))
.catch(err => console.log(err));

const DataSchema = new mongoose.Schema({
    title: String,
    todo: String,
    message: String,
    startDate: Date,
    startTime: Date,
    endDate: Date,
    endTime: Date,
    color: Number,
    event: Number,
    date: { type: Date, default: Date.now }
});

const Data = mongoose.model('todo-input', DataSchema);

app.post('/calendar/data', async (req, res) => {
    try {
        const newData = new Data(req.body);
        const savedData = await newData.save();
        res.json(savedData);
    } catch (error) {
        res.status(500).json({ message: 'Error saving data', error });
    }
});