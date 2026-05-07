import { useEffect, useCallback } from "react";

import useSocket from "../../../hooks/socket/useSocket";
import useWebSocket from "../../../hooks/socket/useWebsocket";
import usePredictStore from "./store/usePredictStore";
/**
 * 각 데이터를 결집하기 위한 컴포넌트
 */
const useOpenAi = () => {
    const { setData } = usePredictStore();

    const { receivedData: sensorData } = useSocket(
        import.meta.env.VITE_SOCKET_URL,
        'sensor data'
    );

    useEffect(() => {
        if (sensorData) {
            setData({ 
                sensorData
            });
        }
    }, [sensorData]);

    const returnDeseasesResult = useCallback((result) => {
        setData({
            leaves: result
        })
    }, [setData]);

    const returnHealthyResult = useCallback((result) => {
        setData({
            tomatoes: result
        })
    }, [setData]);

    useWebSocket(
        import.meta.env.VITE_LEAVES_PREDICTION_URL,
        returnDeseasesResult
    );

    useWebSocket(
        import.meta.env.VITE_HEALTHY_PREDICTION_URL,
        returnHealthyResult
    );
};

export default useOpenAi;
