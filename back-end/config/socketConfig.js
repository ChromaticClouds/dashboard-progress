// config/socketConfig.js
const { Server } = require('socket.io');
const authenticateSocketToken = require('../middleware/socketMiddleware');

let io;

const socketConfig = (server) => {
    io = new Server(server, {
        cors: {
            origin: "http://localhost:3036", // Update if needed
            methods: ["GET", "POST"],
        },
    });

    io.use(authenticateSocketToken);
};

const getIO = () => {
    if (!io) {
        throw new Error("Socket.io is not initialized!");
    }
    return io;
};

module.exports = { socketConfig, getIO };
