const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');
require('dotenv').config();

// 아두이노 없이 실행할 때 쓰는 테스트용 센서 값
const mockSensorData = () => ({
    temperature: Math.floor(Math.random() * 30) + 10, // 10 ~ 40
    humidity: Math.floor(Math.random() * 60) + 30,    // 30 ~ 90
    waterLevel: Math.floor(Math.random() * 10) + 1
});

/**
 * 아두이노 시리얼 연결.
 * SERIAL_PATH(예: COM4, /dev/ttyACM0)가 있으면 실제 포트를 열고, 없으면 장치 없이 실행한다.
 * 장치가 없을 때 제어 명령은 로그로만 남기고, 센서 값은 테스트용 값을 돌려준다.
 */
const createSerialBridge = () => {
    const path = process.env.SERIAL_PATH;

    if (!path) {
        console.warn('SERIAL_PATH가 없어 시리얼 장치 없이 실행합니다. 제어 명령은 로그로만 남깁니다.');
        return {
            connected: false,
            write: (command) => console.log(`[serial:off] ${String(command).trim()}`),
            latestSensorData: mockSensorData
        };
    }

    let latest = null;

    const port = new SerialPort({
        path,
        baudRate: Number(process.env.SERIAL_BAUD_RATE ?? 9600),
        dataBits: 8,
        stopBits: 1
    });
    port.on('error', (error) => console.error('Serial port error:', error.message));

    const parser = port.pipe(new ReadlineParser({ delimiter: '\r\n' }));
    parser.on('data', (line) => {
        try {
            latest = JSON.parse(line);
        } catch (error) {
            console.error('Parsing error:', error.message);
        }
    });

    return {
        connected: true,
        write: (command) => port.write(command),
        latestSensorData: () => latest
    };
};

module.exports = { createSerialBridge };
