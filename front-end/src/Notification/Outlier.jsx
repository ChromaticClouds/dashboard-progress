import React, { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";

const Outlier = ({ hostOutlier }) => {
    const [socket, setSocket] = useState(null);
    const [sensorData, setSensorData] = useState({});

    useEffect(() => {
        const socketIo = io("http://localhost:5000");

        const hostSensorData = (data) => {
            setSensorData(data);
        };

        socketIo.on('sensor data', hostSensorData);
        setSocket(socketIo);

        return () => {
            if (socket) {
                socketIo.off('sensor data', hostSensorData);
                socketIo.disconnect();
            }
        };
    }, []);

    // 개별 센서 값에 대한 이상치 여부를 관리
    const [isTempHigh, setIsTempHigh] = useState(false);
    const [isTempLow, setIsTempLow] = useState(false);
    const [isSoilHumidHigh, setIsSoilHumidHigh] = useState(false);
    const [isSoilHumidLow, setIsSoilHumidLow] = useState(false);
    const [isWaterLevelLow, setIsWaterLevelLow] = useState(false);

    useEffect(() => {
        if (sensorData?.temperature !== undefined) { // 옵셔널 체이닝 연산자 사용
            const tempHigh = sensorData.temperature >= 35;
            const tempLow = sensorData.temperature <= 20;

            if (tempHigh !== isTempHigh) setIsTempHigh(tempHigh);
            if (tempLow !== isTempLow) setIsTempLow(tempLow);
        }
    }, [sensorData?.temperature]); // 옵셔널 체이닝 연산자 사용

    useEffect(() => {
        if (sensorData?.soilHumidity !== undefined) { // 옵셔널 체이닝 연산자 사용
            const soilHumidHigh = sensorData.soilHumidity >= 80;
            const soilHumidLow = sensorData.soilHumidity <= 30;

            if (soilHumidHigh !== isSoilHumidHigh) setIsSoilHumidHigh(soilHumidHigh);
            if (soilHumidLow !== isSoilHumidLow) setIsSoilHumidLow(soilHumidLow);
        }
    }, [sensorData?.soilHumidity]); // 옵셔널 체이닝 연산자 사용

    useEffect(() => {
        if (sensorData?.water_level !== undefined) { // 옵셔널 체이닝 연산자 사용
            const waterLevelLow = sensorData.water_level < 30;

            if (waterLevelLow !== isWaterLevelLow) setIsWaterLevelLow(waterLevelLow);
        }
    }, [sensorData?.water_level]); // 옵셔널 체이닝 연산자 사용

    useEffect(() => {
        const outliers = {
            temp_out: {
                high: isTempHigh,
                low: true
            },
            soil_humid_out: {
                high: isSoilHumidHigh,
                low: isSoilHumidLow // 예제에서는 항상 true로 설정하셨습니다.
            },
            water_level_out: isWaterLevelLow
        };

        const prevOutliers = JSON.parse(localStorage.getItem('prevOutliers'));

        if (JSON.stringify(prevOutliers) !== JSON.stringify(outliers)) {
            hostOutlier(outliers);
            localStorage.setItem('prevOutliers', JSON.stringify(outliers));
        }
    }, [isTempHigh, isTempLow, isSoilHumidHigh, isWaterLevelLow]);

    return null;  // 이 컴포넌트는 렌더링하지 않습니다.
}

export default Outlier;
