import { Outlet } from 'react-router-dom';

/**
 * Providers
 */
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';
import { SocketProvider } from './providers/socket-provider';

const reCaptchaOptions = {
  reCaptchaKey: import.meta.env.VITE_SITE_KEY,
  scriptProps: { async: true, defer: true }
}

export const App = () => {
  return (
    <GoogleReCaptchaProvider {...reCaptchaOptions}>
      <SocketProvider>
        <Outlet />
      </SocketProvider>
    </GoogleReCaptchaProvider>
  );
};
