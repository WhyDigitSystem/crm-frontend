import React, { useEffect, useMemo, useState } from 'react';
import {
    Box,
    Paper,
    Typography,
    Stack,
    Divider,
    Chip,
    Card,
    CardContent,
    IconButton,
    Collapse,
    Avatar,
    Grid,
    Button,
    TextField,
    CircularProgress,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import RoomIcon from '@mui/icons-material/Room';

import Timeline from '@mui/lab/Timeline';
import TimelineItem from '@mui/lab/TimelineItem';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineDot from '@mui/lab/TimelineDot';
import TimelineOppositeContent from '@mui/lab/TimelineOppositeContent';

import ToastComponent, { showToast } from 'utils/toast-component';
import Autocomplete from '@mui/material/Autocomplete';
import * as XLSX from 'xlsx';

import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

import apiCalls from 'apicall';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import relativeTime from 'dayjs/plugin/relativeTime';
import { getAllActiveEmployees } from 'utils/CommonFunctions';

// enable plugins
dayjs.extend(utc);
dayjs.extend(relativeTime);

// ---- Haversine Distance (KM) ----
const calcDistanceKm = (p1, p2) => {
    if (!p1 || !p2) return 0;
    const R = 6371;
    const dLat = ((Number(p2.latitude) - Number(p1.latitude)) * Math.PI) / 180;
    const dLng = ((Number(p2.longitude) - Number(p1.longitude)) * Math.PI) / 180;
    const a = Math.sin(dLat / 2) ** 2 +
        Math.cos((Number(p1.latitude) * Math.PI) / 180) *
        Math.cos((Number(p2.latitude) * Math.PI) / 180) *
        Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

// ---- Reverse Geocode (Short format: City + Area) ----
const geocodeLatLng = (lat, lng) => {
    return new Promise((resolve) => {
        if (!lat || !lng || !window?.google?.maps) return resolve(null);

        const cacheKey = `addr_${lat}_${lng}`;
        const cached = localStorage.getItem(cacheKey);
        if (cached) return resolve(cached);

        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ location: { lat: Number(lat), lng: Number(lng) } }, (results, status) => {
            if (status === 'OK' && results && results[0]) {
                const comps = results[0].address_components || [];
                const area = comps.find((c) => c.types?.includes('sublocality'))?.long_name;
                const city = comps.find((c) => c.types?.includes('locality'))?.long_name;
                const short = area && city ? `${area}, ${city}` : results[0].formatted_address || null;
                try { localStorage.setItem(cacheKey, short); } catch (e) { /* ignore storage errors */ }
                resolve(short);
            } else {
                resolve(null);
            }
        });
    });
};

