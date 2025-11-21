import React, { useState, useMemo, useEffect } from "react";
import {
    Box,
    Grid,
    Paper,
    Typography,
    TextField,
    Autocomplete,
    Button,
    CircularProgress
} from "@mui/material";
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from "dayjs";
import apiCalls from "apicall";
import CommonReportTable from "utils/CommonReportTable";

export default function Reward() {
    const [rewardNameList, setRewardNameList] = useState([]);
    const [rewardDetails, setRewardDetails] = useState([]);
    const [loading, setLoading] = useState(false);
    const [listView] = useState(false);

    const orgId = localStorage.getItem('orgId');
    const branchCode = localStorage.getItem('branchcode');

    const [filters, setFilters] = useState({
        rewardName: "",
        fromDate: "",
        toDate: "",
    });

    useEffect(() => {
        getAllRewardName();
    }, []);

    const getAllRewardName = async () => {
        try {
            const response = await apiCalls('get', `/master/getAllRewardNames?orgId=${orgId}`);
            if (response.status) {
                setRewardNameList(response.paramObjectsMap.rewardNames);
            }
        } catch (error) {
            console.error("Reward Name API Error", error);
        }
    };

    const loadRewardDetails = async () => {
        if (!filters.rewardName) return;

        setLoading(true);
        try {
            let response;
            if (filters.fromDate && filters.toDate) {
                response = await apiCalls(
                    'get',
                    `/master/getAllRewardPoints?branchCode=${branchCode}&fromDate=${filters.fromDate}&orgId=${orgId}&rewardName=${encodeURIComponent(filters.rewardName)}&toDate=${filters.toDate}`
                );
            } else {
                response = await apiCalls(
                    'get',
                    `/master/getAllRewardPoints?branchCode=${branchCode}&orgId=${orgId}&rewardName=${encodeURIComponent(filters.rewardName)}`
                );
            }

            if (response.status) {
                setRewardDetails(response.paramObjectsMap.rewardPoints || []);
            } else {
                setRewardDetails([]);
            }
        } catch (error) {
            console.error("Reward Points API Error", error);
        }
        setLoading(false);
    };

    const handleInputChange = (e) => {
        const name = e?.target?.name;
        const value = e?.target?.value;
        if (!name) return;
        setFilters((prev) => ({ ...prev, [name]: value }));
    };

    const columns = useMemo(
        () => [
            { accessorKey: "employeeName", header: "Employee" },
            { accessorKey: "rewardName", header: "Reward Name" },
            { accessorKey: "fixedTarget", header: "Target" },
            { accessorKey: "points", header: "Earned Points" },
            { accessorKey: "netAmount", header: "Reward Amount" },
            {
                accessorKey: "status",
                header: "Status",
                Cell: ({ cell }) => {
                    const val = cell.getValue();
                    const colors = {
                        Completed: "#2e7d32",
                        Pending: "#b58900",
                        Failed: "#c0392b",
                    };
                    const bg = {
                        Completed: "#d4edda",
                        Pending: "#fff3cd",
                        Failed: "#f8d7da",
                    };
                    return (
                        <span
                            style={{
                                background: bg[val],
                                color: colors[val],
                                padding: "6px 12px",
                                borderRadius: "20px",
                                fontSize: "12px",
                                fontWeight: 600,
                            }}
                        >
                            {val}
                        </span>
                    );
                },
            },
            { accessorKey: "createdOn", header: "Reward Date" },
        ],
        []
    );

    const topPerformer =
        rewardDetails.length > 0
            ? rewardDetails.reduce((max, item) =>
                item.netAmount > max.netAmount ? item : max
            )
            : null;

    return (
        <Box p={3} sx={{ background: "#f1f3f6", minHeight: "100vh" }}>
            <Typography variant="h4" fontWeight={700} mb={3}>
                🎉 Reward Dashboard
            </Typography>

            {/* Filters */}
            <Paper
                sx={{
                    p: 3,
                    borderRadius: 3,
                    mb: 3,
                    boxShadow: "0px 4px 14px rgba(0,0,0,0.08)",
                }}
            >
                <Grid container spacing={2} alignItems="center">

                    {/* Reward Name */}
                    <Grid item xs={12} md={4}>
                        <Autocomplete
                            options={rewardNameList || []}
                            getOptionLabel={(option) => option.rewardName || ""}
                            value={rewardNameList.find(
                                (item) => item.rewardName === filters.rewardName
                            ) || null}
                            onChange={(e, val) =>
                                setFilters((prev) => ({
                                    ...prev,
                                    rewardName: val ? val.rewardName : "",
                                }))
                            }
                            renderInput={(params) => (
                                <TextField {...params} label="Reward Name" size="small" fullWidth />
                            )}
                        />
                    </Grid>

                    {/* Dates */}
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <Grid item xs={12} md={3}>
                            <DatePicker
                                label="From Date"
                                format="DD-MM-YYYY"
                                value={filters.fromDate ? dayjs(filters.fromDate) : null}
                                onChange={(newValue) =>
                                    handleInputChange({
                                        target: {
                                            name: "fromDate",
                                            value: newValue ? newValue.format("YYYY-MM-DD") : "",
                                        },
                                    })
                                }
                                slotProps={{ textField: { size: "small", fullWidth: true } }}
                            />
                        </Grid>

                        <Grid item xs={12} md={3}>
                            <DatePicker
                                label="To Date"
                                format="DD-MM-YYYY"
                                value={filters.toDate ? dayjs(filters.toDate) : null}
                                onChange={(newValue) =>
                                    handleInputChange({
                                        target: {
                                            name: "toDate",
                                            value: newValue ? newValue.format("YYYY-MM-DD") : "",
                                        },
                                    })
                                }
                                slotProps={{ textField: { size: "small", fullWidth: true } }}
                            />
                        </Grid>
                    </LocalizationProvider>

                    {/* GO Button */}
                    <Grid item xs={12} md={2}>
                        <Button
                            variant="contained"
                            fullWidth
                            size="large"
                            onClick={loadRewardDetails}
                            sx={{
                                height: "40px",
                                fontWeight: 700,
                                borderRadius: "10px",
                                background: "#1976d2",
                                "&:hover": { background: "#0d47a1" },
                            }}
                        >
                            GO
                        </Button>
                    </Grid>
                </Grid>
            </Paper>

            {/* Top Performer Card */}
            {topPerformer && (
                <Paper
                    sx={{
                        p: 3,
                        mb: 3,
                        borderRadius: 3,
                        background: "linear-gradient(135deg,#d1e9ff,#e8f4ff)",
                        boxShadow: "0px 6px 16px rgba(0,0,0,0.12)",
                    }}
                >
                    <Typography variant="h6" fontWeight={700} mb={1}>
                        🏆 Top Performer
                    </Typography>

                    <Typography variant="h4" fontWeight={800}>
                        {topPerformer.employeeName} – ₹ {topPerformer.netAmount}
                    </Typography>

                    <Typography mt={1} color="text.secondary" fontSize={16}>
                        Reward: {topPerformer.rewardName}
                    </Typography>
                </Paper>
            )}

            {/* Loader or Table */}
            {loading ? (
                <Box textAlign="center" mt={5}>
                    <CircularProgress />
                    <Typography mt={2}>Fetching reward details...</Typography>
                </Box>
            ) : (
                <CommonReportTable
                    data={rewardDetails}
                    columns={columns}
                    isListView={listView}
                    fileName="Rewards"
                    isExcel={false}
                    isPdf={false}
                    muiTablePaperProps={{
                        elevation: 0,
                        sx: {
                            borderRadius: "16px",
                            overflow: "hidden",
                            boxShadow: "0px 4px 14px rgba(0,0,0,0.07)",
                        },
                    }}
                    muiTableHeadCellProps={{
                        sx: {
                            background: "#eaf4ff",
                            fontWeight: "700",
                            fontSize: "14px",
                            borderBottom: "2px solid #d0e3ff",
                        }
                    }}
                    muiTableBodyRowProps={{
                        sx: {
                            "&:nth-of-type(odd)": {
                                backgroundColor: "#fafafa"
                            },
                            "&:hover": {
                                backgroundColor: "#eef7ff",
                                transition: "0.2s",
                            },
                        }
                    }}
                />
            )}
        </Box>
    );
}
