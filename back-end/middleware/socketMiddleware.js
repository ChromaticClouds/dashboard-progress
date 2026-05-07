const jwt = require('jsonwebtoken');

const authenticateSocketToken = (socket, next) => {
    const token = socket.handshake.auth.token; // 소켓 연결 시 클라이언트가 보낸 토큰

    if (!token) {
        return next(new Error('Authentication error: No token provided'));
    }

    jwt.verify(token, process.env.ACCESS_TOKEN_KEY, (err, user) => {    
        if (err) {
            if (err.name === 'TokenExpiredError') {
                return next(new Error(err.name));
            }
            return next(new Error('Invalid token')); // 유효하지 않은 토큰
        }

        // 토큰이 유효하면 사용자 정보를 소켓에 저장
        socket.userId = user._id; // 사용자 ID를 저장
        next(); // 다음 미들웨어로 진행
    });
};

module.exports = authenticateSocketToken;
