import React from 'react'
import { BrowserRouter as Router } from 'react-router-dom';
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';
import ReactDOM from 'react-dom/client';
import Home from './Dashboard/Home';

const siteKey = import.meta.env.VITE_SITE_KEY;

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Router>
      <GoogleReCaptchaProvider
        reCaptchaKey={siteKey}
        scriptProps={{
          async: true,
          defer: true,
        }}
      >
        <Home />
      </GoogleReCaptchaProvider>
    </Router>
  </React.StrictMode>
)
