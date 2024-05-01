const express = require('express');
const http = require('http');
const Server = require('socket.io');
const mysql = require('mysql');
const cors = require('cors');

const app = express();
app.use(cors());

let port = 5000;

const server = http.createServer(app);
const io = Server(server, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"],
    },
});

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Hylo0825@#',
    database: 'smart_farm'
});

db.connect((error) => {
    error ? console.log(`MySQL connecting failed: ${error}`) : console.log("MySQL connected");
});

const sql = [
    `
    SELECT 
        inner_temp 
    FROM 
        environment 
    WHERE 
        environment_id = (SELECT MAX(environment_id) FROM environment);
    `,
    `
    SELECT 
        inner_humid 
    FROM 
        environment 
    WHERE 
        environment_id = (SELECT MAX(environment_id) FROM environment);
    `,
    `
    SELECT 
        led_measures 
    FROM 
        record
    WHERE 
        record_id = (SELECT MAX(record_id) FROM record);
    `
]

const sql2 = [
    `
    SELECT 
        FLOOR((DATEDIFF(record.timestamp, plant.timestamp) / 7) + 1) AS week_difference,
        AVG(record.growth_amount) AS avg_growth
    FROM 
        record
    JOIN 
        plant ON record.plant_id = plant.plant_id
    WHERE 
        record.plant_id = 'TOMATO001'
    GROUP BY 
        week_difference;
    `
]

const sql3 = [
    `
    SELECT
        soil_humid, plant_id
    FROM
        growth
    `,
    `
    SELECT
        FLOOR((DATEDIFF(environment.timestamp, plant.timestamp) / 7) + 1) AS week,
        SUM(water_supply) AS week_watering
    FROM 
        environment, plant
    GROUP BY
        week;
    `
]

const sql4 = [
    `
    SELECT
        DATE(timestamp) AS day,
        AVG(growth_amount) AS avg_growth
    FROM
        record
    GROUP BY
        day;
    `
]

io.on('connection', (socket) => {
    socket.on("env req", async () => {
        try {
            const results = await Promise.all(sql.map(q => query(q)));
            socket.emit("env rec", results);
        } catch (error) {
            console.error(error);
        }
    })

    socket.on("weeks req", async () => {
        try {
            const results = await Promise.all(sql2.map(q => query(q)));
            socket.emit("weeks rec", results);
        } catch (error) {
            console.error(error);
        }
    })

    socket.on("sensor req", async () => {
        try {
            const results = await Promise.all(sql3.map(q => query(q)));
            socket.emit("sensor rec", results);
        } catch (error) {
            console.error(error);
        }
    })

    socket.on("growth req", async () => {
        try {
            const results = await Promise.all(sql4.map(q => query(q)));
            socket.emit("growth rec", results);
        } catch (error) {
            console.error(error);
        }
    })

});

server.listen(port, () => {
    console.log(`server is running on ${port} port`);
});

const query = (sql) => {
    return new Promise((resolve, reject) => {
        db.query(sql, (error, results, fields) => {
            if (error) {
                reject(error);
            } else {
                resolve(results);
            }
        });
    });
}