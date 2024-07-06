import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";

const Outlier = ({ hostOutlier }) => {
    const [socket, setSocket] = useState(null);
    const [sensorData, setSensorData] = useState({});

    useEffect(() => {
        const socketIo = io("http://localhost:5000");
        /**
         *  - # 소켓 이벤트 수신
         */
        const hostSensorData = (data) => {
            setSensorData(data)
        };
        socketIo.on('sensor data', hostSensorData);
        setSocket(socketIo);
        /**
         *  - # 소켓 이벤트 정리
         */
        return () => {
            if (socket) {
                socketIo.off('sensor data', hostSensorData);
                socketIo.disconnect();
            }
        };
    }, []);
    /**
     *  - # 이상치 스테이트 관리
     */
    const [tempOver, setTempOver] = useState({
        high: false,
        low: false
    });
    const [soilHumidOver, setSoilHumidOver] = useState({
        high: false,
        low: false
    });
    const [waterLevelOver, setWaterLevelOver] = useState(false);

    useEffect(() => {
        if (sensorData) {
            /**
             *  - # 각 센서 간의 임계값 정의
             */
            const isTempHigh = sensorData.temperature >= 35
            const isTempLow = sensorData.temperature <= 20
            setTempOver({
                high: isTempHigh,
                low: isTempLow
            });

            const isSoilHumidHigh = sensorData.soilHumidity >= 80;
            const isSoilHumidLow = sensorData.soilHumidity <= 30;
            setSoilHumidOver({
                high: isSoilHumidHigh,
                low: isSoilHumidLow
            });

            const isWaterLevelOver = sensorData.water_level < 30;
            setWaterLevelOver(isWaterLevelOver)
        }
    }, [sensorData])

    /**
     *  - # 이상치 밸류 변화 시, 스테이트 저장
     */
    const [previousOutlier, setPreviousOutlier] = useState({});

    useEffect(() => {
        const newOutlier = {
            temp_out: {
                high: tempOver.high,
                low: tempOver.low
            },
            soil_humid_out: {
                high: soilHumidOver.high,
                low: soilHumidOver.low
            },
            water_level_out: waterLevelOver
        };

        const changedOutliers = Object.keys(newOutlier).reduce((acc, key) => {
            if (typeof newOutlier[key] === 'object') {
                const subChanges = Object.keys(newOutlier[key]).reduce((subAcc, subKey) => {
                    if (newOutlier[key][subKey] !== previousOutlier[key]?.[subKey]) {
                        subAcc[subKey] = newOutlier[key][subKey];
                    }
                    return subAcc;
                }, {});

                if (Object.keys(subChanges).length > 0) {
                    acc[key] = subChanges;
                }
            } else if (newOutlier[key] !== previousOutlier[key]) {
                acc[key] = newOutlier[key];
            }
            return acc;
        }, {});

        if (Object.keys(changedOutliers).length > 0) {
            hostOutlier(changedOutliers);
            setPreviousOutlier(newOutlier);
        }
    }, [tempOver, soilHumidOver, waterLevelOver]);
}

export default Outlier;
