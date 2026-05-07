const Register = require('../models/Register');
const { generateAccessToken, generateRefreshToken } = require('../utils/jwt')
const bcrypt = require('bcrypt');
const axios = require('axios');
require('dotenv').config();

const verifyRecaptcha = async (token) => {
    const secretKey = process.env.SECRET_KEY;

    try {
        const response = await axios.post(
            `https://www.google.com/recaptcha/api/siteverify`,
            null,
            {
                params: {
                    secret: secretKey,
                    response: token
                }
            }
        );

        const { success, score } = response.data;

        return { success, score };
    } catch (error) {
        console.error('Error verifying reCAPTCHA:', error);
        return { success: false, score: null, action: null };
    }
};

const createAccount = async (req, res) => {
    try {
        const { token, username, email, password } = req.body;

        const { success, score } = await verifyRecaptcha(token);

        if (!success) {
            return res.status(400).json({ message: `reCAPTCHA verification failed` });
        }

        if (score < 0.5) {
            return res.status(403).json({ message: 'Suspicious activity detected.' });
        }

        if (!username || !password) {
            return res.status(400).json({ message: 'Username and password are required.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        
        const newUser = new Register({
            username,
            email, 
            password: hashedPassword
        });

        const savedData = await newUser.save();

        const accessToken = generateAccessToken(savedData, '1m');

        const refreshToken = generateRefreshToken(savedData, '7d');

        res.json({ savedData, accessToken, refreshToken });
    } catch (error) {
        res.status(500).json({ message: 'Error generating accout. Try again.', error: error.message });
    }
};

const duplicateAccountVerify = async (req, res) => {
    const { username } = req.query;

    try {
        const user = await Register.findOne({ username });

        if (user) {
            return res.status(409).json({ message: 'Username is already taken.' });
        }

        return res.status(200).json({ message: 'Username is available' });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error. Try later.', error: error.message });
    }
}

module.exports = {
    verifyRecaptcha,
    createAccount,
    duplicateAccountVerify
}