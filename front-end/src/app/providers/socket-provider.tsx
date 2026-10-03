import { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import axios from 'axios';

import useAuthStore from '@/hooks/store/useAuthStore';
import { getAuthState, updateAuthState } from '@/hooks/autoHelpers';

const SocketContext = createContext<Socket | null>(null);

export const useSocket = () => {
  const ctx = useContext(SocketContext);
  return ctx;
}

type VerifyTokenResponse = { token?: string; username?: string };

/**
 * 토큰 재발급을 한 번만 진행한다.
 * 같은 순간에 connect_error가 여러 번 와도 /verify-token 요청 하나를 공유한다.
 */
let refreshPromise: Promise<string | null> | null = null;

const refreshAccessToken = () => {
  if (!refreshPromise) {
    const { accessToken, refreshToken } = getAuthState();

    refreshPromise = axios
      .post<VerifyTokenResponse>(`${import.meta.env.VITE_BASE_URL}/verify-token`, {
        accessToken,
        refreshToken,
      })
      .then(({ data }) => {
        if (!data.token || !data.username) return null;
        updateAuthState(data.token, data.username);
        return data.token;
      })
      .catch((error) => {
        console.error('Error requesting new token: ', error);
        return null;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
};

const createSocket = () =>
  io(import.meta.env.VITE_SOCKET_URL, {
    transports: ['websocket'],
    autoConnect: false,
    // 연결을 시도할 때마다 최신 accessToken을 읽는다.
    auth: (cb) => cb({ token: useAuthStore.getState().accessToken }),
  });

/**
 * 앱 전체가 Socket.IO 연결 하나를 공유한다.
 * 컴포넌트는 이 소켓에 이벤트만 구독하고, 언마운트될 때 자기 리스너만 해제한다.
 */
export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [socket] = useState(createSocket);
  const accessToken = useAuthStore((state) => state.accessToken);

  useEffect(() => {
    // 만료로 거절되면 재발급만 한다. 새 토큰이 저장되면 아래 effect가 다시 연결한다.
    const onConnectError = (error: Error) => {
      if (error.message === 'TokenExpiredError') {
        refreshAccessToken();
        return;
      }
      console.error('Socket connection error: ', error.message);
    };

    socket.on('connect_error', onConnectError);

    return () => {
      socket.off('connect_error', onConnectError);
      socket.disconnect();
    };
  }, [socket]);

  // 연결 수명은 로그인 상태를 따른다. 로그아웃하면 끊고, 토큰이 생기거나 바뀌면 다시 연결한다.
  useEffect(() => {
    if (!accessToken) {
      socket.disconnect();
      return;
    }
    if (!socket.active) socket.connect();
  }, [socket, accessToken]);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};
