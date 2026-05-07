// utils/axiosInstance.js
import axios from 'axios';
import { getAuthState, updateAuthState, clearAuthState } from '../hooks/autoHelpers';

const createAxiosInstance = () => {
    // Axios 인스턴스 생성
    const axiosInstance = axios.create({
        baseURL: import.meta.env.VITE_BASE_URL,
    });
    
    // 요청 인터셉터 설정
    axiosInstance.interceptors.request.use(
        (config) => {
            const { accessToken } = getAuthState(); // 상태를 가져오는 함수
            if (accessToken) {
                config.headers['Authorization'] = `Bearer ${accessToken}`;
            }
            return config;
        },
        (error) => Promise.reject(error)
    );
    
    // 응답 인터셉터 설정
    axiosInstance.interceptors.response.use(
        (response) => response,
        async (error) => {
            const originalRequest = error.config;
            if (error.response && !originalRequest._retry) {
                originalRequest._retry = true;
    
                try {
                    const { accessToken, refreshToken } = getAuthState();
                    const response = await axios.post(
                        `${import.meta.env.VITE_BASE_URL}/verify-token`, // baseURL 사용
                        { accessToken, refreshToken }
                    );
    
                    if (response.data.token && response.data.username) {
                        updateAuthState(response.data.token, response.data.username);
                        originalRequest.headers['Authorization'] = `Bearer ${response.data.token}`;
                        return axiosInstance(originalRequest);
                    }
                } catch (tokenError) {
                    clearAuthState();
                    return Promise.reject(tokenError);
                }
            }
    
            return Promise.reject(error);
        }
    );

    return axiosInstance;
}

export default createAxiosInstance;
