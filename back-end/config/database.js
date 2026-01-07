const mongoose = require('mongoose');
require('dotenv').config();

const mainDb = mongoose.createConnection('mongodb://localhost:27017/main-databasse');

mainDb.on('connected', () => {
    console.log('Connected to mainDB');
});

module.exports = { mainDb };