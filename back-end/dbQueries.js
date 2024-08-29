const { db } = require('./queries');

const formatDate = (date) => {
    return date.toISOString().slice(0, 19).replace('T', ' ');
};

const executeQuery = async (query, params) => {
    return new Promise((resolve, reject) => {
        db.query(query, params, (err, result) => {
            if (err) {
                console.error('Query Error:', query);
                console.error('Params:', params);
                return reject(err);
            }
            resolve(result);
        });
    });
};

const insertRecordData = async (data) => {
    const records = [
        { plant_id: 'TOMATO001', growth_amount: data.growth, soil_humid: data.soil_humidity, led_measures: data.led01 },
        { plant_id: 'TOMATO002', growth_amount: data.growth2, soil_humid: data.soil_humidity2, led_measures: data.led02 },
        { plant_id: 'TOMATO003', growth_amount: data.growth3, soil_humid: data.soil_humidity3, led_measures: data.led03 }
    ];

    for (const record of records) {
        const query = `
            INSERT INTO record (plant_id, growth_amount, soil_humid, led_measures, timestamp)
            VALUES (?, ?, ?, ?, ?)
        `;
        const params = [record.plant_id, record.growth_amount, record.soil_humid, record.led_measures, formatDate(new Date())];
        try {
            await executeQuery(query, params);
        } catch (err) {
            console.error(`Failed to insert record data for ${record.plant_id}:`, err);
        }
    }
};

const updateControlData = async (data) => {
    const updates = [
        { sensor_type: 'Water Pump', power: 1, measures: data.watering_amount },
        { sensor_type: 'Cooling Fan', power: data.cooler_power, measures: data.desire_cool },
        { sensor_type: 'Neopixel LED 1', power: data.led01 ? 1 : 0, measures: data.led01 },
        { sensor_type: 'Neopixel LED 2', power: data.led02 ? 1 : 0, measures: data.led02 },
        { sensor_type: 'Neopixel LED 3', power: data.led03 ? 1 : 0, measures: data.led03 },
        { sensor_type: 'Water Level Sensor', power: 1, measures: data.water_level },
        { sensor_type: 'Ultrasonic Sensor 1', power: 1, measures: data.growth },
        { sensor_type: 'Ultrasonic Sensor 2', power: 1, measures: data.growth2 },
        { sensor_type: 'Ultrasonic Sensor 3', power: 1, measures: data.growth3 },
        { sensor_type: 'Soil Moisture Sensor 1', power: 1, measures: data.soil_humidity },
        { sensor_type: 'Soil Moisture Sensor 2', power: 1, measures: data.soil_humidity2 },
        { sensor_type: 'Soil Moisture Sensor 3', power: 1, measures: data.soil_humidity3 },
        { sensor_type: 'Heater', power: data.heater_power, measures: data.desire_heat }
    ];

    for (const update of updates) {
        const query = `
            UPDATE control SET
            power = ?,
            measures = ?,
            timestamp = ?
            WHERE sensor_type = ?
        `;
        const params = [update.power, update.measures, formatDate(new Date()), update.sensor_type];

        try {
            await executeQuery(query, params);
        } catch (err) {
            console.error(`Failed to update control data for ${update.sensor_type}:`, err);
        }
    }
};

const insertEnvironmentData = async (data) => {
    const query = `
        INSERT INTO environment (inner_temp, inner_humid, timestamp, water_supply, brightness)
        VALUES (?, ?, ?, ?, ?)
    `;
    const params = [data.temperature, data.humidity, formatDate(new Date()), data.watering_amount, data.brightness];

    try {
        await executeQuery(query, params);
    } catch (err) {
        console.error('Failed to insert environment data:', err);
    }
};

const updateGrowthData = async (data) => {
    const updates = [
        { plant_id: 'TOMATO001', growth_amount: data.growth, soil_humid: data.soil_humidity },
        { plant_id: 'TOMATO002', growth_amount: data.growth2, soil_humid: data.soil_humidity2 },
        { plant_id: 'TOMATO003', growth_amount: data.growth3, soil_humid: data.soil_humidity3 }
    ];

    for (const update of updates) {
        const query = `
            UPDATE growth SET
            growth_amount = ?,
            soil_humid = ?,
            timestamp = ?
            WHERE plant_id = ?
        `;
        const params = [update.growth_amount, update.soil_humid, formatDate(new Date()), update.plant_id];

        try {
            await executeQuery(query, params);
        } catch (err) {
            console.error(`Failed to update growth data for ${update.plant_id}:`, err);
        }
    }
};

module.exports = {
    insertRecordData,
    updateControlData,
    insertEnvironmentData,
    updateGrowthData
};