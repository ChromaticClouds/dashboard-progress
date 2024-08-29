// useSocket.js
import { useState, useEffect } from 'react';
import io from 'socket.io-client';
import axios from 'axios';
import { getAuthState, updateAuthState } from '../autoHelpers';
/**
 * @param {String} url - 소켓 연결 주소
 * @param {String} eventName - 소켓 수신 이벤트 네임
 * @returns {{ socket: Object | null, receivedData: any }}
 */
const useSocket = (url, eventName) => {
    const { accessToken, refreshToken } = getAuthState();

    const [socket, setSocket] = useState(null);
    const [receivedData, setReceivedData] = useState(null);

    useEffect(() => {
        const socketIo = io(url, {
            transports: ['websocket'],
            auth: {
                token: accessToken,
            },
        });

        setSocket(socketIo);

        socketIo.on(eventName, (data) => {
            setReceivedData(data);
        });

        socketIo.on('connect_error', async (error) => {
            if (error.message === 'TokenExpiredError') {
                try {
                    const newToken = await requestNewToken();
                    if (newToken) {
                        socketIo.auth.token = newToken; // Update socket authentication token
                        socketIo.connect(); // Reconnect the socket
                    } else {
                        console.error('Failed to renew token.');
                    }
                } catch (err) {
                    throw err;
                }
            } else {
                throw error;
            }
        })

        // 컴포넌트 언마운트 시 소켓 연결을 종료합니다.
        return () => {
            if (socketIo) {
                socketIo.disconnect();
            }
        };
    }, [url, eventName]); // url이 변경되면 소켓 연결을 새로 설정합니다.

    const requestNewToken = async () => {
        try {
            const response = await axios.post(
                `${import.meta.env.VITE_BASE_URL}/verify-token`,
                { accessToken, refreshToken }
            );

            if (response.data.token && response.data.username) {
                updateAuthState(response.data.token, response.data.username);
                return response.data.token;
            }
        } catch (error) {
            console.error('Error requesting new token: ', error)
            return null;
        }
    }

    return { setReceivedData, receivedData, socket };
}

export default useSocket;
