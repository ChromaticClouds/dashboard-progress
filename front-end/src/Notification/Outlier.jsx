import { useEffect, useState, useMemo } from "react";
import useSocket from "../hooks/socket/useSocket";
import useOutlierStore from "../hooks/outlier/useOutlierStore";

const Outlier = () => {
    const { receivedData } = useSocket(
        import.meta.env.VITE_SOCKET_URL,
        'sensor data'
    );

    const [sensorData, setSensorData] = useState({});

    useEffect(() => {
        if (receivedData) {
            setSensorData(receivedData);
        }
    }, [receivedData]);
    /**
     * 이상치 여부 관리
     */
    const thresholds = useMemo(() => ({
        temperature: { min: 20, max: 40 },
        humidity: { min: 40, max: 90 },
        waterLevel: { min: 3 } // cm
    }), []);

    const anomalyMessages = useMemo(() => ({
        low: {
            temperature: 'Temperature is too low',
            humidity: 'Humidity is too low',
            waterLevel: 'Water level is too low'
        },
        high: {
            temperature: 'Temperature is too high',
            humidity: 'Humidity is too high',
            waterLevel: 'Water level is too high'
        }
    }), []);
    /**
     * 이상치를 찾아서 message와 type를 포함한 배열을 반환
     * @param {Object} data - 센서 데이터 객체
     * @returns {Array} - 이상치 정보가 포함된 배열
     */
    const findAnomalies = (data) => {
        const anomalies = [];

        for (const [key, value] of Object.entries(data)) {
            const { min, max } = thresholds[key] || {};

            if (min !== undefined && value < min) {
                anomalies.push({
                    type: 'warning',
                    message: anomalyMessages.low[key],
                });
            } else if (max !== undefined && value > max) {
                anomalies.push({
                    type: 'warning',
                    message: anomalyMessages.high[key],
                });
            }
        }

        return anomalies;
    };

    const { setOutlier } = useOutlierStore();

    useEffect(() => {
        const detectedOutlier = findAnomalies(sensorData);

        setOutlier(detectedOutlier);
    }, [sensorData]);
}

export default Outlier;
