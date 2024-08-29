import React, { useState, useEffect, useRef, useCallback } from 'react';
import moment from 'moment';
import HarvestChart from '../../../Chart/HarvestChart';

import useWebSocket from '../../hooks/socket/useWebsocket';
import useStreamChartStore from './hooks/store/useStreamChartStore';
/**
 * 실시간 데이터를 사용하여 생산 수율을 보여주는 차트 컴포넌트
 * @returns {JSX.Element} HarvestChart 컴포넌트를 반환
 */
const StreamChart = () => {
    const { harvestable, setHarvestable } = useStreamChartStore();

    const [streamData, setStreamData] = useState([]);

    // 생산 수율 데이터를 업데이트하는 함수
    const updateHarvestable = useCallback(() => {
        if (streamData.length > 0) {
            const labels = streamData.map(item => 
                moment(item?.time).format('mm:ss')
            );

            const productionYields = streamData.map(item => 
                (item?.ripe / ((item?.ripe || 0) + (item?.unripe || 0) + (item?.rotten || 0))) * 100
            );

            setHarvestable(labels, productionYields);
        }
    }, [streamData, setHarvestable]);

    // WebSocket을 통해 받은 토마토 데이터를 처리하는 함수
    const updateStatus = useCallback((tomatoes) => {
        if (tomatoes) {
            setStreamData((prevData) => {
                const newData = [...prevData, ...tomatoes];
                return newData.length > 8 
                    ? newData.slice(-8) 
                    : newData;
            });
        }
    }, []);

    useEffect(() => {
        updateHarvestable();
    }, [streamData, updateHarvestable]);

    useWebSocket(
        import.meta.env.VITE_HEALTHY_PREDICTION_URL,
        updateStatus
    );

    return (
        <div className='harvest-box'>
            <HarvestChart hostChartData={harvestable} />
        </div>
    );
};

export default StreamChart;
