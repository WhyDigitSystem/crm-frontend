import React from 'react';
import { CssBaseline, StyledEngineProvider } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import NavigationScroll from 'layout/NavigationScroll';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import Routes from 'routes';
import themes from 'themes';
import { useJsApiLoader } from '@react-google-maps/api'; // ✅ add this

import SessionExpiredPopup from 'utils/SessionExpiredPopup';
import ToastComponent from './utils/toast-component';
import { useGoogleMapLoader } from 'utils/googleMapLoader';

const App = () => {
  const customization = useSelector((state) => state.customization);
  const [sessionExpired, setSessionExpired] = useState(false);

  // const { isLoaded } = useJsApiLoader({  // ✅ initialize loader here
  //   googleMapsApiKey: 'AIzaSyDpZlwlIVN_z5uJwMey404fA19Qn3c8fyI',
  //   libraries: ['places'],
  // });

  const { isLoaded } = useGoogleMapLoader();

  useEffect(() => {
    const handleSessionExpiredEvent = () => setSessionExpired(true);
    window.addEventListener('sessionExpired', handleSessionExpiredEvent);
    return () => window.removeEventListener('sessionExpired', handleSessionExpiredEvent);
  }, []);

  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={themes(customization)}>
        <CssBaseline />
        <NavigationScroll>
          {isLoaded ? <Routes /> : <div style={{ textAlign: 'center', marginTop: 100 }}>Loading...</div>}
          <ToastComponent />
          {/* <SessionExpiredPopup open={sessionExpired} /> */}
        </NavigationScroll>
      </ThemeProvider>
    </StyledEngineProvider>
  );
};

export default App; // ✅ make sure this exists
