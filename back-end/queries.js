const mysql = require('mysql');

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'dct_farm',
    database: 'smart_farm'
});

db.connect((error) => {
    error ? console.log(`MySQL connecting failed: ${error}`) : console.log("MySQL connected");
});

const query = (sql) => {
    return new Promise((resolve, reject) => {
        db.query(sql, (error, results) => {
            if (error) {
                reject(error);
            } else {
                resolve(results);
            }
        });
    });
};

const envQueries = [
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
        brightness 
    FROM 
        environment
    WHERE 
        environment_id = (SELECT MAX(environment_id) FROM environment);
    `
]

const weekQueries = [
    `
    SELECT 
        week_difference,
        avg_growth
    FROM (
        SELECT 
            FLOOR((DATEDIFF(record.timestamp, plant.timestamp) / 7) + 1) AS week_difference,
            AVG(record.growth_amount) AS avg_growth
        FROM 
            record
        JOIN 
            plant ON record.plant_id = plant.plant_id
        WHERE 
            record.plant_id = 'TOMATO001'
        GROUP BY week_difference ORDER BY week_difference DESC LIMIT 3
    ) sub
    ORDER BY
        week_difference ASC;
    `,
    `
        SELECT 
        week_difference,
        avg_growth
    FROM (
        SELECT 
            FLOOR((DATEDIFF(record.timestamp, plant.timestamp) / 7) + 1) AS week_difference,
            AVG(record.growth_amount) AS avg_growth
        FROM 
            record
        JOIN 
            plant ON record.plant_id = plant.plant_id
        WHERE 
            record.plant_id = 'TOMATO002'
        GROUP BY week_difference ORDER BY week_difference DESC LIMIT 3
    ) sub
    ORDER BY
        week_difference ASC;
    `,
    `
    SELECT 
        week_difference,
        avg_growth
    FROM (
        SELECT 
            FLOOR((DATEDIFF(record.timestamp, plant.timestamp) / 7) + 1) AS week_difference,
            AVG(record.growth_amount) AS avg_growth
        FROM 
            record
        JOIN 
            plant ON record.plant_id = plant.plant_id
        WHERE 
            record.plant_id = 'TOMATO002'
        GROUP BY week_difference ORDER BY week_difference DESC LIMIT 3
    ) sub
    ORDER BY
        week_difference ASC;
    `
]

const sensorQueries = [
    `SELECT soil_humid, plant_id FROM growth`,
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

const growthQueries = [
    `
    SELECT
        day,
        avg_growth
    FROM (
        SELECT
            DATE(timestamp) AS day,
            AVG(growth_amount) AS avg_growth
        FROM
            record
        WHERE 
            plant_id = "TOMATO001"
        GROUP BY day ORDER BY day DESC LIMIT 7
    ) sub
    ORDER BY
        day ASC;
    `,
    `
    SELECT
        day,
        avg_growth
    FROM (
        SELECT
            DATE(timestamp) AS day,
            AVG(growth_amount) AS avg_growth
        FROM
            record
        WHERE 
            plant_id = "TOMATO002"
        GROUP BY day ORDER BY day DESC LIMIT 7
    ) record
    ORDER BY
        day ASC;
    `,
    `
    SELECT
        day,
        avg_growth
    FROM (
        SELECT
            DATE(timestamp) AS day,
            AVG(growth_amount) AS avg_growth
        FROM
            record
        WHERE 
            plant_id = "TOMATO003"
        GROUP BY day ORDER BY day DESC LIMIT 7
    ) record
    ORDER BY
        day ASC;
    `
]

const monitoringQuery = `SELECT * FROM control;`

module.exports = { query, envQueries, weekQueries, sensorQueries, growthQueries, monitoringQuery };