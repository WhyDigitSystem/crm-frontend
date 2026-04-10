import { useJsApiLoader } from '@react-google-maps/api';

// ✅ MOVE OUTSIDE (IMPORTANT)
const LIBRARIES = ['places'];

export const useGoogleMapLoader = () =>
  useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    libraries: LIBRARIES, // ✅ stable reference
  });