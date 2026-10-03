const express = require('express');
const bodyParser = require('body-parser');
const http = require('http');
const cors = require('cors');
const { socketEvents } = require('./socketEvents');
const { createSerialBridge } = require('./serialBridge');
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
const serial = createSerialBridge();

// 센서 값은 서버 타이머 하나로 모든 클라이언트에 보낸다. 연결마다 타이머를 만들면 끊긴 뒤에도 남는다.
const SENSOR_BROADCAST_MS = Number(
    process.env.SENSOR_BROADCAST_MS ?? (serial.connected ? 2000 : 180000)
);
setInterval(() => {
    const data = serial.latestSensorData();
    if (data) io.emit('sensor data', data);
}, SENSOR_BROADCAST_MS);

// socketControllers
socketProvider(io);
io.on('connection', (socket) => socketEvents(socket, serial));
gptController(io);

server.listen(PORT, () => {
    console.log(`서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
});
