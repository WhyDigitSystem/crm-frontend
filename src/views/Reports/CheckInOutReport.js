import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    Box,
    Paper,
    Grid,
    TextField,
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
    Chip,
    InputAdornment,
    CircularProgress,
    Alert,
    Card,
    CardContent,
    Container,
    alpha,
    styled,
} from '@mui/material';
import {
    Search as SearchIcon,
    Refresh as RefreshIcon,
    Download as DownloadIcon,
    AccessTime as AccessTimeIcon,
    CalendarToday as CalendarIcon,
    Work as WorkIcon,
    CheckCircle as CheckCircleIcon,
    Warning as WarningIcon,
    Error as ErrorIcon,
} from '@mui/icons-material';
import { Stack } from '@mui/system';
import apiCalls from 'apicall';

const StatsCard = styled(Card)(({ theme }) => ({
    borderRadius: '12px',
    transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
    '&:hover': {
        transform: 'translateY(-3px)',
        boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
    },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
    '&:nth-of-type(odd)': {
        backgroundColor: theme.palette.action.hover,
    },
    '&:hover': {
        backgroundColor: alpha(theme.palette.primary.main, 0.04),
    },
}));

const StatusChip = styled(Chip)(({ theme, status }) => ({
    fontWeight: 600,
    borderRadius: '10px',
    fontSize: '0.75rem',
    ...(status === 'present' && {
        backgroundColor: alpha(theme.palette.success.main, 0.1),
        color: theme.palette.success.main,
        borderColor: theme.palette.success.main,
    }),
    ...(status === 'late' && {
        backgroundColor: alpha(theme.palette.warning.main, 0.1),
        color: theme.palette.warning.main,
        borderColor: theme.palette.warning.main,
    }),
    ...(status === 'absent' && {
        backgroundColor: alpha(theme.palette.error.main, 0.1),
        color: theme.palette.error.main,
        borderColor: theme.palette.error.main,
    }),
    ...(status === 'weekend' && {
        backgroundColor: alpha(theme.palette.grey[500], 0.1),
        color: theme.palette.grey[600],
        borderColor: theme.palette.grey[400],
    }),
}));

// Mock authentication service
const getCurrentLoggedInUser = () => {
    return {
        id: 'EMP001',
        name: 'John Doe',
        email: 'john.doe@company.com',
        department: 'Engineering',
        role: 'Software Engineer',
        avatar: 'JD',
    };
};

