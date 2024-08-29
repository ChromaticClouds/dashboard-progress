const jwt = require('jsonwebtoken');
require('dotenv');

const generateAccessToken = (user, expiresTime) => {
    const payload = {
        _id: user._id,
        username: user.username
    };

    const token = jwt.sign(
        payload,
        process.env.ACCESS_TOKEN_KEY,
        { expiresIn: expiresTime }
    );

    return token;
};

const generateRefreshToken = (user, expiresTime) => {
    const payload = {
        _id: user._id,
        username: user.username
    };

    const token = jwt.sign(
        payload,
        process.env.REFRESH_TOKEN_KEY,
        { expiresIn: expiresTime }
    );

    return token;
};

module.exports = { 
    generateAccessToken,
    generateRefreshToken
};