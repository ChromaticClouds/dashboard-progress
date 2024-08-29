const mongoose = require('mongoose');
const mysql = require('mysql');
require('dotenv').config();

const mainDb = mongoose.createConnection('mongodb://localhost:27017/main-databasse');

mainDb.on('connected', () => {
    console.log('Connected to mainDB');
});

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
});

db.connect((error) => {
    if (error) {
      console.error('데이터베이스 연결 오류:', error);
      return;
    }
    console.log('데이터베이스에 성공적으로 연결되었습니다.');
});

module.exports = { mainDb, db };
