import { Navigate, Outlet, useLocation } from 'react-router-dom';

import useAuthStore from '@/hooks/store/useAuthStore';
import useCookieStore from '@/hooks/store/useCookieStore';

/**
 * 로그인 상태 판단: accessToken(localStorage)과 refreshToken(cookie)이 모두 있어야 한다.
 * 라우트 가드 두 개가 같은 기준을 써야 /login ↔ /main 리다이렉트 루프가 생기지 않는다.
 */
const useIsAuthenticated = () => {
  // 구독해 두면 logout/login 으로 토큰이 바뀔 때 가드가 다시 평가된다.
  const accessToken = useAuthStore((state) => state.accessToken);
  const refreshToken = useCookieStore.getState().getRefreshToken();

  return Boolean(accessToken && refreshToken);
};

/**
 * 인증이 필요한 라우트: 로그인하지 않았다면 /login 으로 보낸다.
 */
export const RequireAuth = () => {
  const isAuthenticated = useIsAuthenticated();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
};

/**
 * 비로그인 전용 라우트: 이미 로그인했다면 /main 으로 보낸다.
 */
export const RedirectIfAuthenticated = () => {
  const isAuthenticated = useIsAuthenticated();

  if (isAuthenticated) {
    return <Navigate to="/main" replace />;
  }

  return <Outlet />;
};
