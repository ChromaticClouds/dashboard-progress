const express = require('express');
const bodyParser = require('body-parser');
const http = require('http');
const cors = require('cors');
const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');
const { socketEvents } = require('./socketEvents');
const { socketProvider } = require('./chart');
const { gptController } = require('./socketControllers/gptController');
const {
    insertRecordData,
    updateControlData,
    insertEnvironmentData,
    updateGrowthData
} = require('./dbQueries.js');
require('dotenv').config();

const { getIO, socketConfig } = require('./config/socketConfig.js'); 

const app = express();
const server = http.createServer(app);
const PORT = 3100;

app.use(cors());

const calendarRouter = require('./routes/calendarRoutes');
const monthRouter = require("./routes/monthRoutes.js");
const notificationRouter = require("./routes/notificationRoutes.js");
const registerRouter = require("./routes/registerRoutes");
const loginRouter = require("./routes/loginRouter");
const verifyTokenRouter = require("./routes/verifyTokenRouter.js");

app.use(bodyParser.json());

app.use('/api/calendar', calendarRouter);
app.use('/api/calendar/month', monthRouter);
app.use('/api/notification', notificationRouter);
app.use('/api/register', registerRouter);
app.use('/api/login', loginRouter);
app.use('/api/verify-token', verifyTokenRouter);

socketConfig(server);

const io = getIO();

io.on('connection', (socket) => {
    setInterval(() => {
        socket.emit('sensor data', {
            temperature: Math.floor(Math.random() * 30) + 10, // Random temperature between 10 and 40
            humidity: Math.floor(Math.random() * 60) + 30,    // Random humidity between 30 and 90
            waterLevel: Math.floor(Math.random() * 10) + 1
        })
    }, 180000);
});

// socketControllers
socketProvider(io);
socketEvents(io);
gptController(io);

server.listen(PORT, () => {
    console.log(`서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
});