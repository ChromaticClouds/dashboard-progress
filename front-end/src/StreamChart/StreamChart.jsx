import React, { useState, useEffect, useRef } from 'react';
import moment from 'moment';
import HarvestChart from '../../chart/HarvestChart';

/**
 * 실시간 데이터를 사용하여 생산 수율을 보여주는 차트 컴포넌트
 * @param {Object} props - 부모 컴포넌트에서 전달받은 props 객체
 * @param {function} props.hostValue - 생산 수율 값을 부모 컴포넌트로 전달하는 콜백 함수
 * @returns {JSX.Element} HarvestChart 컴포넌트를 반환
 */
const StreamChart = ({ hostValue }) => {
    const [harvestable, setHarvestable] = useState({
        labels: [],
        datasets: [
            {
                /**
                 *  - # 차트 스타일링 커스텀 # -
                 */
                label: '생산 수율',
                data: [], // 첫 렌더링 시, 배열 초기화
                borderColor: '#5b87d4',
                backgroundColor: 'rgba(56, 121, 218, 0.37)',
                fill: "origin",
                tension: 0.3,
                pointStyle: false
            },
        ],
    });

    const dataRef = useRef([]);  // 데이터를 추적하는 useRef 훅

    useEffect(() => {
        /**-------------------------------------------------------------------------------------------------------------*
         * 웹소켓 연결을 생성하고 실시간 데이터를 수신하여 처리하는 부분
         * 웹소켓 연결이 닫힐 때까지 데이터를 수신하며, 데이터를 배열에 저장하고 필요한 형식으로 변환하여 차트 데이터를 업데이트
         *-------------------------------------------------------------------------------------------------------------**/
        const ws = new WebSocket("ws://localhost:8001/ws");

        ws.onmessage = (event) => {
            try {
                console.log(event.data)
                const data = JSON.parse(event.data); /* 수신한 JSON 데이터를 파싱 */
            
                dataRef.current = [...dataRef.current, data]; /* [...기존 데이터 + <---- 새로운 데이터 추가] */

                /**
                 *  - # 데이터 오버 방지를 위해 최대 8개까지만 데이터를 배열에 저장
                 */
                if (dataRef.current.length > 8) {
                    dataRef.current.shift();
                }

                /**
                 *  - # 전송받은 객체에서 데이터 파싱 후, 차트 데이터 업데이트
                 */
                const labels = dataRef.current.map(item => moment(item.time).format('mm:ss'));
                const productionYields = dataRef.current.map(item => (item.ripe / (item.ripe + item.unripe + item.rotten)) * 100);

                setHarvestable({
                    labels,
                    datasets: [
                        {
                            label: '생산 수율',
                            data: productionYields,
                            borderColor: '#5b87d4',
                            fill: "origin",
                            backgroundColor: 'rgba(56, 121, 218, 0.37)',
                            tension: 0.3,
                            pointStyle: false
                        },
                    ],
                });
            } catch (error) {
                console.error("데이터 업데이트 처리 중 오류 발생:", error);
            }
        };

        ws.onerror = (error) => {
            console.error("WebSocket 오류:", error);
        };

        ws.onclose = () => {
            console.log("WebSocket 연결이 닫혔습니다");
        };

        return () => {
            ws.close();
        };
    }, []);

    useEffect(() => {
        /**
         * 차트 데이터셋에서 생산 수율 값을 추출하여 부모 컴포넌트로 전달함
         * 데이터 배열에서 각 항목의 'ripe', 'unripe', 'rotten' 값을 사용하여 생산 수율을 계산하고, 이를 부모 컴포넌트에 콜백 함수로 전달
         */
        const value = dataRef.current.map(item => (item.ripe / (item.ripe + item.unripe + item.rotten)) * 100);
        
        hostValue(value);
    }, [harvestable]);
    /**
     *  -> Harvest 컴포넌트로 차트 데이터 및 스타일링 정의를 props로 전달
     */
    return <HarvestChart hostChartData={harvestable} />;
};

export default StreamChart;
