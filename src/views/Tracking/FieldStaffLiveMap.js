import React, { useEffect, useState, useRef } from 'react';
import { GoogleMap, Marker, InfoWindow } from '@react-google-maps/api';
import {
    Box,
    Grid,
    Paper,
    Typography,
    TextField,
    CircularProgress
} from '@mui/material';
import PhoneIphoneIcon from '@mui/icons-material/PhoneIphone';
import PersonIcon from '@mui/icons-material/Person';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import WorkIcon from '@mui/icons-material/Work';
import GroupsIcon from '@mui/icons-material/Groups';
import apiCalls from 'apicall';
import FullScreenLoader from 'utils/FullScreenLoader';
import { showToast } from 'utils/toast-component';
import { useGoogleMapLoader } from 'utils/googleMapLoader';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

const containerStyle = { width: '100%', height: '80vh' };
const defaultCenter = { lat: 20.5937, lng: 78.9629 }; // India

const FieldStaffLiveMap = () => {
    const [employeeData, setEmployeeData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [searchText, setSearchText] = useState('');
    const [loading, setLoading] = useState(false);

    const branchCode = localStorage.getItem('branchcode');
    const orgId = localStorage.getItem('orgId');
    const mapRef = useRef(null);
    const { isLoaded } = useGoogleMapLoader();
    const stompClientRef = useRef(null);

    // ✅ Initial Fetch + WebSocket Setup
    useEffect(() => {
        getAllActiveEmpLocation();
        setupWebSocket();

        return () => {
            if (stompClientRef.current) {
                stompClientRef.current.deactivate();
            }
        };
    }, []);

    // 🧭 Fetch Initial Data
    const getAllActiveEmpLocation = async () => {
        setLoading(true);
        try {
            const response = await apiCalls(
                'get',
                `/checkin/getAllEmployeeLiveLocation?branchCode=${branchCode}&orgId=${orgId}`
            );

            if (response.status === true && response.paramObjectsMap.liveLocationDetails?.length) {
                setEmployeeData(response.paramObjectsMap.liveLocationDetails);
                setFilteredData(response.paramObjectsMap.liveLocationDetails);
            } else {
                setEmployeeData([]);
                setFilteredData([]);
            }
        } catch (error) {
            console.error('Error fetching employee locations:', error);
            showToast('error', 'Failed to fetch employee locations.');
        } finally {
            setLoading(false);
        }
    };

    // ⚡ WebSocket Real-Time Updates
    const setupWebSocket = () => {
        try {
            const socketUrl = 'http://localhost:9001/ws-location'; // Spring Boot WebSocket endpoint
            const stompClient = new Client({
                webSocketFactory: () => new SockJS(socketUrl),
                reconnectDelay: 5000,
                debug: (str) => console.log('STOMP:', str),
            });

            stompClient.onConnect = () => {
                console.log('🟢 Connected to WebSocket');
                stompClient.subscribe('/topic/liveLocation', (message) => {
                    const data = JSON.parse(message.body);
                    console.log('📍 Live update:', data);

                    setEmployeeData((prev) => {
                        const exists = prev.some((emp) => emp.employeeCode === data.employeeCode);
                        if (exists) {
                            return prev.map((emp) =>
                                emp.employeeCode === data.employeeCode ? { ...emp, ...data } : emp
                            );
                        } else {
                            return [...prev, data];
                        }
                    });
                });
            };

            stompClient.onWebSocketError = (err) => {
                console.error('WebSocket error:', err);
            };

            stompClient.activate();
            stompClientRef.current = stompClient;
        } catch (err) {
            console.error('Error setting up WebSocket:', err);
        }
    };

    // 🔍 Search Filter
    useEffect(() => {
        let data = [...employeeData];
        if (searchText) {
            data = data.filter((emp) =>
                [emp.employeeName, emp.employeeCode, emp.reportingPerson, emp.designation, emp.department]
                    .some((f) => f?.toLowerCase().includes(searchText.toLowerCase()))
            );
        }
        setFilteredData(data);
    }, [searchText, employeeData]);

    // 🗺️ Fit map to all markers
    useEffect(() => {
        if (mapRef.current && filteredData.length > 0 && window.google) {
            const bounds = new window.google.maps.LatLngBounds();
            filteredData.forEach((emp) => {
                if (emp.latitude && emp.longitude) {
                    bounds.extend({
                        lat: parseFloat(emp.latitude),
                        lng: parseFloat(emp.longitude),
                    });
                }
            });
            mapRef.current.fitBounds(bounds);
        } else if (mapRef.current) {
            mapRef.current.setCenter(defaultCenter);
            mapRef.current.setZoom(5);
        }
    }, [filteredData]);

    const handleCardHover = (emp) => {
        if (mapRef.current && emp.latitude && emp.longitude) {
            mapRef.current.panTo({
                lat: parseFloat(emp.latitude),
                lng: parseFloat(emp.longitude),
            });
            mapRef.current.setZoom(9);
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
                        <TextField
                            fullWidth
                            size="small"
                            placeholder="Search employee name, code, or dept..."
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            sx={{ mb: 2 }}
                        />

                        <Typography variant="h6" sx={{ mb: 2 }}>
                            Active Field Staff ({filteredData.length})
                        </Typography>

                        {filteredData.map((emp, i) => (
                            <Paper
                                key={i}
                                onMouseEnter={() => handleCardHover(emp)}
                                onClick={() => setSelectedEmployee(emp)}
                                elevation={selectedEmployee?.employeeCode === emp.employeeCode ? 4 : 1}
                                sx={{
                                    p: 2,
                                    mb: 1.5,
                                    borderRadius: 3,
                                    cursor: 'pointer',
                                    border:
                                        selectedEmployee?.employeeCode === emp.employeeCode
                                            ? '1.5px solid #2563eb'
                                            : '1px solid #e2e8f0',
                                    transition: 'all 0.3s ease',
                                    bgcolor:
                                        selectedEmployee?.employeeCode === emp.employeeCode
                                            ? '#eff6ff'
                                            : '#fff',
                                    '&:hover': {
                                        boxShadow: '0 4px 14px rgba(0,0,0,0.08)',
                                        transform: 'translateY(-2px)',
                                    },
                                }}
                            >
                                <Typography
                                    variant="subtitle1"
                                    sx={{
                                        fontWeight: 700,
                                        color:
                                            selectedEmployee?.employeeCode === emp.employeeCode
                                                ? '#1d4ed8'
                                                : '#1e293b',
                                        mb: 0.5,
                                    }}
                                >
                                    {emp.employeeName || '—'}
                                </Typography>

                                <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                                    <PersonIcon sx={{ fontSize: 17, color: '#475569', mr: 1 }} />
                                    <Typography variant="body2" sx={{ color: '#334155' }}>
                                        {emp.designation || '—'}
                                    </Typography>
                                </Box>

                                <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                                    <GroupsIcon sx={{ fontSize: 17, color: '#475569', mr: 1 }} />
                                    <Typography variant="body2" sx={{ color: '#334155' }}>
                                        {emp.department || '—'}
                                    </Typography>
                                </Box>

                                <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                                    <PhoneIphoneIcon sx={{ fontSize: 17, color: '#475569', mr: 1 }} />
                                    <Typography variant="body2" sx={{ color: '#334155' }}>
                                        {emp.mobilenumber || '—'}
                                    </Typography>
                                </Box>

                                <Box sx={{ display: 'flex', alignItems: 'flex-start', mt: 0.5 }}>
                                    <LocationOnIcon sx={{ fontSize: 17, color: '#64748b', mr: 1 }} />
                                    <Typography variant="body2" sx={{ color: '#475569', lineHeight: 1.4 }}>
                                        Last updated: {emp.createdon || '—'}
                                    </Typography>
                                </Box>
                            </Paper>
                        ))}
                    </Paper>
                </Grid>

                {/* 🗺️ Map */}
                <Grid item xs={12} md={9}>
                    <Paper sx={{ height: '80vh', borderRadius: 2, overflow: 'hidden', position: 'relative' }}>
                        {!isLoaded ? (
                            <CircularProgress sx={{ position: 'absolute', top: '50%', left: '50%' }} />
                        ) : (
                            <GoogleMap
                                mapContainerStyle={containerStyle}
                                onLoad={(map) => {
                                    mapRef.current = map;
                                    map.setCenter(defaultCenter);
                                    map.setZoom(5);
                                }}
                            >
                                {filteredData.map((emp, i) => (
                                    <Marker
                                        key={i}
                                        position={{
                                            lat: parseFloat(emp.latitude) || 0,
                                            lng: parseFloat(emp.longitude) || 0,
                                        }}
                                        icon={{
                                            url: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png',
                                        }}
                                        onClick={() => setSelectedEmployee(emp)}
                                    />
                                ))}

                                {selectedEmployee && (
                                    <InfoWindow
                                        position={{
                                            lat: parseFloat(selectedEmployee.latitude) || 0,
                                            lng: parseFloat(selectedEmployee.longitude) || 0,
                                        }}
                                        onCloseClick={() => setSelectedEmployee(null)}
                                    >
                                        <Box sx={{ p: 1, minWidth: 220 }}>
                                            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1e293b' }}>
                                                {selectedEmployee.employeeName}
                                            </Typography>
                                            <Typography variant="body2" sx={{ color: '#475569' }}>
                                                <WorkIcon sx={{ fontSize: 14, mr: 0.5 }} />
                                                {selectedEmployee.designation || '-'}
                                            </Typography>
                                            <Typography variant="body2" sx={{ color: '#475569' }}>
                                                <GroupsIcon sx={{ fontSize: 14, mr: 0.5 }} />
                                                {selectedEmployee.department || '-'}
                                            </Typography>
                                            <Typography variant="body2" sx={{ color: '#475569' }}>
                                                <PersonIcon sx={{ fontSize: 14, mr: 0.5 }} />
                                                Reports to: {selectedEmployee.reportingPerson || '-'}
                                            </Typography>
                                            <Typography variant="body2" sx={{ color: '#475569' }}>
                                                <PhoneIphoneIcon sx={{ fontSize: 14, mr: 0.5 }} />
                                                {selectedEmployee.mobilenumber || '-'}
                                            </Typography>
                                            <Typography variant="caption" sx={{ color: '#64748b' }}>
                                                Updated: {selectedEmployee.createdon || '-'}
                                            </Typography>
                                        </Box>
                                    </InfoWindow>
                                )}
                            </GoogleMap>
                        )}
                    </Paper>
                </Grid>
            </Grid>
        </>
    );
};

export default FieldStaffLiveMap;
