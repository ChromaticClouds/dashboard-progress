const { db } = require('./config/database');

const socketProvider = (io) => {  
    const growth = [
        `
        SELECT
            growth_amount
        FROM
            growth
        `
    ]

    const temp_and_humid = [
        `
        SELECT
            inner_temp, inner_humid, timestamp
        FROM (
            SELECT 
                inner_temp, inner_humid, timestamp, environment_id
            FROM
                environment
            ORDER BY
                environment_id DESC
            LIMIT 8
        ) sub
        ORDER BY environment_id ASC;
        `
    ]

    const soil_humidity = [
        `
        SELECT
            soil_humid
        FROM
            growth;
        `
    ]

    const water_supply = [
        `
        SELECT
            day,
            water_supply_count,
            water_supply_amount
        FROM (
            SELECT
                DATE(timestamp) AS day,
                COUNT(water_supply) AS water_supply_count,
                SUM(water_supply) AS water_supply_amount 
            FROM
                environment
            WHERE
                water_supply > 0
            GROUP BY
                DATE(timestamp)
            ORDER BY
                DATE(timestamp) DESC
            LIMIT 8
        ) sub
        ORDER BY
            day ASC;
        `,
    ]

    const brightness = [
        `
        SELECT
            brightness, timestamp
        FROM (
            SELECT
                brightness, timestamp, environment_id
            FROM
                environment
            ORDER BY
                environment_id DESC
            LIMIT 8
        ) sub
        ORDER BY
            environment_id ASC;
        `
    ]

    const temperature = [
        `
        SELECT
            inner_temp
        FROM
            environment
        WHERE
            environment_id = (
                SELECT MAX(environment_id) FROM environment
            );
        `
    ]

    const humidity = [
        `
        SELECT
            inner_humid
        FROM
            environment
        WHERE
            environment_id = (
                SELECT MAX(environment_id) FROM environment
            );
        `
    ]

    io.on('connection', (socket) => {
        socket.on("growth chart req", async () => {
            try {
                const results = await Promise.all(growth.map(q => query(q)));
                socket.emit("growth chart rec", results);
            } catch (error) {
                console.error(error);
            }
        });

        socket.on("temp and humid chart req", async () => {
            try {
                const results = await Promise.all(temp_and_humid.map(q => query(q)));
                socket.emit("temp and humid chart rec", results);
            } catch (error) {
                console.error(error);
            }
        });

        socket.on("water supply chart req", async () => {
            try {
                const results = await Promise.all(water_supply.map(q => query(q)));
                socket.emit("water supply chart rec", results);
            } catch (error) {
                console.error(error);
            }
        });

        socket.on("soil humidity chart req", async () => {
            try {
                const results = await Promise.all(soil_humidity.map(q => query(q)));
                socket.emit("soil humidity chart rec", results);
            } catch (error) {
                console.error(error);
            }
        });

        socket.on("brightness chart req", async () => {
            try {
                const results = await Promise.all(brightness.map(q => query(q)));
                socket.emit("brightness chart rec", results);
            } catch (error) {
                console.error(error);
            }
        });

        socket.on("temperature sub chart req", async () => {
            try {
                const results = await Promise.all(temperature.map(q => query(q)));
                socket.emit("temperature sub chart rec", results);
            } catch (error) {
                console.error(error);
            }
        });

        socket.on("humidity sub chart req", async () => {
            try {
                const results = await Promise.all(humidity.map(q => query(q)));
                socket.emit("humidity sub chart rec", results);
            } catch (error) {
                console.error(error);
            }
        });
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
    };
};

module.exports = { socketProvider };