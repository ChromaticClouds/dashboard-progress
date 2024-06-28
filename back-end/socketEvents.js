const { query, envQueries, weekQueries, sensorQueries, growthQueries, monitoringQuery } = require('./queries');

const socketEvents = (socket, sp) => {
    socket.on("env req", async () => {
        try {
            const results = await Promise.all(envQueries.map(q => query(q)));
            socket.emit("env rec", results);
        } catch (error) {
            console.error(error);
        }
    });

    socket.on("weeks req", async (host) => {
        try {
            const results = await query(weekQueries[host.week - 1]);
            socket.emit("weeks rec", results);
        } catch (error) {
            console.error(error);
        }
    });

    socket.on("sensor req", async () => {
        try {
            const results = await Promise.all(sensorQueries.map(q => query(q)));
            socket.emit("sensor rec", results);
        } catch (error) {
            console.error(error);
        }
    });

    socket.on("growth req", async (host) => {
        try {
            const results = await query(growthQueries[host.growth - 1]);
            socket.emit("growth rec", results);
        } catch (error) {
            console.error(error);
        }
    });

    socket.on("monitoring req", async () => {
        try {
            const results = await query(monitoringQuery);
            socket.emit("monitoring rec", results);
        } catch (error) {
            console.error(error);
        }
    });

    socket.on('led value req', (value1) => {
        sp.write(`led01_${value1 * 51}\n`);
    });

    socket.on('led value req2', (value2) => {
        sp.write(`led02_${value2 * 51}\n`);
    });

    socket.on('led value req3', (value3) => {
        sp.write(`led03_${value3 * 51}\n`);
    });

    socket.on('intensity req', (value) => {
        let resistance = [5, 4, 3, 2, 1, 0][value] || 0;
        sp.write(`res_${resistance * 10}`);
        console.log("resistance value: ", resistance);
    });

    socket.on('duration req', (value) => {
        let duration = value * 2000 + 10000;
        sp.write(`dur_${duration}`);
    });

    socket.on('watering req', (value) => {
        let power = value.onWatering ? 1 : 0;
        sp.write(`watering_${power}\n`);
    });

    socket.on('recent watering req', async () => {
        const sql = `
            SELECT 
                timestamp 
            FROM 
                environment 
            WHERE 
                environment_id = (SELECT MAX(environment_id) FROM environment) 
            AND 
                water_supply > 0;`;
        try {
            const results = await query(sql);
            const recent = new Date(results[0].timestamp);
            socket.emit('recent watering rec', recent);
        } catch (error) {
            console.error(error);
        }
    });

    socket.on('heater power req', (value) => {
        let power = value.power ? 1 : 0;
        sp.write(`heaterPower_${power}\n`);
    });

    socket.on('cooler power req', (value) => {
        let power = value.power ? 1 : 0;
        sp.write(`coolerPower_${power}\n`);
    });

    socket.on('heater temp req', (value) => {
        sp.write(`heater_${value}\n`);
    });

    socket.on('cooler temp req', (value) => {
        sp.write(`cooler_${value}\n`);
    });

    socket.on('control on', () => {
        sp.write("on\n");
    });

    socket.on('control off', () => {
        sp.write("off\n");
    });
};

module.exports = { socketEvents };
