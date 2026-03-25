import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    Box,
    Paper,
    Grid,
    TextField,
    Button,
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
    Autocomplete,
    Stack,
} from '@mui/material';
import {
    Search as SearchIcon,
    Refresh as RefreshIcon,
    Download as DownloadIcon,
    Person as PersonIcon,
    AccessTime as AccessTimeIcon,
    CheckCircle as CheckCircleIcon,
    Warning as WarningIcon,
    Error as ErrorIcon,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import apiCalls from 'apicall';

// Styled components
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

const AttendanceReport = () => {
    const currentDate = new Date();

    // State variables for date range
    const [fromDate, setFromDate] = useState(startOfMonth(currentDate));
    const [toDate, setToDate] = useState(endOfMonth(currentDate));
    const [branchCode] = useState(localStorage.getItem('branchcode'));
    const [orgId] = useState(localStorage.getItem('orgId'));
    const [selectedEmployee, setSelectedEmployee] = useState({
        id: 'ALL',
        name: 'ALL'
    });
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [reportData, setReportData] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [stats, setStats] = useState({
        totalRecords: 0,
        present: 0,
        late: 0,
        absent: 0,
        totalWorkingHours: 0,
    });

    const fetchAttendanceData = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const empCode = selectedEmployee?.id || 'ALL';

            const response = await apiCalls(
                'get',
                `/checkin/getALLEmployeeCheckInReportDetails?branchCode=${branchCode}&empCode=${empCode}&formDate=${format(fromDate, 'yyyy-MM-dd')}&toDate=${format(toDate, 'yyyy-MM-dd')}&orgId=${orgId}`
            );

            if (response.status === true) {
                const apiData = response.paramObjectsMap.mapp || [];

                const formattedData = apiData.map((item, index) => ({
                    id: index,
                    employeeId: item.employeeCode,
                    employeeName: item.employeeName,
                    department: '-', // ❗ API doesn't provide department
                    date: format(new Date(item.checkInDate), 'dd-MM-yyyy'),
                    day: format(new Date(item.checkInDate), 'EEEE'),
                    checkIn: item.inTime || '--',
                    checkOut: item.outTime || '--',
                    workingHours: item.effectiveHours || '--',
                    status: item.effectiveHours > 0 ? 'Present' : 'Absent',
                }));

                setReportData(formattedData);

                // Stats
                const present = formattedData.filter(d => d.status === 'Present').length;
                const absent = formattedData.filter(d => d.status === 'Absent').length;

                const totalHours = formattedData.reduce((sum, d) => {
                    return sum + (parseFloat(d.workingHours) || 0);
                }, 0);

                setStats({
                    totalRecords: formattedData.length,
                    present,
                    late: 0,
                    absent,
                    totalWorkingHours: totalHours.toFixed(1),
                });
            }
        } catch (err) {
            setError('Failed to fetch attendance data');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [fromDate, toDate, selectedEmployee, branchCode, orgId]);

    useEffect(() => {
        setPage(0);
    }, [searchTerm, selectedEmployee]);

    const getAllEmployee = useCallback(async () => {
        try {
            const response = await apiCalls(
                'get',
                `/master/getAllEmployeeByOrgId?branchCode=${branchCode}&orgId=${orgId}`
            );

            if (response.status === true) {
                const apiData = response.paramObjectsMap.employeeVO;

                const formattedEmployees = apiData.map(emp => ({
                    id: emp.employeeCode,
                    name: emp.employeeName,
                    department: emp.department,
                    email: emp.email
                }));

                setEmployees([
                    { id: 'ALL', name: 'ALL' },
                    ...formattedEmployees
                ]);
            }
        } catch (error) {
            console.error('Error fetching employees:', error);
        }
    }, [branchCode, orgId]);

    useEffect(() => {
        getAllEmployee();
    }, [getAllEmployee]);

    useEffect(() => {
        fetchAttendanceData();
    }, [fromDate, toDate, selectedEmployee]);

    // Handle search and employee filter
    const filteredData = useMemo(() => {
        let filtered = [...reportData];

        if (selectedEmployee && selectedEmployee.id !== 'ALL') {
            filtered = filtered.filter(item => item.employeeId === selectedEmployee.id);
        }

        if (searchTerm.trim() !== '') {
            const lower = searchTerm.toLowerCase();

            filtered = filtered.filter(item =>
                item.employeeName.toLowerCase().includes(lower) ||
                item.employeeId.toLowerCase().includes(lower) ||
                item.department.toLowerCase().includes(lower)
            );
        }

        return filtered;
    }, [reportData, selectedEmployee, searchTerm]);

    const totalPages = useMemo(
        () => Math.ceil(filteredData.length / rowsPerPage),
        [filteredData, rowsPerPage]
    );

    const handlePrev = useCallback(() => {
        setPage(prev => (prev > 0 ? prev - 1 : prev));
    }, []);

    const handleNext = useCallback(() => {
        setPage(prev => (prev < totalPages - 1 ? prev + 1 : prev));
    }, [totalPages]);

    // Handle refresh
    const handleRefresh = useCallback(() => {
        fetchAttendanceData();
        setSearchTerm('');
        setSelectedEmployee({ id: 'ALL', name: 'ALL' });
    }, [fetchAttendanceData]);

    // Handle export
    const handleExport = useCallback(() => {
        if (filteredData.length === 0) return;

        const csvData = filteredData.map(row => ({
            'Employee ID': row.employeeId,
            'Employee Name': row.employeeName,
            'Department': row.department,
            'Date': row.date,
            'Day': row.day,
            'Check In': row.checkIn,
            'Check Out': row.checkOut,
            'Working Hours': row.workingHours,
            'Status': row.status,
        }));

        const headers = Object.keys(csvData[0]);

        const csvContent = [
            headers.join(','),
            ...csvData.map(row => headers.map(h => `"${row[h]}"`).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = `attendance_report_${format(fromDate, 'dd-MM-yyyy')}_to_${format(toDate, 'dd-MM-yyyy')}.csv`;
        a.click();

        window.URL.revokeObjectURL(url);
    }, [filteredData, fromDate, toDate]);

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

    const getStatusColor = useCallback((status) => {
        switch (status.toLowerCase()) {
            case 'present': return 'present';
            case 'late': return 'late';
            case 'absent': return 'absent';
            case 'weekend': return 'weekend';
            default: return 'default';
        }
    }, []);

    const commonFieldSx = {
        '& .MuiOutlinedInput-root': {
            height: 48,
            borderRadius: '8px',
            fontSize: '15px'
        }
    };

    return (
        <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Box sx={{
                minHeight: '100vh',
                background: '#f8f9fa',
                py: 3,
            }}>
                <Container maxWidth="xl">
                    {/* Filters Card */}
                    <Grid container spacing={2} sx={{ mb: 3 }} alignItems="center">

                        {/* Date Pickers */}
                        <Grid item xs={12} md={4}>
                            <Stack direction="row" spacing={2}>
                                <DatePicker
                                    label="From Date"
                                    value={fromDate}
                                    onChange={(newValue) => setFromDate(newValue)}
                                    inputFormat="dd-MM-yyyy"
                                    renderInput={(params) => (
                                        <TextField {...params} size="small" fullWidth sx={commonFieldSx} />
                                    )}
                                />

                                <DatePicker
                                    label="To Date"
                                    value={toDate}
                                    onChange={(newValue) => setToDate(newValue)}
                                    inputFormat="dd-MM-yyyy"
                                    renderInput={(params) => (
                                        <TextField {...params} size="small" fullWidth sx={commonFieldSx} />
                                    )}
                                />
                            </Stack>
                        </Grid>

                        {/* Autocomplete */}
                        <Grid item xs={12} md={4}>
                            <Autocomplete
                                size="small"
                                options={employees}
                                value={selectedEmployee}
                                onChange={(event, newValue) => setSelectedEmployee(newValue)}
                                getOptionLabel={(option) =>
                                    option.id === 'ALL'
                                        ? option.name
                                        : `${option.name} (${option.id})`
                                }
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        placeholder="Search employee..."
                                        sx={commonFieldSx}
                                    />
                                )}
                            />
                        </Grid>

                        {/* Search + Button */}
                        <Grid item xs={12} md={4}>
                            <Stack direction="row" spacing={2}>
                                <TextField
                                    fullWidth
                                    size="small"
                                    placeholder="Search..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    sx={commonFieldSx}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <SearchIcon sx={{ color: '#667eea', fontSize: 18 }} />
                                            </InputAdornment>
                                        ),
                                    }}
                                />

                                <Button
                                    variant="contained"
                                    onClick={handleRefresh}
                                    startIcon={<RefreshIcon sx={{ fontSize: 16 }} />}
                                    disabled={loading}
                                    sx={{
                                        height: 48,
                                        borderRadius: '8px',
                                        fontSize: '14px',
                                        px: 2,
                                        minWidth: 110,
                                        background: 'linear-gradient(135deg, #667eea, #764ba2)',
                                        textTransform: 'none',
                                        fontWeight: 600,
                                        '&:hover': {
                                            background: 'linear-gradient(135deg, #764ba2, #667eea)'
                                        }
                                    }}
                                >
                                    Refresh
                                </Button>
                            </Stack>
                        </Grid>

                    </Grid>

                    {/* Stats Cards */}
                    <Grid container spacing={2} sx={{ mb: 3 }}>

                        {/* 🔹 Total Records */}
                        <Grid item xs={12} sm={6} md={2.4}>
                            <StatsCard elevation={0} sx={{ background: '#eef2ff', borderLeft: '4px solid #667eea' }}>
                                <CardContent sx={{ p: 2 }}>
                                    <Stack direction="row" spacing={2} alignItems="center">

                                        {/* Icon */}
                                        <Box
                                            sx={{
                                                width: 38,
                                                height: 38,
                                                borderRadius: '10px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                bgcolor: '#e0e7ff',
                                                border: '1px solid #e5e7eb'
                                            }}
                                        >
                                            <PersonIcon sx={{ color: '#667eea', fontSize: 20 }} />
                                        </Box>

                                        {/* Text */}
                                        <Box>
                                            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                                                Total Records
                                            </Typography>
                                            <Typography variant="h6" sx={{ fontWeight: 'bold', mt: 0.3 }}>
                                                {stats.totalRecords}
                                            </Typography>
                                        </Box>

                                    </Stack>
                                </CardContent>
                            </StatsCard>
                        </Grid>

                        {/* 🔹 Present */}
                        <Grid item xs={12} sm={6} md={2.4}>
                            <StatsCard elevation={0} sx={{ background: '#ecfdf5', borderLeft: '4px solid #667eea' }}>
                                <CardContent sx={{ p: 2 }}>
                                    <Stack direction="row" spacing={2} alignItems="center">

                                        <Box
                                            sx={{
                                                width: 38,
                                                height: 38,
                                                borderRadius: '10px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                bgcolor: '#d1fae5',
                                                border: '2px solid #bbf7d0'
                                            }}
                                        >
                                            <CheckCircleIcon sx={{ color: '#10b981', fontSize: 20 }} />
                                        </Box>

                                        <Box>
                                            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                                                Present
                                            </Typography>
                                            <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#10b981', mt: 0.3 }}>
                                                {stats.present}
                                            </Typography>
                                        </Box>

                                    </Stack>
                                </CardContent>
                            </StatsCard>
                        </Grid>

                        {/* 🔹 Late */}
                        <Grid item xs={12} sm={6} md={2.4}>
                            <StatsCard elevation={0} sx={{ background: '#fff7ed', borderLeft: '4px solid #667eea' }}>
                                <CardContent sx={{ p: 2 }}>
                                    <Stack direction="row" spacing={2} alignItems="center">

                                        <Box
                                            sx={{
                                                width: 38,
                                                height: 38,
                                                borderRadius: '10px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                bgcolor: '#ffedd5',
                                            }}
                                        >
                                            <WarningIcon sx={{ color: '#f59e0b', fontSize: 20 }} />
                                        </Box>

                                        <Box>
                                            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                                                Late
                                            </Typography>
                                            <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#f59e0b', mt: 0.3 }}>
                                                {stats.late}
                                            </Typography>
                                        </Box>

                                    </Stack>
                                </CardContent>
                            </StatsCard>
                        </Grid>

                        {/* 🔹 Absent */}
                        <Grid item xs={12} sm={6} md={2.4}>
                            <StatsCard elevation={0} sx={{ background: '#fef2f2', borderLeft: '4px solid #667eea' }}>
                                <CardContent sx={{ p: 2 }}>
                                    <Stack direction="row" spacing={2} alignItems="center">

                                        <Box
                                            sx={{
                                                width: 38,
                                                height: 38,
                                                borderRadius: '10px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                bgcolor: '#fee2e2'
                                            }}
                                        >
                                            <ErrorIcon sx={{ color: '#ef4444', fontSize: 20 }} />
                                        </Box>

                                        <Box>
                                            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                                                Absent
                                            </Typography>
                                            <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#ef4444', mt: 0.3 }}>
                                                {stats.absent}
                                            </Typography>
                                        </Box>

                                    </Stack>
                                </CardContent>
                            </StatsCard>
                        </Grid>

                        {/* 🔹 Total Hours */}
                        <Grid item xs={12} sm={6} md={2.4}>
                            <StatsCard elevation={0} sx={{ background: '#eff6ff', borderLeft: '4px solid #667eea' }}>
                                <CardContent sx={{ p: 2 }}>
                                    <Stack direction="row" spacing={2} alignItems="center">

                                        <Box
                                            sx={{
                                                width: 38,
                                                height: 38,
                                                borderRadius: '10px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                bgcolor: '#dbeafe'
                                            }}
                                        >
                                            <AccessTimeIcon sx={{ color: '#3b82f6', fontSize: 20 }} />
                                        </Box>

                                        <Box>
                                            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                                                Total Hours
                                            </Typography>
                                            <Typography variant="h6" sx={{ fontWeight: 'bold', mt: 0.3 }}>
                                                {stats.totalWorkingHours}
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
                                        <TableCell sx={{ fontWeight: 'bold', color: 'white', fontSize: '0.8rem', py: 1.5 }}>Employee ID</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold', color: 'white', fontSize: '0.8rem', py: 1.5 }}>Employee Name</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold', color: 'white', fontSize: '0.8rem', py: 1.5 }}>Department</TableCell>
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
                                            <TableCell colSpan={9} align="center" sx={{ py: 6 }}>
                                                <CircularProgress size={40} />
                                            </TableCell>
                                        </StyledTableRow>
                                    ) : filteredData.length === 0 ? (
                                        <StyledTableRow>
                                            <TableCell colSpan={9} align="center" sx={{ py: 6 }}>
                                                <Typography color="textSecondary">
                                                    No attendance records found for the selected criteria
                                                </Typography>
                                            </TableCell>
                                        </StyledTableRow>
                                    ) : (
                                        filteredData
                                            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                            .map((row) => (
                                                <StyledTableRow key={row.id} hover sx={{ '& td': { py: 1 } }}>
                                                    <TableCell sx={{ fontSize: '0.875rem' }}>{row.employeeId}</TableCell>
                                                    <TableCell sx={{ fontSize: '0.875rem', fontWeight: 500 }}>{row.employeeName}</TableCell>
                                                    <TableCell sx={{ fontSize: '0.875rem' }}>{row.department}</TableCell>
                                                    <TableCell sx={{ fontSize: '0.875rem' }}>{row.date}</TableCell>
                                                    <TableCell sx={{ fontSize: '0.875rem' }}>{row.day}</TableCell>
                                                    <TableCell>
                                                        {row.checkIn}
                                                    </TableCell>
                                                    <TableCell>
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
        </LocalizationProvider>
    );
};

export default AttendanceReport;