import { useEffect } from 'react';
/**
 * 웹소켓 커넥팅 훅 (수신용)
 * @param {String} url - 소켓 수신 주소
 * @param {Function} onMessage - 수신 결과 처리 콜백 함수
 */
const useWebSocket = (url, onMessage) => {
    useEffect(() => {
        const socket = new WebSocket(url);

        socket.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                onMessage(data);
            } catch (error) {
                console.error(`Error receiving data from ${url}: `, error);
            }
        };

        return () => {
            socket.close();
        };
    }, [url, onMessage]);
};

export default useWebSocket;
