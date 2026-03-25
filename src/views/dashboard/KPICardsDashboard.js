import React, { useEffect, useState } from 'react'
import ScreenGate from './Default/ScreenGate'
import KPIBox from 'views/basicMaster/KPIBox'
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import TrendingUpOutlinedIcon from '@mui/icons-material/TrendingUpOutlined';
import EventOutlinedIcon from '@mui/icons-material/EventOutlined';
import TaskOutlinedIcon from '@mui/icons-material/TaskOutlined';
import CallOutlinedIcon from '@mui/icons-material/CallOutlined';
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import LoginIcon from '@mui/icons-material/Login';
import LogoutIcon from '@mui/icons-material/Logout';
import {
    Stack,
    Chip,
    Divider,
    Avatar,
    Button,
    Grid,
    Typography,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Box,
    Card,
    CardContent,
    TextField
} from '@mui/material';
import apiCalls from 'apicall';
import SectionCard from './Default/SectionCard';

const KPICardsDashboard = () => {
    const [orgId] = useState(localStorage.getItem('orgId'));
    const [branch] = useState(localStorage.getItem('branch'));
    const [branchCode] = useState(localStorage.getItem('branchcode'));
    const [finYear] = useState(localStorage.getItem('finYear'));
    const [employeeCode] = useState(localStorage.getItem('employeeCode'));
    const [employeeName] = useState(localStorage.getItem('employeeName'));
    // const [designation] = useState(localStorage.getItem('designation'));
    const designation = 'Software Developer'

    const [openTaskDialog, setOpenTaskDialog] = useState(false);
    const [checkInStatus, setCheckInStatus] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date());

    const [checkInTime, setCheckInTime] = useState(null);
    const [checkOutTime, setCheckOutTime] = useState(null);

    const [summaryCard, setSummaryCard] = useState({
        totalLeads: 0,
        totalOpportunites: 0,
        totalSalesorder: 0,
        totalCustomers: 0,
        totalQuotations: 0,
        percentage: 0,
    })
    const [todaystask, setTodaysTask] = useState([{
        venue: '',
        clientName: '',
        contactName: '',
        startTime: '',
        type: '',
        direction: '',
    }])

    useEffect(() => {
        getKPIDetails();
        getTodaysTask();
        checkExistingAttendance();
        getCheckInOutTimeDetails();

        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 60000);

        return () => clearInterval(timer);
    }, [])

    const checkExistingAttendance = async () => {
        try {
            const response = await apiCalls(
                'get',
                `/attendance/getTodayAttendance?branchCode=${branchCode}&orgId=${orgId}&userName=${employeeCode}`
            );

            if (response?.status === true && response?.paramObjectsMap?.attendance) {
                const attendance = response.paramObjectsMap.attendance;
                if (attendance.checkInTime) {
                    setCheckInStatus(true);
                    setCheckInTime(attendance.checkInTime);
                }
            }
        } catch (error) {
            console.error('Error checking attendance:', error);
        }
    };

    const getCheckInOutTimeDetails = async () => {
        try {
            const response = await apiCalls(
                'get',
                `/checkin/getCheckinDetailsByLatest?branchCode=${branchCode}&employeeCode=${employeeCode}&orgId=${orgId}`
            );

            if (response?.status && response?.paramObjectsMap?.checkInVO) {
                const data = response.paramObjectsMap.checkInVO;

                const formatTime = (time) => {
                    if (!time) return null;
                    const [h, m] = time.split(':');
                    const date = new Date();
                    date.setHours(h, m);
                    return date.toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true
                    });
                };

                if (data.checkType === 'IN') {
                    setCheckInStatus(true);
                    setCheckInTime(formatTime(data.checkInTime));
                }

                if (data.checkType === 'OUT') {
                    setCheckInStatus(false);

                    setCheckOutTime(formatTime(data.checkInTime));
                }
            }
        } catch (error) {
            console.log(error);
        }
    };

    const handleCheckIn = async () => {
        try {
            const payload = {
                branch,
                branchCode,
                checkType: 'IN',
                createdBy: employeeCode,
                employeeCode,
                employeeName,
                finYear,
                latitude: 0,
                longitude: 0,
                orgId
            };

            const response = await apiCalls(
                'post',
                '/checkin/createUpdateCheckInAndOut',
                payload
            );

            if (response?.status === true) {
                const time = new Date().toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true
                });

                setCheckInStatus(true);
                setCheckInTime(time);
                setCheckOutTime(null);
            }
        } catch (error) {
            console.error('Error checking in:', error);
        }
    };

    const handleCheckOut = async () => {
        try {
            const payload = {
                branch,
                branchCode,
                checkType: 'OUT',
                createdBy: employeeCode,
                employeeCode,
                employeeName,
                finYear,
                latitude: 0,
                longitude: 0,
                orgId
            };

            const response = await apiCalls(
                'post',
                '/checkin/createUpdateCheckInAndOut',
                payload
            );

            if (response?.status === true) {
                const time = new Date().toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true
                });

                setCheckInStatus(false);
                setCheckOutTime(time);
                setCheckInTime(null);
            }
        } catch (error) {
            console.error('Error checking out:', error);
        }
    };

    const getTodaysTask = async () => {
        try {
            const response = await apiCalls(
                'get',
                `/userdashboard/getFollowUpDetails?branchCode=${branchCode}&finYear=${finYear || 0}&orgId=${orgId}&userName=${employeeCode}`
            );

            if (
                response?.status === true &&
                Array.isArray(response?.paramObjectsMap?.clientInformation)
            ) {
                setTodaysTask(response.paramObjectsMap.clientInformation);
            } else {
                setTodaysTask([]);
            }
        } catch (error) {
            console.error('Error fetching today tasks:', error);
            setTodaysTask([]);
        }
    };

    const getTaskIcon = (type) => {
        switch (type) {
            case 'Call':
                return <CallOutlinedIcon color="primary" />;
            case 'Meeting':
                return <EventOutlinedIcon color="success" />;
            default:
                return <TaskOutlinedIcon color="action" />;
        }
    };

    const getKPIDetails = async () => {
        try {
            const response = await apiCalls('get', `/userdashboard/getDashboardDetailsBasedUserName?branchCode=${branchCode}&finYear=${finYear || 0}&orgId=${orgId}&userName=${employeeCode}`);
            if (response.status === true) {
                const quality = response.paramObjectsMap.clientInformation[0];
                setSummaryCard({
                    totalLeads: quality.totalLeads || 0,
                    totalOpportunites: quality.totalOpportunites || 0,
                    totalSalesorder: quality.totalSalesorder || 0,
                    totalCustomers: quality.totalCustomers || 0,
                    totalQuotations: quality.totalQuotations || 0,
                    percentage: quality.percentage || 0,
                });
            } else {
                setSummaryCard({
                    totalLeads: 0,
                    totalOpportunites: 0,
                    totalSalesorder: 0,
                    totalCustomers: 0,
                    totalQuotations: 0,
                    percentage: 0,
                });
            }
        } catch (error) {
            console.error('Error fetching leads:', error);
        }
    };

    return (
        <>
            <ScreenGate screen="KPIF">
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={6} md={3}>
                        <KPIBox
                            summaryData={{
                                label: 'Leads',
                                count: summaryCard.totalLeads,
                                color: '#2563eb',
                                icon: <GroupsOutlinedIcon fontSize="large" />,
                            }}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <KPIBox
                            summaryData={{
                                label: 'Opportunities',
                                count: summaryCard.totalOpportunites,
                                color: '#0ea5e9',
                                icon: <TrendingUpOutlinedIcon fontSize="large" />,
                            }}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <KPIBox
                            summaryData={{
                                label: 'Sales Orders',
                                count: summaryCard.totalSalesorder,
                                color: '#16a34a',
                                icon: <ShoppingCartOutlinedIcon fontSize="large" />,
                            }}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <KPIBox
                            summaryData={{
                                label: 'Customers',
                                count: summaryCard.totalCustomers,
                                color: '#6366f1',
                                icon: <PersonOutlinedIcon fontSize="large" />,
                            }}
                        />
                    </Grid>
                </Grid>
            </ScreenGate>

            <Grid container spacing={2} mt={2}>
                {/* Check-In/Check-Out Section - Left Side */}
                <Grid item xs={12} md={5}>
                    <Card
                        sx={{
                            borderRadius: '20px',
                            p: 3,
                            color: '#fff',
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',

                            // ✅ Premium gradient
                            background: 'linear-gradient(135deg, #2c5364, #203a43, #0f2027)',
                            // background: 'linear-gradient(135deg, #2c5364, #203a43, #0f2027)',

                            // ✅ Soft shadow + glow
                            boxShadow: '0 8px 30px rgba(0,0,0,0.25)',

                            // ✅ subtle border glow
                            border: '1px solid rgba(255,255,255,0.08)'
                        }}
                    >
                        {/* 🔹 TOP SECTION */}
                        <Stack direction="row" alignItems="center" justifyContent="space-between">

                            {/* 🔹 LEFT SIDE (Avatar + Details) */}
                            <Stack direction="row" spacing={2} alignItems="center">
                                <Avatar
                                    sx={{
                                        width: 64,
                                        height: 64,
                                        bgcolor: 'rgba(255,255,255,0.15)',
                                        backdropFilter: 'blur(6px)',
                                        border: '2px solid rgba(255,255,255,0.3)',
                                        fontWeight: 'bold',
                                        fontSize: 22
                                    }}
                                >
                                    {employeeName?.charAt(0)}
                                </Avatar>

                                <Box>
                                    <Typography fontWeight={700} fontSize={18}>
                                        {employeeName}
                                    </Typography>
                                    <Typography fontSize={14} sx={{ opacity: 0.75 }}>
                                        {employeeCode}
                                    </Typography>
                                </Box>
                            </Stack>

                            {/* 🔹 RIGHT SIDE (STATUS CHIP) */}
                            <Chip
                                icon={
                                    <Box
                                        sx={{
                                            width: 8,
                                            height: 8,
                                            borderRadius: '50%',
                                            bgcolor: checkInStatus ? '#22c55e' : '#f87171'
                                        }}
                                    />
                                }
                                label={checkInStatus ? 'Checked In' : 'Checked Out'}
                                size="small"
                                sx={{
                                    bgcolor: checkInStatus
                                        ? 'rgba(34,197,94,0.2)'
                                        : 'rgba(248,113,113,0.2)',
                                    color: checkInStatus ? '#22c55e' : '#f87171',
                                    fontWeight: 600,
                                    padding: 1
                                }}
                            />
                        </Stack>

                        {/* 🔹 BUTTONS */}
                        <Stack direction="row" spacing={2} mt={4}>
                            {/* CHECK-IN */}
                            <Button
                                fullWidth
                                onClick={handleCheckIn}
                                startIcon={<LoginIcon />}
                                disabled={checkInStatus}
                                sx={{
                                    bgcolor: 'rgba(255,255,255,0.9)',
                                    color: '#111827',
                                    borderRadius: '14px',
                                    px: 1,
                                    py: 1.5,
                                    textTransform: 'none',
                                    fontWeight: 600,

                                    // glass effect
                                    backdropFilter: 'blur(6px)',

                                    '&:hover': {
                                        bgcolor: '#ffffff'
                                    }
                                }}
                            >
                                {checkInTime ? `In at ${checkInTime}` : 'Check-In'}
                            </Button>

                            {/* CHECK-OUT */}
                            <Button
                                fullWidth
                                onClick={handleCheckOut}
                                disabled={!checkInStatus}
                                startIcon={<LogoutIcon />}
                                sx={{
                                    borderRadius: '14px',
                                    px: 1,
                                    py: 1.5,
                                    textTransform: 'none',
                                    fontWeight: 600,

                                    // 🔥 gradient red button
                                    background: 'linear-gradient(135deg, #ff4d4f, #d9363e)',
                                    color: '#fff',

                                    boxShadow: '0 6px 18px rgba(255,77,79,0.4)',

                                    '&:hover': {
                                        background: 'linear-gradient(135deg, #e53935, #b71c1c)'
                                    }
                                }}
                            >
                                {checkOutTime ? `Out at ${checkOutTime}` : 'Check-Out'}
                            </Button>
                        </Stack>
                    </Card>
                </Grid>

                {/* Lead Journey Overview - Right Side with Reduced Width */}
                <Grid item xs={12} md={7}>
                    <Card
                        sx={{
                            borderRadius: 4,
                            p: 2,
                            background: '#fff',
                            boxShadow: '0 10px 25px rgba(0,0,0,0.08)',
                            height: '100%'
                        }}
                    >
                        <Stack spacing={2}>
                            <Typography fontWeight={700} fontSize={16}>
                                Lead Journey
                            </Typography>

                            <Stack direction="row" justifyContent="space-between">
                                {[
                                    { label: 'Leads', value: summaryCard.totalLeads },
                                    { label: 'Opportunities', value: summaryCard.totalOpportunites },
                                    { label: 'Quotes', value: summaryCard.totalQuotations },
                                    { label: 'Orders', value: summaryCard.totalSalesorder }
                                ].map((item, index) => (
                                    <Stack key={index} alignItems="center" flex={1}>
                                        <Box
                                            sx={{
                                                bgcolor: item.value > 0 ? '#22c55e' : '#e5e7eb',
                                                color: item.value > 0 ? '#fff' : '#64748b',
                                                px: 1.5,
                                                py: 0.5,
                                                borderRadius: 2,
                                                fontWeight: 700,
                                                fontSize: 13
                                            }}
                                        >
                                            {item.value}
                                        </Box>

                                        <Typography fontSize={12} mt={1}>
                                            {item.label}
                                        </Typography>
                                    </Stack>
                                ))}
                            </Stack>

                            <Box
                                sx={{
                                    p: 1,
                                    borderRadius: 2,
                                    bgcolor: '#f0fdf4',
                                    border: '1px solid #bbf7d0'
                                }}
                            >
                                <Typography fontSize={13} color="text.secondary">
                                    Conversion Rate
                                </Typography>
                                <Typography fontWeight={700} fontSize={18} color="success.main">
                                    {summaryCard.percentage}%
                                </Typography>
                            </Box>
                        </Stack>
                    </Card>
                </Grid>
            </Grid>

            <Dialog
                open={openTaskDialog}
                onClose={() => setOpenTaskDialog(false)}
                fullWidth
                maxWidth="sm"
            >
                <DialogTitle>
                    Today’s Focus
                </DialogTitle>

                <DialogContent dividers>
                    <Stack spacing={2}>
                        {todaystask.map((task, index) => (
                            <Stack key={index} spacing={1}>
                                <Stack direction="row" spacing={2} alignItems="center">
                                    <Avatar sx={{ bgcolor: '#e3f2fd' }}>
                                        {getTaskIcon(task.type)}
                                    </Avatar>
                                    <Stack flex={1}>
                                        <Typography fontWeight={600}>
                                            Follow up with {task.clientName}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            {task.startTime} · {task.type}
                                            {task.direction ? ` · ${task.direction}` : ''}
                                        </Typography>
                                    </Stack>
                                    <Chip label="Pending" color="warning" size="small" />
                                </Stack>
                                {index < todaystask.length - 1 && <Divider />}
                            </Stack>
                        ))}
                    </Stack>
                </DialogContent>

                <DialogActions>
                    <Button onClick={() => setOpenTaskDialog(false)}>
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    )
}

export default KPICardsDashboard