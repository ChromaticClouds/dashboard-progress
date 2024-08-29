const mongoose = require('mongoose');
const { mainDb } = require("../config/database");

const registerSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        minlength: 3,
        maxlength: 16
    },
    password: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: false
    }
});

const Register = mainDb.model('Users', registerSchema);

module.exports = Register;