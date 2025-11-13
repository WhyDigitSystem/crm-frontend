import React, { useEffect, useState, useRef } from 'react';
import {
    Box,
    Typography,
    Button,
    Avatar,
    Stack,
    Card,
    CardContent,
    CircularProgress,
    Chip,
    Divider,
} from '@mui/material';
import { motion } from 'framer-motion';
import PlayCircleFilledWhiteIcon from '@mui/icons-material/PlayCircleFilledWhite';
import StopCircleIcon from '@mui/icons-material/StopCircle';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import NightsStayIcon from '@mui/icons-material/NightsStay';
import { showToast } from 'utils/toast-component';
import apiCalls from 'apicall';
import { getDistanceInMeters } from 'utils/GetDistanceInMeters';

const CheckInOut = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [checkedIn, setCheckedIn] = useState(false);
    const [listViewData, setListViewData] = useState({});
    const [time, setTime] = useState('');
    const [date, setDate] = useState('');
    const [greeting, setGreeting] = useState('');
    const [locationData, setLocationData] = useState({
        lat: null,
        lng: null,
        address: '',
    });

    const orgId = localStorage.getItem('orgId');
    const employeeCode = localStorage.getItem('employeeCode');
    const finYear = localStorage.getItem('finYear');
    const branch = localStorage.getItem('branch');
    const employeeName = localStorage.getItem('employeeName');
    const branchCode = localStorage.getItem('branchcode');

    // 🕒 Live Time & Greeting
    useEffect(() => {
        const timer = setInterval(() => {
            const now = new Date();
            setTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
            setDate(now.toLocaleDateString([], { day: '2-digit', month: 'short', year: 'numeric' }));

            const hour = now.getHours();
            if (hour < 12) setGreeting('🌅 Good Morning');
            else if (hour < 18) setGreeting('☀️ Good Afternoon');
            else setGreeting('🌙 Good Evening');
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        if (branchCode && employeeCode && orgId) {
            getEmployeeDetail();
            getLocation();
            getCheckInOutStatus();
        }
    }, [branchCode, employeeCode, orgId]);

    // ✅ Get Current Location with Fallback & Toast
    const getLocation = () =>
        new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                showToast('error', '❌ Geolocation is not supported on this device.');
                reject('Geolocation not supported');
                return;
            }

            // Security check for HTTPS
            if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
                showToast('error', '⚠️ Location access requires a secure (HTTPS) connection.');
                reject('Insecure origin');
                return;
            }

            navigator.geolocation.getCurrentPosition(
                async (pos) => {
                    const coords = {
                        lat: pos.coords.latitude,
                        lng: pos.coords.longitude,
                    };

                    try {
                        const res = await fetch(
                            `https://nominatim.openstreetmap.org/reverse?lat=${coords.lat}&lon=${coords.lng}&format=json`
                        );
                        const data = await res.json();

                        const shortAddress = data?.address
                            ? `${data.address.suburb || data.address.village || ''}, ${data.address.city || data.address.state || ''
                            }`
                            : 'Location unavailable';

                        // ✅ Update React state
                        setLocationData({
                            lat: coords.lat,
                            lng: coords.lng,
                            address: shortAddress,
                        });

                        // ✅ Return complete location info
                        resolve({
                            lat: coords.lat,
                            lng: coords.lng,
                            address: shortAddress,
                        });
                    } catch (err) {
                        setLocationData({
                            lat: coords.lat,
                            lng: coords.lng,
                            address: 'Unable to fetch location',
                        });

                        showToast('warning', '⚠️ Unable to fetch location name.');
                        resolve({
                            lat: coords.lat,
                            lng: coords.lng,
                            address: 'Unable to fetch location',
                        });
                    }
                },
                (err) => {
                    console.error('Location error:', err);
                    if (err.code === 1) {
                        showToast('error', '❌ Location permission denied.');
                    } else if (err.code === 2) {
                        showToast('error', '❌ Position unavailable.');
                    } else if (err.code === 3) {
                        showToast('error', '⏳ Location request timed out.');
                    } else {
                        showToast('error', '⚠️ Unknown location error.');
                    }
                    reject(err.message);
                },
                { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
            );
        });

    const getEmployeeDetail = async () => {
        try {
            setIsLoading(true);
            const response = await apiCalls(
                'get',
                `/master/getEmployeeDetails?branchCode=${branchCode}&employeeCode=${employeeCode}&orgId=${orgId}`
            );
            if (response.status === true) {
                setListViewData(response.paramObjectsMap.employeeVO);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const [lastCoords, setLastCoords] = useState(null);
    const workerRef = useRef(null);

    // 🛰️ Background Live Tracking When Checked In
    useEffect(() => {
        if (checkedIn) {
            workerRef.current = new Worker('/locationWorker.js');
            workerRef.current.postMessage({ command: 'start' });
            workerRef.current.onmessage = async (event) => {
                const { type, coords } = event.data;

                if (type === 'location' && coords) {
                    if (!lastCoords) {
                        setLastCoords(coords);
                        return;
                    }

                    const distance = getDistanceInMeters(
                        lastCoords.latitude,
                        lastCoords.longitude,
                        coords.latitude,
                        coords.longitude
                    );

                    if (distance > 5) {
                        try {
                            await apiCalls('post', '/checkin/createUpdateLiveLocationCapture', {
                                branch,
                                branchCode,
                                checkType: 'IN',
                                createdBy: employeeCode,
                                employeeCode,
                                employeeName,
                                finYear,
                                latitude: coords.latitude,
                                longitude: coords.longitude,
                                orgId: parseInt(orgId),
                                // lastUpdatedAt: new Date().toISOString(),
                            });
                            setLastCoords(coords);
                        } catch (err) {
                            console.warn('Live update failed', err);
                        }
                    }
                }
            };
        }

        return () => {
            if (workerRef.current) {
                workerRef.current.postMessage({ command: 'stop' });
                workerRef.current.terminate();
                workerRef.current = null;
            }
        };
    }, [checkedIn, lastCoords]);

    const getCheckInOutStatus = async () => {
        try {
            setIsLoading(true);
            const response = await apiCalls(
                'get',
                `/checkin/getCheckinDetailsByLatest?branchCode=${branchCode}&employeeCode=${employeeCode}&orgId=${orgId}`
            );
            if (response.status === true) {
                const checkInOut = response.paramObjectsMap.checkInVO;
                setCheckedIn(checkInOut?.checkType === 'IN');
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // ✅ Handle Check-In / Check-Out
    const handleAction = async (type) => {
        setIsLoading(true);
        try {
            const currentLocation = await getLocation(); 
            console.log("Location",currentLocation);
            const payload = {
                branch,
                branchCode,
                checkType: type,
                createdBy: employeeCode,
                employeeCode,
                employeeName,
                finYear,
                latitude: currentLocation.lat,
                longitude: currentLocation.lng,
                orgId: parseInt(orgId),
            };

            const result = await apiCalls('post', '/checkin/createUpdateCheckInAndOut', payload);

            if (result.status === true) {
                showToast(
                    'success',
                    type === 'IN'
                        ? '✅ You have checked in successfully!'
                        : '🕒 You have checked out successfully!'
                );

                setLocationData(currentLocation);
                setCheckedIn(type === 'IN');
            } else {
                showToast('error', 'Failed to update status.');
            }
        } catch (err) {
            console.error(err);
            showToast('error', 'Unable to record location.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Box
            sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'flex-start',
                mt: 1,
                width: '100%',
            }}
        >
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
            >
                <Card
                    sx={{
                        width: '100%',
                        maxWidth: 450,
                        borderRadius: 2,
                        background: checkedIn
                            ? 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)'
                            : 'linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%)',
                        border: '1px solid rgba(0,0,0,0.05)',
                        boxShadow: '0 8px 20px rgba(0,0,0,0.08)',
                        transition: 'all 0.3s ease-in-out',
                        '&:hover': {
                            transform: 'translateY(-4px)',
                            boxShadow: '0 10px 25px rgba(0,0,0,0.12)',
                        },
                    }}
                >
                    <CardContent sx={{ textAlign: 'center', p: 1 }}>
                        <Avatar
                            src={`data:image/jpeg;base64,${listViewData?.passportphoto}`}
                            alt={employeeName}
                            sx={{
                                width: 85,
                                height: 85,
                                mx: 'auto',
                                border: '3px solid #2563eb',
                                boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                            }}
                        />
                        <Typography variant="h6" sx={{ mt: 2, fontWeight: 700, color: '#1e293b' }}>
                            {employeeName || '-'}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#64748b', mb: 1 }}>
                            {employeeCode || '-'}
                        </Typography>

                        <Chip
                            icon={checkedIn ? <WbSunnyIcon /> : <NightsStayIcon />}
                            label={checkedIn ? 'Checked In' : 'Not Checked In'}
                            color={checkedIn ? 'success' : 'warning'}
                            size="small"
                            sx={{ mb: 2, fontWeight: 600 }}
                        />

                        <Divider sx={{ mb: 2 }} />

                        <Stack direction="column" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                            <Stack direction="row" spacing={1} alignItems="center">
                                <AccessTimeIcon sx={{ color: '#2563eb', fontSize: 20 }} />
                                <Typography variant="body2" fontWeight={600}>
                                    {time}
                                </Typography>
                            </Stack>
                            <Typography variant="body2" sx={{ color: '#64748b' }}>
                                {date}
                            </Typography>
                            <Typography variant="subtitle2" sx={{ mt: 1, color: '#2563eb', fontWeight: 600 }}>
                                {greeting}
                            </Typography>
                            {locationData.address && (
                                <Stack direction="row" spacing={1} alignItems="center" justifyContent="center">
                                    <MyLocationIcon sx={{ color: '#059669', fontSize: 18 }} />
                                    <Typography
                                        variant="caption"
                                        color="text.secondary"
                                        sx={{
                                            maxWidth: 280,
                                            textAlign: 'center',
                                            lineHeight: 1.3,
                                        }}
                                    >
                                        {locationData.address}
                                    </Typography>
                                </Stack>
                            )}
                        </Stack>

                        <Stack direction="row" spacing={2} justifyContent="center">
                            <Button
                                variant="contained"
                                startIcon={<PlayCircleFilledWhiteIcon />}
                                disabled={checkedIn || isLoading}
                                onClick={() => handleAction('IN')}
                                sx={{
                                    backgroundColor: '#22c55e',
                                    color: '#fff',
                                    fontWeight: 600,
                                    borderRadius: 2,
                                    textTransform: 'none',
                                    px: 3,
                                    '&:hover': {
                                        backgroundColor: '#16a34a',
                                        transform: 'scale(1.04)',
                                    },
                                }}
                            >
                                {isLoading && !checkedIn ? (
                                    <CircularProgress size={20} color="inherit" />
                                ) : (
                                    'Start'
                                )}
                            </Button>

                            <Button
                                variant="contained"
                                startIcon={<StopCircleIcon />}
                                disabled={!checkedIn || isLoading}
                                onClick={() => handleAction('OUT')}
                                sx={{
                                    backgroundColor: '#ef4444',
                                    color: '#fff',
                                    fontWeight: 600,
                                    borderRadius: 2,
                                    textTransform: 'none',
                                    px: 3,
                                    '&:hover': {
                                        backgroundColor: '#dc2626',
                                        transform: 'scale(1.04)',
                                    },
                                }}
                            >
                                {isLoading && checkedIn ? (
                                    <CircularProgress size={20} color="inherit" />
                                ) : (
                                    'End'
                                )}
                            </Button>
                        </Stack>
                    </CardContent>
                </Card>
            </motion.div>
        </Box>
    );
};

export default CheckInOut;
