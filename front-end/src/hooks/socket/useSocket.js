// useSocket.js
import { useState, useEffect } from 'react';
import { useSocket as useSharedSocket } from '@/app/providers/socket-provider';

/**
 * 공유 소켓에서 이벤트 하나를 구독한다.
 * 연결은 SocketProvider가 하나만 관리하고, 이 훅은 리스너만 붙였다 뗀다.
 * @param {String} eventName - 소켓 수신 이벤트 네임
 * @returns {{ socket: Object | null, receivedData: any, setReceivedData: Function }}
 */
const useSocket = (eventName) => {
    const socket = useSharedSocket();
    const [receivedData, setReceivedData] = useState(null);

    useEffect(() => {
        if (!socket) return;

        const handler = (data) => {
            setReceivedData(data);
        };

        socket.on(eventName, handler);

        // 컴포넌트가 사라질 때 자기 리스너만 해제한다. 연결은 끊지 않는다.
        return () => {
            socket.off(eventName, handler);
        };
    }, [socket, eventName]);

    return { setReceivedData, receivedData, socket };
}

export default useSocket;
