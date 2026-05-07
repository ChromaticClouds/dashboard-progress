const jwt = require('jsonwebtoken');
const { generateAccessToken } = require("../utils/jwt");
require('dotenv').config();

const accessSecretKey = process.env.ACCESS_TOKEN_KEY;
const refreshSecretKey = process.env.REFRESH_TOKEN_KEY;

// 비밀 키 확인
if (!accessSecretKey || !refreshSecretKey) {
    throw new Error('Missing secret keys');
}

// 새 액세스 토큰 생성
const generateNewAccessToken = (refreshToken) => {
    return new Promise((resolve, reject) => {
        jwt.verify(refreshToken, refreshSecretKey, (err, user) => {
            if (err) {
                return reject({ message: 'Invalid refresh token' });
            }

            const newAccessToken = generateAccessToken(user, '1m');

            resolve({ token: newAccessToken, username: user.username });
        });
    });
}

// 토큰 검증 함수
const verifyToken = async (req, res) => {
    const { accessToken, refreshToken } = req.body;

    if (!refreshToken) {
        return res.status(401).json({ message: 'Refresh token is missing' });
    }

    try {
        // 액세스 토큰 검증
        jwt.verify(accessToken, accessSecretKey);
        // 액세스 토큰이 유효한 경우
        return res.json({ message: "Valid token." });
    } catch (err) {
        // 액세스 토큰이 만료된 경우
        try {
            const { token, username } = await generateNewAccessToken(refreshToken);
            return res.json({ username, token });
        } catch (error) {
            return res.status(403).json({ message: 'Invalid refresh token' });
        }
    }
}

module.exports = {
    verifyToken
};