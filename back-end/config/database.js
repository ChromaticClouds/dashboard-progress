const mongoose = require('mongoose');

const db1 = mongoose.createConnection('mongodb://localhost:27017/todo-list');
const db2 = mongoose.createConnection('mongodb://localhost:27017/notification-bind');

db1.on('connected', () => {
    console.log('Connected to db1');
});
db2.on('connected', () => {
    console.log('Connected to db2');
});

module.exports = { db1, db2 };