const CheckInOutReport = () => {
    const currentUser = getCurrentLoggedInUser();
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    // State variables
    const [orgId] = useState(localStorage.getItem('orgId'));
    const [branch] = useState(localStorage.getItem('branch'));
    const [branchCode] = useState(localStorage.getItem('branchcode'));
    const [employeeCode] = useState(localStorage.getItem('employeeCode'));
    const [selectedMonth, setSelectedMonth] = useState(currentMonth);
    const [selectedYear, setSelectedYear] = useState(currentYear);
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [reportData, setReportData] = useState([]);
    const [monthlyStats, setMonthlyStats] = useState({
        totalDays: 0,
        presentDays: 0,
        lateDays: 0,
        absentDays: 0,
        totalWorkingHours: 0,
        attendancePercentage: 0,
    });
    const [initialLoad, setInitialLoad] = useState(true);

    const years = useMemo(
        () => Array.from({ length: 11 }, (_, i) => currentYear - 5 + i),
        [currentYear]
    );

    const months = useMemo(
        () => [
            { value: 0, label: 'January' },
            { value: 1, label: 'February' },
            { value: 2, label: 'March' },
            { value: 3, label: 'April' },
            { value: 4, label: 'May' },
            { value: 5, label: 'June' },
            { value: 6, label: 'July' },
            { value: 7, label: 'August' },
            { value: 8, label: 'September' },
            { value: 9, label: 'October' },
            { value: 10, label: 'November' },
            { value: 11, label: 'December' }
        ],
        []
    );

    const filteredData = useMemo(() => {
        if (!searchTerm.trim()) return reportData;

        return reportData.filter(item =>
            item.date.includes(searchTerm) ||
            item.day.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [searchTerm, reportData]);

    const totalPages = useMemo(
        () => Math.ceil(filteredData.length / rowsPerPage),
        [filteredData, rowsPerPage]
    );

    useEffect(() => {
        setPage(0);
    }, [searchTerm]);

    const handlePrev = useCallback(() => {
        setPage((prev) => (prev > 0 ? prev - 1 : prev));
    }, []);

    const handleNext = useCallback(() => {
        setPage((prev) => (prev < totalPages - 1 ? prev + 1 : prev));
    }, [totalPages]);

    const formatDate = (dateStr) => {
        if (!dateStr) return '';

        const date = new Date(dateStr);

        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();

        return `${day}-${month}-${year}`;
    };

    const getVisiblePages = useCallback(() => {
        const maxVisible = 3;

        let start = Math.max(0, page - 1);
        let end = start + maxVisible;

        if (end > totalPages) {
            end = totalPages;
            start = Math.max(0, end - maxVisible);
        }

        return Array.from({ length: end - start }, (_, i) => start + i);
    }, [page, totalPages]);

    const fetchEmployeeCheckInOutData = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await apiCalls(
                'get',
                `checkin/getEmployeeCheckInAndCheckOutDetails?branchCode=${branchCode}&empCode=${employeeCode}&month=${selectedMonth + 1}&orgId=${orgId}&year=${selectedYear}`
            );

            const apiData = response?.paramObjectsMap?.mapp || [];

            const formattedData = apiData.map((item, index) => {
                const workingHours = parseFloat(item.grossHours || 0);

                return {
                    id: index,
                    employeeName: item.employeeName,
                    date: formatDate(item.checkInDate),
                    day: new Date(item.checkInDate).toLocaleDateString('en-IN', { weekday: 'long' }),
                    checkIn: item.inTime || '--:--',
                    checkOut: item.outTime || '--:--',
                    workingHours: item.grossHours || '0',
                    status: getStatus(item.inTime, item.outTime, workingHours)
                };
            });

            setReportData(formattedData);

        } catch (err) {
            setError('Failed to fetch attendance data');
        } finally {
            setLoading(false);
            setInitialLoad(false);
        }
    }, [branchCode, employeeCode, selectedMonth, selectedYear, orgId]);

    useEffect(() => {
        fetchEmployeeCheckInOutData();
    }, [selectedMonth, selectedYear, fetchEmployeeCheckInOutData]);

    const handleRefresh = useCallback(() => {
        fetchEmployeeCheckInOutData();
        setSearchTerm('');
    }, [fetchEmployeeCheckInOutData]);

    const handleExport = useCallback(() => {
        if (filteredData.length === 0) return;

        const csvData = filteredData.map(row => ({
            Date: row.date,
            Day: row.day,
            'Check In': row.checkIn,
            'Check Out': row.checkOut,
            'Working Hours': row.workingHours,
            Status: row.status,
        }));

        const headers = Object.keys(csvData[0]);

        const csvContent = [
            headers.join(','),
            ...csvData.map(row =>
                headers.map(h => `"${row[h]}"`).join(',')
            )
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = `attendance_${currentUser.name}_${months[selectedMonth].label}_${selectedYear}.csv`;
        a.click();

        window.URL.revokeObjectURL(url);
    }, [filteredData, currentUser.name, months, selectedMonth, selectedYear]);

    const getStatus = (inTime, outTime, workingHours) => {
        if (!inTime) return 'Absent';

        const minHalfDay = 4;
        const minFullDay = 8;

        // Convert working hours safely
        const hours = parseFloat(workingHours || 0);

        if (hours < minHalfDay) return 'Absent';
        if (hours < minFullDay) return 'Half Day';

        return 'Present';
    };

    const getStatusColor = useCallback((status) => {
        switch (status.toLowerCase()) {
            case 'present':
                return 'present';
            case 'late':
                return 'late';
            case 'absent':
                return 'absent';
            case 'weekend':
                return 'weekend';
            default:
                return 'default';
        }
    }, []);

    if (initialLoad && loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#f8f9fa' }}>
                <CircularProgress sx={{ color: '#667eea' }} />
            </Box>
        );
    }

    return (
        <Box sx={{
            minHeight: '100vh',
            background: '#f8f9fa',
            py: 3,
        }}>
            <Container maxWidth="xl">
                <Grid container spacing={1.5} alignItems="center" sx={{ mb: 3 }}>

                    {/* Month */}
                    <Grid item xs={12} sm={6} md={2}>
                        <FormControl fullWidth size="small">
                            <InputLabel sx={{ fontSize: '12px' }}>Month</InputLabel>
                            <Select
                                value={selectedMonth}
                                label="Month"
                                onChange={(e) => setSelectedMonth(e.target.value)}
                                sx={{
                                    borderRadius: '8px',
                                    height: 40,
                                    fontSize: '14px'
                                }}
                            >
                                {months.map((month) => (
                                    <MenuItem key={month.value} value={month.value}>
                                        {month.label}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>

                    {/* Year */}
                    <Grid item xs={12} sm={6} md={2}>
                        <FormControl fullWidth size="small">
                            <InputLabel sx={{ fontSize: '12px' }}>Year</InputLabel>
                            <Select
                                value={selectedYear}
                                label="Year"
                                onChange={(e) => setSelectedYear(e.target.value)}
                                sx={{
                                    borderRadius: '8px',
                                    height: 40,
                                    fontSize: '14px'
                                }}
                            >
                                {years.map((year) => (
                                    <MenuItem key={year} value={year}>
                                        {year}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>

                    {/* Search */}
                    <Grid item xs={12} sm={6} md={3}>
                        <TextField
                            fullWidth
                            size="small"
                            placeholder="Search..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: '8px',
                                    height: 40,
                                    fontSize: '14px'
                                }
                            }}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon sx={{ color: '#667eea', fontSize: 18 }} />
                                    </InputAdornment>
                                ),
                            }}
                        />
                    </Grid>

                    {/* Button */}
                    <Grid item xs={6} sm={3} md={1.5}>
                        <Button
                            fullWidth
                            variant="contained"
                            onClick={handleRefresh}
                            startIcon={<RefreshIcon sx={{ fontSize: 16 }} />}
                            disabled={loading}
                            sx={{
                                borderRadius: '8px',
                                height: 40,
                                fontSize: '14px',
                                px: 1.5,
                                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                                textTransform: 'none',
                                fontWeight: 600,
                                minWidth: 'unset',
                                '&:hover': {
                                    background: 'linear-gradient(135deg, #764ba2, #667eea)'
                                }
                            }}
                        >
                            {loading ? '...' : 'Refresh'}
                        </Button>
                    </Grid>

                </Grid>

                {/* Stats Cards - Compact */}
                <Grid container spacing={2} sx={{ mb: 3 }}>
                    {/* 🔹 Total Working Days */}
                    <Grid item xs={12} sm={6} md={2.4}>
                        <StatsCard
                            elevation={0}
                            sx={{
                                background: 'linear-gradient(135deg, #e0e7ff, #eef2ff)'
                            }}
                        >
                            <CardContent sx={{ p: 2 }}>
                                <Stack direction="row" spacing={2} alignItems="center">
                                    <Box
                                        sx={{
                                            width: 45,
                                            height: 45,
                                            borderRadius: '12px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            bgcolor: '#eef2ff'
                                        }}
                                    >
                                        <CalendarIcon sx={{ color: '#667eea', fontSize: 24 }} />
                                    </Box>

                                    <Box>
                                        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                                            Total Working Days
                                        </Typography>
                                        <Typography variant="h5" sx={{ fontWeight: 'bold', mt: 0.5 }}>
                                            {monthlyStats.totalDays}
                                        </Typography>
                                    </Box>

                                </Stack>
                            </CardContent>
                        </StatsCard>
                    </Grid>

                    {/* 🔹 Present */}
                    <Grid item xs={12} sm={6} md={2.4}>
                        <StatsCard
                            elevation={0}
                            sx={{
                                background: 'linear-gradient(135deg, #dcfce7, #ecfdf5)'
                            }}
                        >
                            <CardContent sx={{ p: 2 }}>
                                <Stack direction="row" spacing={2} alignItems="center">

                                    <Box
                                        sx={{
                                            width: 45,
                                            height: 45,
                                            borderRadius: '12px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            bgcolor: '#e8f5e9'
                                        }}
                                    >
                                        <CheckCircleIcon sx={{ color: '#4caf50', fontSize: 24 }} />
                                    </Box>

                                    <Box>
                                        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                                            Present
                                        </Typography>
                                        <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#4caf50', mt: 0.5 }}>
                                            {monthlyStats.presentDays}
                                        </Typography>
                                    </Box>

                                </Stack>
                            </CardContent>
                        </StatsCard>
                    </Grid>

                    {/* 🔹 Late Arrivals */}
                    <Grid item xs={12} sm={6} md={2.4}>
                        <StatsCard
                            elevation={0}
                            sx={{
                                background: 'linear-gradient(135deg, #ffedd5, #fff7ed)'
                            }}
                        >
                            <CardContent sx={{ p: 2 }}>
                                <Stack direction="row" spacing={2} alignItems="center">

                                    <Box
                                        sx={{
                                            width: 45,
                                            height: 45,
                                            borderRadius: '12px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            bgcolor: '#fff3e0'
                                        }}
                                    >
                                        <WarningIcon sx={{ color: '#ff9800', fontSize: 24 }} />
                                    </Box>

                                    <Box>
                                        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                                            Late Arrivals
                                        </Typography>
                                        <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#ff9800', mt: 0.5 }}>
                                            {monthlyStats.lateDays}
                                        </Typography>
                                    </Box>

                                </Stack>
                            </CardContent>
                        </StatsCard>
                    </Grid>

                    {/* 🔹 Absent */}
                    <Grid item xs={12} sm={6} md={2.4}>
                        <StatsCard
                            elevation={0}
                            sx={{
                                background: 'linear-gradient(135deg, #fee2e2, #fef2f2)'
                            }}
                        >
                            <CardContent sx={{ p: 2 }}>
                                <Stack direction="row" spacing={2} alignItems="center">

                                    <Box
                                        sx={{
                                            width: 45,
                                            height: 45,
                                            borderRadius: '12px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            bgcolor: '#fdecea'
                                        }}
                                    >
                                        <ErrorIcon sx={{ color: '#f44336', fontSize: 24 }} />
                                    </Box>

                                    <Box>
                                        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                                            Absent
                                        </Typography>
                                        <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#f44336', mt: 0.5 }}>
                                            {monthlyStats.absentDays}
                                        </Typography>
                                    </Box>

                                </Stack>
                            </CardContent>
                        </StatsCard>
                    </Grid>

                    {/* 🔹 Total Working Hours */}
                    <Grid item xs={12} sm={6} md={2.4}>
                        <StatsCard
                            elevation={0}
                            sx={{
                                background: 'linear-gradient(135deg, #e0f2fe, #f0f9ff)'
                            }}
                        >
                            <CardContent sx={{ p: 2 }}>
                                <Stack direction="row" spacing={2} alignItems="center">

                                    <Box
                                        sx={{
                                            width: 45,
                                            height: 45,
                                            borderRadius: '12px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            bgcolor: '#e3f2fd'
                                        }}
                                    >
                                        <AccessTimeIcon sx={{ color: '#2196f3', fontSize: 24 }} />
                                    </Box>

                                    <Box>
                                        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                                            Total Working Hours
                                        </Typography>
                                        <Typography variant="h5" sx={{ fontWeight: 'bold', mt: 0.5 }}>
                                            {monthlyStats.totalWorkingHours}
                                        </Typography>
                                    </Box>

                                </Stack>
                            </CardContent>
                        </StatsCard>
                    </Grid>
                </Grid>

                {/* Data Table */}
                <Paper elevation={0} sx={{ borderRadius: '16px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                    {error && (
                        <Alert severity="error" sx={{ m: 2, borderRadius: '10px' }}>
                            {error}
                        </Alert>
                    )}

                    <TableContainer>
                        <Table size="small">
                            <TableHead sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 'bold', color: 'white', fontSize: '0.8rem', py: 1.5 }}>Date</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold', color: 'white', fontSize: '0.8rem', py: 1.5 }}>Day</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold', color: 'white', fontSize: '0.8rem', py: 1.5 }}>Check In</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold', color: 'white', fontSize: '0.8rem', py: 1.5 }}>Check Out</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold', color: 'white', fontSize: '0.8rem', py: 1.5 }}>Working Hours</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold', color: 'white', fontSize: '0.8rem', py: 1.5 }}>Status</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {loading ? (
                                    <StyledTableRow>
                                        <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                                            <CircularProgress size={40} />
                                        </TableCell>
                                    </StyledTableRow>
                                ) : filteredData.length === 0 ? (
                                    <StyledTableRow>
                                        <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                                            <Typography color="textSecondary">
                                                No attendance records found for the selected period
                                            </Typography>
                                        </TableCell>
                                    </StyledTableRow>
                                ) : (
                                    filteredData
                                        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                        .map((row) => (
                                            <StyledTableRow key={row.id} hover sx={{ '& td': { py: 1 } }}>
                                                <TableCell sx={{ fontSize: '0.875rem' }}>{row.date}</TableCell>
                                                <TableCell sx={{ fontSize: '0.875rem' }}>{row.day}</TableCell>
                                                <TableCell sx={{ fontSize: '0.875rem' }}>
                                                    {row.checkIn}
                                                </TableCell>
                                                <TableCell sx={{ fontSize: '0.875rem' }}>
                                                    {row.checkOut}
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="body2" sx={{ fontSize: '0.8rem', fontWeight: 500 }}>
                                                        {row.workingHours}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <StatusChip
                                                        label={row.status}
                                                        status={getStatusColor(row.status)}
                                                        variant="outlined"
                                                        size="small"
                                                        sx={{ height: '24px', fontSize: '0.7rem' }}
                                                    />
                                                </TableCell>
                                            </StyledTableRow>
                                        ))
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    <Box sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        p: 2,
                        borderTop: '1px solid #e0e0e0',
                    }}>
                        <Button
                            variant="contained"
                            startIcon={<DownloadIcon sx={{ fontSize: '18px' }} />}
                            onClick={handleExport}
                            disabled={filteredData.length === 0 || loading}
                            size="small"
                            sx={{
                                borderRadius: '10px',
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                '&:hover': {
                                    background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
                                },
                                textTransform: 'none',
                                fontWeight: 600,
                                px: 2,
                                fontSize: '0.8rem',
                            }}
                        >
                            Export Report
                        </Button>
                        <Box
                            sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                p: 2,
                                borderTop: '1px solid #e5e7eb'
                            }}
                        >

                            {/* Pagination */}
                            <Stack direction="row" spacing={1} alignItems="center">

                                {/* Prev */}
                                <Button
                                    onClick={handlePrev}
                                    disabled={page === 0}
                                    sx={{
                                        minWidth: 32,
                                        height: 32,
                                        borderRadius: '8px',
                                        border: '1px solid #e5e7eb',
                                        color: '#374151'
                                    }}
                                >
                                    {'<'}
                                </Button>

                                {/* Page Numbers */}
                                {getVisiblePages().map((index) => (
                                    <Button
                                        key={index}
                                        onClick={() => setPage(index)}
                                        sx={{
                                            minWidth: 32,
                                            height: 32,
                                            borderRadius: '8px',
                                            fontSize: '12px',
                                            fontWeight: 600,
                                            bgcolor: page === index ? '#667eea' : 'transparent',
                                            color: page === index ? '#fff' : '#374151',
                                            border: page === index ? 'none' : '1px solid #e5e7eb',

                                            '&:hover': {
                                                bgcolor: page === index ? '#5a67d8' : '#f3f4f6'
                                            }
                                        }}
                                    >
                                        {index + 1}
                                    </Button>
                                ))}

                                {/* Next */}
                                <Button
                                    onClick={handleNext}
                                    disabled={page === totalPages - 1}
                                    sx={{
                                        minWidth: 32,
                                        height: 32,
                                        borderRadius: '8px',
                                        border: '1px solid #e5e7eb',
                                        color: '#374151'
                                    }}
                                >
                                    {'>'}
                                </Button>

                            </Stack>
                        </Box>
                    </Box>
                </Paper>
            </Container>
        </Box>
    );
};

export default CheckInOutReport;