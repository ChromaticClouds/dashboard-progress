import React, { useEffect, useState } from 'react';
import OpenAI from './OpenAI';

const Classification = ({ predictions }) => {
    const [classification, setClassification] = useState({});

    useEffect(() => {
        const socket = new WebSocket("ws://localhost:8001/diseases");

        socket.onmessage = (event) => {
            try {
                const diseases = JSON.parse(event.data);
                setClassification(diseases);
            }
            catch (error) {
                console.error("데이터 수신 중 문제 발생: ",error);
            }
        }

        socket.onerror = (error) => {
            console.error("WebSocket 오류: ", error);
        };

        socket.onclose = () => {
            console.log("WebSocket 연결이 닫혔습니다");
        };

        return () => {
            socket.close();
        };
    }, []);

    useEffect(() => {
        predictions(classification);
    }, [classification]);

    return <OpenAI leavesStatus={classification} />
}

export default Classification;