export default function KmSummaryList() {
    const [date, setDate] = useState(dayjs().format('YYYY-MM-DD'));
    const [rows, setRows] = useState([]);
    const [expandedIdx, setExpandedIdx] = useState(null);
    const [empList, setEmpList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [addressMap, setAddressMap] = useState({});
    const [searched, setSearched] = useState(false);
    const [fetchingAddresses, setFetchingAddresses] = useState(false);

    const [formData, setFormData] = useState({ employeeCode: '', employeeName: '' });
    const orgId = localStorage.getItem('orgId');
    const branchCode = localStorage.getItem('branchcode');

    useEffect(() => {
        getAllEmpList();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const getAllEmpList = async () => {
        try {
            const empData = await getAllActiveEmployees(orgId, branchCode);
            setEmpList(empData || []);
        } catch (error) {
            console.error('Error fetching Emp:', error);
            showToast('error', 'Failed to load employees');
        }
    };

    // ---- Fetch Employee KM data ----
    const fetchData = async () => {
        if (!formData.employeeCode) {
            showToast('warning', 'Please select Employee');
            return;
        }

        setLoading(true);
        setSearched(true);

        try {
            const res = await apiCalls(
                'get',
                `/officialworkroute/getAllLocationListEmployee?branchCode=${branchCode}&orgId=${orgId}&currentDate=${date}&employeeCode=${formData.employeeCode}`
            );

            const list = res?.paramObjectsMap?.officialWorkRouteDetails || [];
            setRows(Array.isArray(list) ? list : []);
        } catch (e) {
            console.error(e);
            setRows([]);
            showToast('error', 'Failed to fetch route data');
        }

        setLoading(false);
    };

    // ---- START/END Pairing ----
    const transformPairs = (list = []) => {
        const pairs = [];
        let start = null;

        for (const item of list) {
            if (!item) continue;
            if (item.type === 'START') start = item;
            else if (item.type === 'END') {
                if (start) {
                    const km = Number(item.distance ?? calcDistanceKm(start, item)) || 0;
                    pairs.push({ start, end: item, km });
                    start = null;
                } else {
                    pairs.push({ start: null, end: item, km: Number(item.distance || 0) });
                }
            }
        }
        if (start) pairs.push({ start, end: null, km: 0 });
        return pairs;
    };

    // ---- Summaries (sync ONLY) ----
    const summaries = useMemo(() => {
        return rows.map((emp) => {
            const pairs = transformPairs(emp.routeDetails || []);
            const totalKm = pairs.reduce((a, p) => a + (Number(p.km) || 0), 0);
            return {
                ...emp,
                pairs,
                totalKm,
                totalMeters: Math.round(totalKm * 1000),
                trips: pairs.length,
            };
        });
    }, [rows]);

    // ---- Reverse Geocode addresses (async) ----
    // we collect all missing coords and geocode them in parallel, then update addressMap once
    useEffect(() => {
        const loadAddresses = async () => {
            if (!summaries.length) return;
            setFetchingAddresses(true);

            const toFetch = new Map();

            for (const emp of summaries) {
                for (const p of emp.pairs) {
                    if (p.start) {
                        const k = `s_${p.start.latitude}_${p.start.longitude}`;
                        if (!addressMap[k]) toFetch.set(k, { lat: p.start.latitude, lng: p.start.longitude });
                    }
                    if (p.end) {
                        const k = `e_${p.end.latitude}_${p.end.longitude}`;
                        if (!addressMap[k]) toFetch.set(k, { lat: p.end.latitude, lng: p.end.longitude });
                    }
                }
            }

            if (toFetch.size === 0) {
                setFetchingAddresses(false);
                return;
            }

            try {
                const entries = Array.from(toFetch.entries());
                const promises = entries.map(([key, { lat, lng }]) =>
                    geocodeLatLng(lat, lng).then((addr) => ({ key, addr }))
                );

                const results = await Promise.all(promises);
                const next = { ...addressMap };
                for (const r of results) {
                    if (r.addr) next[r.key] = r.addr;
                }

                setAddressMap(next);
            } catch (e) {
                console.error('Geocode error:', e);
            }

            setFetchingAddresses(false);
        };

        loadAddresses();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [summaries]);

    // ---- Excel Export ----
    const exportExcel = () => {
        const data = [];
        summaries.forEach((emp) => {
            emp.pairs.forEach((trip, i) => {
                data.push({
                    Employee: emp.employeeName || '-',
                    Code: emp.employeeCode || '-',
                    Trip: i + 1,
                    StartTime: trip.start?.checkIntime || '-',
                    EndTime: trip.end?.checkIntime || '-',
                    KM: (Number(trip.km) || 0).toFixed(3),
                    // Meters: Math.round((Number(trip.km) || 0) * 1000),
                });
            });
        });

        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Trips');
        XLSX.writeFile(wb, `Trip_Report_${date}.xlsx`);
    };

    const pretty = (t) => (t ? dayjs(t).format('DD MMM, hh:mm A') : '-');

    return (
        <Box sx={{ p: 2 }}>
            <ToastComponent />

            {/* TOP FILTER BAR */}
            <Paper sx={{ p: 3, borderRadius: 3, mb: 3 }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={4}>
                        <Autocomplete
                            options={empList || []}
                            getOptionLabel={(option) =>
                                option?.employeeCode && option?.employeeName
                                    ? `${option.employeeCode} - ${option.employeeName}`
                                    : ''
                            }
                            value={
                                empList?.find((item) => item.employeeCode === formData.employeeCode) || null
                            }
                            onChange={(event, newValue) => {
                                if (newValue) {
                                    setFormData((prev) => ({
                                        ...prev,
                                        employeeName: newValue.employeeName || '',
                                        employeeCode: newValue.employeeCode || '',
                                    }));
                                } else {
                                    setFormData((prev) => ({ ...prev, employeeName: '', employeeCode: '' }));
                                }
                            }}
                            isOptionEqualToValue={(option, value) => (option?.employeeCode === value?.employeeCode)}
                            renderInput={(params) => (
                                <TextField {...params} label="Employee" size="small" fullWidth />
                            )}
                        />
                    </Grid>

                    <Grid item xs={12} md={4}>
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DatePicker
                                label="Date"
                                value={dayjs(date)}
                                onChange={(d) => setDate(dayjs(d).format('YYYY-MM-DD'))}
                                slotProps={{ textField: { size: 'small' } }}
                                format="DD-MM-YYYY"
                            />
                        </LocalizationProvider>
                    </Grid>

                    <Grid item xs={12} md={4}>
                        <Stack direction="row" spacing={1}>
                            <Button fullWidth variant="contained" onClick={fetchData} disabled={loading}>
                                {loading ? <CircularProgress size={20} /> : 'Search'}
                            </Button>
                            <Button
                                fullWidth
                                variant="outlined"
                                onClick={exportExcel}
                                disabled={!summaries.length}
                            >
                                Export
                            </Button>
                        </Stack>
                    </Grid>
                </Grid>
            </Paper>

            {/* NO ENTRIES */}
            {searched && !loading && summaries.length === 0 && (
                <Paper sx={{ p: 3, textAlign: 'center', borderRadius: 3 }}>
                    <Typography variant="h6" color="text.secondary">
                        No Entries Found
                    </Typography>
                </Paper>
            )}

            {/* ADDRESS FETCHING INFO */}
            {fetchingAddresses && (
                <Paper sx={{ p: 1, mb: 2, borderRadius: 2 }}>
                    <Typography variant="caption">Enriching addresses...</Typography>
                </Paper>
            )}

            {/* EMPLOYEE CARDS */}
            {summaries.map((emp, idx) => (
                <Card key={`${emp.employeeCode || idx}_${idx}`} sx={{ mb: 2, borderRadius: 3 }}>
                    <CardContent>
                        {/* HEADER */}
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                            <Stack direction="row" spacing={2} alignItems="center">
                                <Avatar sx={{ bgcolor: '#1976d2' }}>{(emp.employeeName || '-')?.[0]}</Avatar>
                                <Box>
                                    <Typography variant="h6" fontWeight={700}>
                                        {emp.employeeName || '-'}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {emp.employeeCode || '-'}
                                    </Typography>
                                </Box>
                            </Stack>

                            <Stack direction="row" spacing={1} alignItems="center">
                                <Chip label={`KM TRAVELED: ${(Number(emp.totalKm) || 0).toFixed(3)}`} color="success" />
                                <Chip label={`Trips: ${emp.trips || 0}`} />
                                <IconButton onClick={() => setExpandedIdx(expandedIdx === idx ? null : idx)}>
                                    {expandedIdx === idx ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                                </IconButton>
                            </Stack>
                        </Stack>

                        {/* EXPANDABLE TRIP LIST */}
                        <Collapse in={expandedIdx === idx}>
                            <Divider sx={{ my: 2 }} />

                            <Timeline position="right">
                                {emp.pairs.map((p, i) => (
                                    <TimelineItem key={i}>
                                        <TimelineOppositeContent>
                                            <Typography variant="caption">
                                                {pretty(p.start?.checkIntime)}
                                                <br />
                                                {pretty(p.end?.checkIntime)}
                                            </Typography>
                                        </TimelineOppositeContent>

                                        <TimelineSeparator>
                                            <TimelineDot sx={{ bgcolor: (Number(p.km) || 0) > 0 ? undefined : 'grey.400' }}>
                                                {(Number(p.km) || 0) > 0 ? <RoomIcon /> : (p.start ? <PlayArrowIcon /> : <StopIcon />)}
                                            </TimelineDot>
                                            {i < emp.pairs.length - 1 && <TimelineConnector />}
                                        </TimelineSeparator>

                                        <TimelineContent>
                                            <Paper sx={{ p: 1.5, borderRadius: 2 }}>
                                                <Stack direction="row" justifyContent="space-between" alignItems="flex-start">

                                                    <Box>
                                                        <Typography variant="subtitle2" fontWeight={700}>Task {i + 1}</Typography>

                                                        {/* START */}
                                                        <Typography variant="body2" fontWeight={600}>
                                                            Start: {pretty(p.start?.checkIntime)}
                                                        </Typography>
                                                        <Typography variant="caption" color="text.secondary">
                                                            {addressMap[`s_${p.start?.latitude}_${p.start?.longitude}`] || 'Location...'}
                                                        </Typography>

                                                        <Divider sx={{ my: 1 }} />

                                                        {/* END */}
                                                        <Typography variant="body2" fontWeight={600}>
                                                            End: {pretty(p.end?.checkIntime)}
                                                        </Typography>
                                                        <Typography variant="caption" color="text.secondary">
                                                            {addressMap[`e_${p.end?.latitude}_${p.end?.longitude}`] || 'Location...'}
                                                        </Typography>
                                                    </Box>

                                                    <Stack alignItems="flex-end">
                                                        <Typography variant="subtitle2" fontWeight={800}>
                                                            {(Number(p.km) || 0).toFixed(3)} km
                                                        </Typography>
                                                        <Typography variant="caption">
                                                            {Math.round((Number(p.km) || 0) * 1000)} m
                                                        </Typography>
                                                    </Stack>

                                                </Stack>
                                            </Paper>
                                        </TimelineContent>
                                    </TimelineItem>
                                ))}
                            </Timeline>
                        </Collapse>
                    </CardContent>
                </Card>
            ))}
        </Box>
    );
}
