import React, { useEffect, useState } from 'react'
import ScreenGate from './Default/ScreenGate'
import KPIBox from 'views/basicMaster/KPIBox'
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import TrendingUpOutlinedIcon from '@mui/icons-material/TrendingUpOutlined';
import ArrowForwardIosOutlinedIcon from '@mui/icons-material/ArrowForwardIosOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import EventOutlinedIcon from '@mui/icons-material/EventOutlined';
import TaskOutlinedIcon from '@mui/icons-material/TaskOutlined';
import CallOutlinedIcon from '@mui/icons-material/CallOutlined';
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
} from '@mui/material';
import apiCalls from 'apicall';
import SectionCard from './Default/SectionCard';
const KPICardsDashboard = () => {
    const [orgId] = useState(localStorage.getItem('orgId'));
    const [branch] = useState(localStorage.getItem('branch'));
    const [branchCode] = useState(localStorage.getItem('branchcode'));
    const [finYear] = useState(localStorage.getItem('finYear'));
    const [employeeCode] = useState(localStorage.getItem('employeeCode'));

    const [openTaskDialog, setOpenTaskDialog] = useState(false);

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
    }, [])
    const getTodaysTask = async () => {
        try {
            const response = await apiCalls(
                'get',
                `/userdashboard/getFollowUpDetails?branchCode=${branchCode}&finYear=${finYear}&orgId=${orgId}&userName=${employeeCode}`
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
            const response = await apiCalls('get', `/userdashboard/getDashboardDetailsBasedUserName?branchCode=${branchCode}&finYear=${finYear}&orgId=${orgId}&userName=${employeeCode}`);
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

            // setIsLoading(false);
        } catch (error) {
            console.error('Error fetching leads:', error);
            // setIsLoading(false);
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
                <ScreenGate screen="KPIF">
                    <Grid item xs={12} md={8}>
                        <SectionCard title="Lead to Order Conversion">
                            <Stack spacing={3}>
                                {/* Pipeline Flow with Numbers */}
                                <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
                                    <Stack alignItems="center">
                                        <Typography variant="h6">{`${summaryCard.totalLeads}`}</Typography>
                                        <Chip label="Leads" color="primary" />
                                    </Stack>
                                    <ArrowForwardIosOutlinedIcon fontSize="small" />

                                    <Stack alignItems="center">
                                        <Typography variant="h6">{`${summaryCard.totalOpportunites}`}</Typography>
                                        <Chip label="Opportunities" color="info" />
                                    </Stack>
                                    <ArrowForwardIosOutlinedIcon fontSize="small" />
                                    <Stack alignItems="center">
                                        <Typography variant="h6"><Typography variant="h6">{`${summaryCard.totalQuotations}`}</Typography></Typography>
                                        <Chip label="Quotations" color="warning" />
                                    </Stack>
                                    <ArrowForwardIosOutlinedIcon fontSize="small" />
                                    <Stack alignItems="center">
                                        <Typography variant="h6"><Typography variant="h6">{`${summaryCard.totalSalesorder}`}</Typography></Typography>
                                        <Chip label="Sales Orders" color="success" />
                                    </Stack>
                                </Stack>
                                {/* Conversion Summary */}
                                <Stack
                                    direction="row"
                                    spacing={2}
                                    alignItems="center"
                                    sx={{
                                        bgcolor: '#f1f5f9',
                                        p: 2,
                                        borderRadius: 2
                                    }}
                                >
                                    <InfoOutlinedIcon color="primary" />
                                    <Typography fontWeight={600}>
                                        Conversion Rate:
                                    </Typography>
                                    <Typography fontWeight={700} color="success.main">
                                        <Typography variant="h6">{`${summaryCard.percentage}%`}</Typography>
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        (Leads to Sales Orders)
                                    </Typography>
                                </Stack>
                            </Stack>
                        </SectionCard>
                    </Grid>
                </ScreenGate>
                {/* TODAY'S TASKS */}
                <ScreenGate screen="KPIF">
                    <Grid item xs={12} md={4}>
                        <SectionCard
                            title={
                                <Stack direction="row" justifyContent="space-between" alignItems="center">
                                    <Typography fontWeight={600}>
                                        Today’s Focus
                                    </Typography>

                                    <Chip
                                        label={todaystask.length}
                                        size="small"
                                        color="primary"
                                    />
                                </Stack>
                            }
                        >
                            <Stack spacing={2}>
                                {todaystask.length > 0 ? (
                                    todaystask.slice(0, 1).map((task, index) => (
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

                                                <Chip
                                                    label="Pending"
                                                    color="warning"
                                                    size="small"
                                                />

                                            </Stack>

                                            {index < todaystask.length - 1 && <Divider />}
                                        </Stack>
                                    ))
                                ) : (
                                    <Typography
                                        variant="caption"
                                        color="text.secondary"
                                        align="center"
                                    >
                                        No follow-ups scheduled for today 🎉
                                    </Typography>
                                )}

                                {/* Footer */}
                                <Button
                                    variant="text"
                                    size="small"
                                    sx={{ alignSelf: 'flex-end', mt: 1 }}
                                    onClick={() => setOpenTaskDialog(true)}
                                >
                                    View All Tasks
                                </Button>

                            </Stack>
                        </SectionCard>
                    </Grid>
                </ScreenGate>
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