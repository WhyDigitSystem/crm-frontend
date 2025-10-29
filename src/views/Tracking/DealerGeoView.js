import React, { useEffect, useState, useRef } from 'react';
import { GoogleMap, Marker, InfoWindow, useJsApiLoader, Autocomplete } from '@react-google-maps/api';
import { Box, Grid, Paper, Typography, TextField, Tabs, Tab, Button } from '@mui/material';
import PhoneIphoneIcon from '@mui/icons-material/PhoneIphone';
import PersonIcon from '@mui/icons-material/Person';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import StoreIcon from '@mui/icons-material/Store';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import apiCalls from 'apicall';
import FullScreenLoader from 'utils/FullScreenLoader';

const containerStyle = { width: '100%', height: '80vh' };
const defaultCenter = { lat: 20.5937, lng: 78.9629 };

const DealerGeoView = () => {
  const [dealerData, setDealerData] = useState([]);
  const [distributorData, setDistributorData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [selectedDealer, setSelectedDealer] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [loading, setLoading] = useState(false);

  const branchCode = localStorage.getItem('branchcode');
  const finYear = localStorage.getItem('finYear');
  const orgId = localStorage.getItem('orgId');

  const mapRef = useRef(null);
  const autocompleteRef = useRef(null);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: 'AIzaSyDpZlwlIVN_z5uJwMey404fA19Qn3c8fyI', // ⚠️ Replace with your real key or env variable
    libraries: ['places']
  });

  // 📦 Fetch Dealer + Distributor data
  useEffect(() => {
    fetchDealerAndDistributor();
  }, []);

  const fetchDealerAndDistributor = async () => {
    setLoading(true);
    try {
      const [dealerRes, distributorRes] = await Promise.all([
        apiCalls('get', `/dealer/getAllDealerByOrgId?branchCode=${branchCode}&finYear=${finYear}&orgId=${orgId}`),
        apiCalls('get', `/dealer/getAllDistributorByOrgId?branchCode=${branchCode}&finYear=${finYear}&orgId=${orgId}`)
      ]);

      const dealers = await Promise.all(
        (dealerRes.paramObjectsMap.dealerVO || []).map(async (d) => {
          if (d.name || d.district) {
            const coords = await getLatLngFromAddress(d.name, d.district);
            return { ...d, ...coords, type: 'Dealer' };
          }
          return { ...d, type: 'Dealer' };
        })
      );

      const distributors = await Promise.all(
        (distributorRes.paramObjectsMap.distributorVO || []).map(async (d) => {
          if (!d.name || d.district) {
            const coords = await getLatLngFromAddress(d.name, d.district);
            return { ...d, ...coords, type: 'Distributor' };
          }
          return { ...d, type: 'Distributor' };
        })
      );

      setDealerData(dealers);
      setDistributorData(distributors);
      setFilteredData([...dealers, ...distributors]);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  // 🌍 Get Lat/Lng from address (Google Geocoding API)
  const getLatLngFromAddress = async (name, district) => {
    try {
      const fullAddress = `${name} - ${district}`; // Combine with dash
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(fullAddress)}&key=AIzaSyDpZlwlIVN_z5uJwMey404fA19Qn3c8fyI`
      );

      const data = await response.json();

      if (data.results && data.results.length > 0) {
        const { lat, lng } = data.results[0].geometry.location;
        return { latitude: lat, longitude: lng };
      }

      return { latitude: 0, longitude: 0 };
    } catch (err) {
      console.error('Geocoding failed:', err);
      return { latitude: 0, longitude: 0 };
    }
  };

  // 🔍 Filter Data
  useEffect(() => {
    let data = [...dealerData, ...distributorData];
    if (filterType !== 'All') data = data.filter((d) => d.type === filterType);
    if (searchText) {
      data = data.filter((d) =>
        [d.name, d.contactPerson1, d.address, d.mobile1].some((f) => f?.toLowerCase().includes(searchText.toLowerCase()))
      );
    }
    setFilteredData(data);
  }, [searchText, filterType, dealerData, distributorData]);

  // 🧭 Fit map to all markers
  useEffect(() => {
    if (mapRef.current && filteredData.length > 0 && window.google) {
      const bounds = new window.google.maps.LatLngBounds();
      filteredData.forEach((d) => {
        if (d.latitude && d.longitude) {
          bounds.extend({
            lat: parseFloat(d.latitude),
            lng: parseFloat(d.longitude)
          });
        }
      });
      mapRef.current.fitBounds(bounds);
    } else if (mapRef.current) {
      // Default view when no data is loaded
      mapRef.current.setCenter(defaultCenter);
      mapRef.current.setZoom(5);
    }
  }, [filteredData]);

  const getPinIcon = (type) =>
    type === 'Dealer' ? 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png' : 'http://maps.google.com/mapfiles/ms/icons/green-dot.png';

  // 🧭 Handle My Location
  const handleLocate = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;

          if (mapRef.current) {
            mapRef.current.panTo({ lat: latitude, lng: longitude });
            mapRef.current.setZoom(14);
          }
        },
        (error) => {
          console.error('Geolocation error:', error);
          alert('Unable to fetch your location. Please enable location access.');
        }
      );
    } else {
      alert('Geolocation is not supported by your browser.');
    }
  };

  // 📍 Google Places Search
  const handlePlaceChanged = () => {
    const place = autocompleteRef.current.getPlace();
    if (place.geometry) {
      const loc = place.geometry.location;
      mapRef.current.panTo({ lat: loc.lat(), lng: loc.lng() });
      mapRef.current.setZoom(10);
    }
  };

  const handleCardHover = (dealer) => {
    if (mapRef.current && dealer.latitude && dealer.longitude) {
      mapRef.current.panTo({
        lat: parseFloat(dealer.latitude),
        lng: parseFloat(dealer.longitude)
      });
      mapRef.current.setZoom(8);
    }
  };

  return (
    <>
      {loading && (
        <div style={{ position: 'fixed', top: '45%', left: '45%', zIndex: 9999 }}>
          <FullScreenLoader />
        </div>
      )}

      <Grid container spacing={2}>
        {/* Sidebar */}
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2, height: '80vh', overflowY: 'auto', bgcolor: '#f9fafc' }}>
            {/* 🔍 Google Places Search */}
            {isLoaded && (
              <Autocomplete onLoad={(auto) => (autocompleteRef.current = auto)}>
                {/* <Autocomplete onLoad={(auto) => (autocompleteRef.current = auto)} onPlaceChanged={handlePlaceChanged}> */}
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Search location or name..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  sx={{ mb: 2 }}
                />
              </Autocomplete>
            )}

            {/* Tabs */}
            <Tabs
              value={filterType}
              onChange={(e, newValue) => setFilterType(newValue)}
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                mb: 2,
                minHeight: '40px',
                '& .MuiTabs-flexContainer': { gap: 1 },
                '& .MuiTab-root': {
                  textTransform: 'none',
                  fontWeight: 600,
                  borderRadius: '20px',
                  px: 2,
                  py: 0.7,
                  minHeight: 'auto',
                  color: '#000',
                  border: '1px solid #cbd5e1',
                  flexShrink: 0,
                  '&.Mui-selected': {
                    bgcolor: '#1e40af',
                    color: '#fff',
                    border: '1px solid #1e40af',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.15)'
                  }
                }
              }}
            >
              <Tab label="All" value="All" />
              <Tab
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <StoreIcon sx={{ fontSize: 16 }} /> Dealer
                  </Box>
                }
                value="Dealer"
              />
              <Tab
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <LocalShippingIcon sx={{ fontSize: 16 }} /> Distributor
                  </Box>
                }
                value="Distributor"
              />
            </Tabs>
            <Typography variant="h6" sx={{ mb: 2 }}>
              {filterType} List ({filteredData.length})
            </Typography>
            {filteredData.map((dealer, i) => (
              <Paper
                key={i}
                onMouseEnter={() => handleCardHover(dealer)}
                onClick={() => setSelectedDealer(dealer)}
                elevation={selectedDealer?.name === dealer.name ? 4 : 1}
                sx={{
                  p: 2,
                  mb: 1.5,
                  borderRadius: 3,
                  cursor: 'pointer',
                  border: selectedDealer?.name === dealer.name ? '1.5px solid #2563eb' : '1px solid #e2e8f0',
                  transition: 'all 0.3s ease',
                  bgcolor: selectedDealer?.name === dealer.name ? '#eff6ff' : '#fff',
                  '&:hover': {
                    boxShadow: '0 4px 14px rgba(0,0,0,0.08)',
                    transform: 'translateY(-2px)'
                  }
                }}
              >
                {/* Dealer Name */}
                <Typography
                  variant="subtitle1"
                  sx={{
                    fontWeight: 700,
                    color: selectedDealer?.name === dealer.name ? '#1d4ed8' : '#1e293b',
                    mb: 0.5
                  }}
                >
                  {dealer.name}
                </Typography>

                {/* Contact Info */}
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                  <PhoneIphoneIcon sx={{ fontSize: 17, color: '#475569', mr: 1 }} />
                  <Typography variant="body2" sx={{ color: '#334155' }}>
                    {dealer.mobile1 || '—'}
                  </Typography>
                </Box>

                {/* Person */}
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                  <PersonIcon sx={{ fontSize: 17, color: '#475569', mr: 1 }} />
                  <Typography variant="body2" sx={{ color: '#334155' }}>
                    {dealer.contactPerson1 || '—'}
                  </Typography>
                </Box>

                {/* Address */}
                <Box sx={{ display: 'flex', alignItems: 'flex-start', mt: 0.5 }}>
                  <LocationOnIcon sx={{ fontSize: 17, color: '#64748b', mr: 1 }} />
                  <Typography
                    variant="body2"
                    sx={{
                      color: '#475569',
                      lineHeight: 1.4,
                      wordBreak: 'break-word'
                    }}
                  >
                    {dealer.address || 'No Address'}
                  </Typography>
                </Box>
              </Paper>
            ))}
          </Paper>
        </Grid>

        {/* 🗺️ Map */}
        <Grid item xs={12} md={9}>
          <Paper sx={{ height: '80vh', borderRadius: 2, overflow: 'hidden', position: 'relative' }}>
            {isLoaded && (
              <>
                <GoogleMap
                  mapContainerStyle={containerStyle}
                  center={filteredData.length > 0 ? undefined : defaultCenter}
                  zoom={filteredData.length > 0 ? undefined : 5}
                  onLoad={(map) => {
                    mapRef.current = map;

                    // Center on India by default
                    map.setCenter(defaultCenter);
                    map.setZoom(5);
                  }}
                >
                  {filteredData.map((dealer, i) => (
                    <Marker
                      key={i}
                      position={{
                        lat: parseFloat(dealer.latitude) || 0,
                        lng: parseFloat(dealer.longitude) || 0
                      }}
                      icon={{ url: getPinIcon(dealer.type) }}
                      onClick={() => setSelectedDealer(dealer)}
                    />
                  ))}
                  {selectedDealer && (
                    <InfoWindow
                      position={{
                        lat: parseFloat(selectedDealer.latitude) || 0,
                        lng: parseFloat(selectedDealer.longitude) || 0
                      }}
                      onCloseClick={() => setSelectedDealer(null)}
                    >
                      <Box
                        sx={{
                          p: 1.5,
                          minWidth: 230,
                          borderRadius: 2,
                          boxShadow: '0 4px 14px rgba(0,0,0,0.1)',
                          bgcolor: '#fff',
                          fontFamily: 'Roboto, sans-serif'
                        }}
                      >
                        {/* Header Row: Badge + Name */}
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            mb: 0.8
                          }}
                        >
                          <Typography
                            variant="subtitle1"
                            sx={{
                              fontWeight: 700,
                              color: '#1e293b',
                              fontSize: '0.95rem',
                              flexGrow: 1
                            }}
                          >
                            {selectedDealer.name}
                          </Typography>

                          <Typography
                            variant="caption"
                            sx={{
                              px: 1,
                              py: 0.3,
                              borderRadius: '12px',
                              bgcolor: selectedDealer.type === 'Dealer' ? 'rgba(37, 99, 235, 0.1)' : 'rgba(22, 163, 74, 0.1)',
                              color: selectedDealer.type === 'Dealer' ? '#2563eb' : '#16a34a',
                              fontWeight: 600,
                              fontSize: '0.75rem',
                              ml: 1,
                              whiteSpace: 'nowrap'
                            }}
                          >
                            {selectedDealer.type}
                          </Typography>
                        </Box>

                        {/* Contact Details */}
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.4 }}>
                          <PhoneIphoneIcon sx={{ fontSize: 16, color: '#2563eb', mr: 0.8 }} />
                          <Typography variant="body2" sx={{ color: '#475569' }}>
                            {selectedDealer.mobile1 || '—'}
                          </Typography>
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.4 }}>
                          <PersonIcon sx={{ fontSize: 16, color: '#16a34a', mr: 0.8 }} />
                          <Typography variant="body2" sx={{ color: '#475569' }}>
                            {selectedDealer.contactPerson1 || '—'}
                          </Typography>
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                          <LocationOnIcon sx={{ fontSize: 16, color: '#f59e0b', mr: 0.8 }} />
                          <Typography
                            variant="body2"
                            sx={{
                              color: '#475569',
                              lineHeight: 1.3
                            }}
                          >
                            {selectedDealer.address || 'No address'}
                          </Typography>
                        </Box>
                      </Box>
                    </InfoWindow>
                  )}
                </GoogleMap>

                {/* 📍 My Location Button */}
                <Button
                  onClick={handleLocate}
                  sx={{
                    position: 'absolute',
                    bottom: 20,
                    right: 20,
                    bgcolor: '#1e40af',
                    color: '#fff',
                    '&:hover': { bgcolor: '#1e3a8a' }
                  }}
                >
                  📍 My Location
                </Button>
              </>
            )}
          </Paper>
        </Grid>
      </Grid>
    </>
  );
};

export default DealerGeoView;
