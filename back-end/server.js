const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const http = require('http');
const Server = require('socket.io');
const cors = require('cors');
const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');
const { socketEvents } = require('./socketEvents');
const calendarRouter = require('./routes/calendarRoutes');
const monthRouter = require("./routes/monthRoutes.js");
const notificationRouter = require("./routes/notificationRoutes.js")

const app = express();
app.use(cors());

const { server2 } = require('./chart');

app.use(bodyParser.json());

app.use('/api/calendar', calendarRouter);
app.use('/api/calendar/month', monthRouter);
app.use('/api/notification', notificationRouter);

const server = http.createServer(app);
const io = Server(server, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"],
    },
});

const sp = new SerialPort({
    path: "COM4",
    baudRate: 9600,
    dataBits: 8,
    stopBits: 1,
    flowControl: false
});
const parser = sp.pipe(new ReadlineParser({ delimiter: '\r\n' }));

let sensorData;

parser.on("data", (data) => {
    try {
        sensorData = JSON.parse(data);
        console.log(sensorData);
    } catch (error) {
        console.error("Parsing error:", error);
    }
});

io.on('connection', (socket) => {
    socketEvents(socket, sp);
});

setInterval(() => {
    io.emit('sensor data', sensorData)
}, 2000);

const port = 5000;
server.listen(port, () => {
    console.log(`server is running on ${port} port`);
});

const chartPort = 5100;
server2.listen(chartPort, () => {
    console.log(`server is running on ${ chartPort } port`)
})