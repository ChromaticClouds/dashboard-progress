import { useNavigate } from "react-router-dom";
import { clearAuthState } from './autoHelpers';

/**
 * 로그아웃 처리. 라우트 접근 검증은 app/guards.tsx 의 라우트 가드가 담당한다.
 */
const useAccessVerify = () => {
    const navigate = useNavigate();

    const logout = () => {
        clearAuthState();  // 상태 초기화
        navigate('/login');  // 로그인 페이지로 이동
    };

    return { logout }
};

export default useAccessVerify;
