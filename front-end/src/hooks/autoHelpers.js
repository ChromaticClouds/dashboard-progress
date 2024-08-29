import useAuthStore from "./store/useAuthStore";
import useCookieStore from "./store/useCookieStore";

export const getAuthState = () => {
    const { accessToken } = useAuthStore.getState();
    const { getRefreshToken } = useCookieStore.getState();

    const refreshToken = getRefreshToken();
    return { accessToken, refreshToken };
};

export const updateAuthState = (token, username) => {
    const { setAccessToken, setUsername } = useAuthStore.getState();

    setAccessToken(token);
    setUsername(username);
};

export const clearAuthState = () => {
    const { removeAccessToken, setUsername } = useAuthStore.getState();
    const { removeRefreshToken } = useCookieStore.getState(); // Zustand 스토어에서 메서드 직접 가져오기

    removeAccessToken();
    removeRefreshToken(); // 쿠키에서 refreshToken 제거
    setUsername(null);
};
