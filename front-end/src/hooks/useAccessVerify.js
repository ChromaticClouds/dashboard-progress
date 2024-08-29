import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getAuthState, clearAuthState } from './autoHelpers';

const useAccessVerify = () => {
    const { accessToken, refreshToken } = getAuthState();

    const navigate = useNavigate();
    const location = useLocation();

    const logout = () => {
        clearAuthState();  // 상태 초기화
        navigate('/login');  // 로그인 페이지로 이동
    };

    // 로딩 상태가 아니라면, 로그인 상태에 따라 리디렉션
    useEffect(() => {
        if (!accessToken || !refreshToken) {
            logout();
        }

        if (location.pathname === '/login' && accessToken) {
            navigate('/main');
        }
    }, [location.pathname, accessToken]);

    return { logout }
};

export default useAccessVerify;
