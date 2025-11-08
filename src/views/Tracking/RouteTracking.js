import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
    Box, Grid, Tabs, Tab, TextField, Paper, Typography, Divider, Stack,
    CircularProgress, Button
} from '@mui/material';
import {
    GoogleMap, Marker, DirectionsRenderer, OverlayView, Autocomplete, useJsApiLoader
} from '@react-google-maps/api';
import ScheduleIcon from '@mui/icons-material/Schedule';
import PersonIcon from '@mui/icons-material/Person';
import StraightenIcon from '@mui/icons-material/Straighten';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import NavigationIcon from '@mui/icons-material/Navigation';
import RoomIcon from '@mui/icons-material/Room';
import apiCalls from 'apicall';

const FALLBACK_CENTER = { lat: 12.9716, lng: 77.5946 };
const containerStyle = { width: '100%', height: '85vh' };
const firstLetter = (name = '') => (name ? name.trim()[0].toUpperCase() : '?');

export default function RouteTracking() {
    const orgId = localStorage.getItem('orgId') || '';
    const branchCode = localStorage.getItem('branchcode') || '';
    const loginUserName = localStorage.getItem('userName');
    const finYear = localStorage.getItem('finYear') || '';

    const [filterType, setFilterType] = useState('All');
    const [searchText, setSearchText] = useState('');
    const [myLeads, setMyLeads] = useState([]);
    const [myScheduled, setMyScheduled] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [selectedLead, setSelectedLead] = useState(null);
    const [directions, setDirections] = useState(null);
    const [distanceText, setDistanceText] = useState('');
    const [durationText, setDurationText] = useState('');
    const [loadingRoute, setLoadingRoute] = useState(false);
    const [currentPosition, setCurrentPosition] = useState(null);
    const mapRef = useRef(null);
    const autocompleteRef = useRef(null);

    const { isLoaded } = useJsApiLoader({
        googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
        libraries: ['places']
    });

    useEffect(() => {
        getLeadAndSchedule();
    }, []);

    const getLeadAndSchedule = async () => {
        try {
            const [leadsRes, scheduleRes] = await Promise.all([
                apiCalls('get', `/transaction/getMyLeads?assginedName=${loginUserName}&branchCode=${branchCode}&orgId=${orgId}`),
                apiCalls('get', `/activities/getScheduleAssignedUserName?assginedName=${loginUserName}&branchCode=${branchCode}&finYear=${finYear}&orgId=${orgId}`)
            ]);

            const leads = (leadsRes.paramObjectsMap?.myLeads || []).map(d => ({
                ...d,
                latitude: d.latitude || 12.97,
                longitude: d.longitude || 77.59,
                type: 'MyLeads'
            }));

            const schedules = (scheduleRes.paramObjectsMap?.clientLists || []).map(d => ({
                ...d,
                latitude: d.latitude || 12.97,
                longitude: d.longitude || 77.59,
                type: 'Scheduled'
            }));

            setMyLeads(leads);
            setMyScheduled(schedules);
            setFilteredData([...leads, ...schedules]);
        } catch (err) {
            console.error('Error fetching data:', err);
        }
    };

    const handleMapLoad = (map) => (mapRef.current = map);

    const handleLeadSelect = useCallback(
        async (lead) => {
            if (!isLoaded || !window.google || !currentPosition) return;

            setSelectedLead(lead);
            setLoadingRoute(true);
            setDistanceText('');
            setDurationText('');
            setDirections(null);

            const directionsService = new window.google.maps.DirectionsService();
            directionsService.route(
                {
                    origin: currentPosition,
                    destination: { lat: Number(lead.latitude), lng: Number(lead.longitude) },
                    travelMode: window.google.maps.TravelMode.DRIVING,
                },
                (result, status) => {
                    if (status === 'OK') {
                        setDirections(result);
                        const distanceService = new window.google.maps.DistanceMatrixService();
                        distanceService.getDistanceMatrix(
                            {
                                origins: [currentPosition],
                                destinations: [{ lat: Number(lead.latitude), lng: Number(lead.longitude) }],
                                travelMode: window.google.maps.TravelMode.DRIVING,
                            },
                            (response, dmStatus) => {
                                if (dmStatus === 'OK') {
                                    const el = response.rows?.[0]?.elements?.[0];
                                    if (el) {
                                        setDistanceText(el.distance?.text || '');
                                        setDurationText(el.duration?.text || '');
                                    }
                                }
                                setLoadingRoute(false);
                            }
                        );
                    } else {
                        console.error('Directions failed:', status);
                        setLoadingRoute(false);
                    }
                }
            );
        },
        [isLoaded, currentPosition]
    );

    useEffect(() => {
        if (!navigator.geolocation) {
            setCurrentPosition(FALLBACK_CENTER);
            return;
        }
        navigator.geolocation.getCurrentPosition(
            (pos) => setCurrentPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
            () => setCurrentPosition(FALLBACK_CENTER),
            { enableHighAccuracy: true, timeout: 10000 }
        );
    }, []);

    const filteredLeads =
        filterType === 'All'
            ? filteredData
            : filteredData.filter((d) => d.type === filterType);

    const buildLetterIcon = (letter, color = '#ef5350') => {
        if (!window.google?.maps) return null;
        const svg = encodeURIComponent(
            `<svg xmlns="http://www.w3.org/2000/svg" width="60" height="80" viewBox="0 0 60 80">
        <g><path d="M30 0 C10 0 0 20 0 32 C0 50 30 80 30 80 C30 80 60 50 60 32 C60 20 50 0 30 0 Z"
         fill="${color}" />
         <text x="50%" y="46%" font-family="Arial" font-size="28" fill="#fff" font-weight="700"
         text-anchor="middle">${letter}</text></g></svg>`
        );
        return { url: `data:image/svg+xml;charset=UTF-8,${svg}`, scaledSize: new window.google.maps.Size(40, 53) };
    };

    if (!isLoaded) return <Box p={3}><CircularProgress /> Loading map...</Box>;

    return (
        <Grid container spacing={2} sx={{ p: 2 }}>
            {/* LEFT PANEL */}
            <Grid item xs={12} md={3}>
                <Paper sx={{ p: 2, height: '85vh', overflowY: 'auto', bgcolor: '#f9fafc' }}>
                    <Tabs
                        value={filterType}
                        onChange={(e, v) => setFilterType(v)}
                        variant="scrollable"
                        scrollButtons="auto"
                        sx={{
                            mb: 2,
                            '& .MuiTab-root': {
                                textTransform: 'none',
                                borderRadius: '20px',
                                fontWeight: 600,
                            },
                        }}
                    >
                        <Tab label="All" value="All" />
                        <Tab icon={<ScheduleIcon />} iconPosition="start" label="Scheduled" value="Scheduled" />
                        <Tab icon={<PersonIcon />} iconPosition="start" label="My Leads" value="MyLeads" />
                    </Tabs>

                    {filteredLeads.map((lead, i) => {
                        const isSelected = selectedLead?.docId === lead.docId;
                        return (
                            <Paper
                                key={i}
                                onClick={() => handleLeadSelect(lead)}
                                sx={{
                                    p: 2,
                                    mb: 1.5,
                                    borderRadius: 2,
                                    cursor: 'pointer',
                                    border: isSelected ? '2px solid #1976d2' : '1px solid #e0e0e0',
                                    bgcolor: isSelected ? '#f1f5ff' : '#fff',
                                    transition: '0.3s',
                                }}
                            >
                                <Typography fontWeight={600} variant="subtitle1">
                                    {lead.clientName}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    <RoomIcon sx={{ fontSize: 16, mr: 0.5 }} /> {lead.address || 'No address'}
                                </Typography>
                            </Paper>
                        );
                    })}
                </Paper>
            </Grid>

            {/* MAP PANEL */}
            <Grid item xs={12} md={9}>
                <Paper sx={{ height: '85vh', borderRadius: 3, overflow: 'hidden', position: 'relative' }}>
                    <GoogleMap
                        mapContainerStyle={containerStyle}
                        center={currentPosition || FALLBACK_CENTER}
                        zoom={12}
                        onLoad={handleMapLoad}
                        options={{ streetViewControl: false, mapTypeControl: false }}
                    >
                        {currentPosition && (
                            <OverlayView position={currentPosition} mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}>
                                <div style={{ transform: 'translate(-50%, -50%)' }}>
                                    <div
                                        style={{
                                            width: 12,
                                            height: 12,
                                            borderRadius: '50%',
                                            background: '#1e88e5',
                                            boxShadow: '0 0 8px rgba(30,136,229,0.6)',
                                        }}
                                    />
                                </div>
                            </OverlayView>
                        )}

                        {filteredLeads.map((lead, i) => {
                            const pos = { lat: Number(lead.latitude), lng: Number(lead.longitude) };
                            const icon = buildLetterIcon(firstLetter(lead.clientName), '#ef5350');
                            return <Marker key={i} position={pos} title={lead.clientName} icon={icon} onClick={() => handleLeadSelect(lead)} />;
                        })}

                        {directions && <DirectionsRenderer directions={directions} />}
                    </GoogleMap>

                    {loadingRoute && (
                        <Box sx={{ position: 'absolute', inset: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', bgcolor: 'rgba(255,255,255,0.5)' }}>
                            <CircularProgress />
                        </Box>
                    )}

                    {selectedLead && (
                        <Box
                            sx={{
                                position: 'absolute',
                                bottom: 16,
                                left: 16,
                                bgcolor: '#fff',
                                px: 2,
                                py: 1,
                                borderRadius: 2,
                                boxShadow: 3,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 2,
                            }}
                        >
                            <Stack direction="row" alignItems="center" spacing={1}>
                                <StraightenIcon color="primary" />
                                <Typography>{distanceText}</Typography>
                            </Stack>
                            <Stack direction="row" alignItems="center" spacing={1}>
                                <AccessTimeIcon color="secondary" />
                                <Typography>{durationText}</Typography>
                            </Stack>
                        </Box>
                    )}
                </Paper>
            </Grid>
        </Grid>
    );
}
