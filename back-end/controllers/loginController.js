const Register = require('../models/Register');
const { verifyRecaptcha } = require('./registerController');
const bcrypt = require('bcrypt');
const { generateAccessToken, generateRefreshToken } = require('../utils/jwt'); 
require('dotenv').config();

const login = async (req, res) => {
    try {
        const { token, username, password } = req.body;

        const { success, score } = await verifyRecaptcha(token);

        if (!success) {
            return res.status(400).json({ message: `reCAPTCHA verification failed.` });
        }

        if (score < 0.5) {
            return res.status(403).json({ message: 'Suspicious activity detected.' });
        }

        if (!username || !password) {
            return res.status(400).json({ message: 'Username and password are required.' });
        }

        const user = await Register.findOne({ username });
        if(!user || !await bcrypt.compare(password, user.password)) {
            return res.status(401).json({ message: 'Invalid login info.' });
        }

        const accessToken = generateAccessToken(user, '1m');

        const refreshToken = generateRefreshToken(user, '7d');

        res.json({ user, accessToken, refreshToken });
    }
    catch (error) {
        console.error(error)
        res.status(500).json({ message: 'Error logging. Try later.' });
    }
}

module.exports = { login };