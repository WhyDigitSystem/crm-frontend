import React, { useState, useMemo, useEffect } from "react";
import {
    Box,
    Grid,
    Paper,
    Typography,
    TextField,
    MenuItem,
    Autocomplete,
} from "@mui/material";
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { MaterialReactTable } from "material-react-table";
import dayjs from "dayjs";
import apiCalls from "apicall";

export default function Reward() {
    const [rewardNameList, setRewardNameList] = useState([]);
    const [orgId] = useState(localStorage.getItem("orgId"));
    const [loginUserName] = useState(localStorage.getItem("userName"));
    const [branch] = useState(localStorage.getItem("branch"));
    const [branchCode] = useState(localStorage.getItem("branchcode"));
    const [filters, setFilters] = useState({
        rewardName: "",
        fromDate: "",
        toDate: "",
        employee: "",
    });
    useEffect(() => {
        getAllRewardName();
    }, [])
    const getAllRewardName = async () => {
        try {
            const response = await apiCalls('get', `/master/getAllRewardNames?orgId=${orgId}`);
            if (response.status === true) {
                setRewardNameList(response.paramObjectsMap.rewardNames);
            } else {
                console.error('API Error:', response);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };
    const handleInputChange = (e) => {
        // works with native events and synthetic custom event shapes
        const target = e?.target || {};
        const name = target.name;
        const value = target.value;

        if (!name) return;

        setFilters((prev) => ({ ...prev, [name]: value }));
        // setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    };
    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    // Sample static data (replace with API data)
    const data = useMemo(
        () => [
            {
                employee: "Divesh",
                rewardName: "Sales Performer Reward",
                achievement: "12,000",
                slab: "10,000 – 15,000",
                earned: "₹ 1,000",
                status: "Credited",
                date: "15-11-2025",
            },
            {
                employee: "Arun",
                rewardName: "Silver Sales Reward",
                achievement: "8,000",
                slab: "5,000 – 10,000",
                earned: "₹ 500",
                status: "Pending",
                date: "—",
            },
            {
                employee: "Kiran",
                rewardName: "Production Efficiency Bonus",
                achievement: "90%",
                slab: "90% – 95%",
                earned: "₹ 1,000",
                status: "Failed",
                date: "—",
            },
        ],
        []
    );

    const columns = useMemo(
        () => [
            { accessorKey: "employee", header: "Employee" },
            { accessorKey: "rewardName", header: "Reward Name" },
            { accessorKey: "achievement", header: "Achievement" },
            { accessorKey: "slab", header: "Slab" },
            { accessorKey: "earned", header: "Earned" },
            {
                accessorKey: "status",
                header: "Status",
                Cell: ({ cell }) => {
                    const val = cell.getValue();
                    const colors = {
                        Credited: "#2e7d32",
                        Pending: "#b58900",
                        Failed: "#c0392b",
                    };
                    const bg = {
                        Credited: "#d4edda",
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
            { accessorKey: "date", header: "Reward Date" },
        ],
        []
    );

    return (
        <Box p={3} sx={{ background: "#f5f6fa", minHeight: "100vh" }}>
            <Typography variant="h4" fontWeight={700} mb={3}>
                🎉 Rewards
            </Typography>

            {/* Filters */}
            <Grid
                container
                spacing={2}
                sx={{
                    background: "#fff",
                    p: 2,
                    borderRadius: 2,
                    mb: 3,
                    boxShadow: "0 4px 10px rgba(0,0,0,0.08)",
                }}
            >
                <Grid item xs={12} sm={3}>
                    <Autocomplete
                        options={rewardNameList || []}
                        getOptionLabel={(option) =>
                            option?.rewardName
                                ? `${option.rewardName}`
                                : ''
                        }
                        value={
                            rewardNameList.find(
                                (item) => item.rewardName === filters.rewardName
                            ) || null
                        }
                        onChange={(event, newValue) => {
                            if (newValue) {
                                setFilters((prev) => ({
                                    ...prev,
                                    rewardName: newValue.rewardName || '',
                                }));
                            } else {
                                setFilters((prev) => ({
                                    ...prev,
                                    rewardName: '',
                                }));
                            }
                        }}
                        isOptionEqualToValue={(option, value) =>
                            option.rewardName === value.rewardName
                        }
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label="Reward Name"
                                size="small"
                                fullWidth
                            />
                        )}
                    />
                </Grid>

                <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <Grid item xs={12} sm={3}>
                        <DatePicker
                            label="From"
                            format="DD-MM-YYYY"
                            value={filters.fromDate ? dayjs(filters.fromDate) : null}
                            onChange={(newValue) =>
                                handleInputChange({
                                    target: { name: "fromDate", value: newValue ? newValue.format("YYYY-MM-DD") : "" }
                                })
                            }
                            slotProps={{
                                textField: {
                                    size: "small",
                                    fullWidth: true,
                                },
                            }}
                        />
                    </Grid>

                    <Grid item xs={12} sm={3}>
                        <DatePicker
                            label="To"
                            format="DD-MM-YYYY"
                            value={filters.toDate ? dayjs(filters.toDate) : null}
                            onChange={(newValue) =>
                                handleInputChange({
                                    target: { name: "toDate", value: newValue ? newValue.format("YYYY-MM-DD") : "" }
                                })
                            }
                            slotProps={{
                                textField: {
                                    size: "small",
                                    fullWidth: true,
                                },
                            }}
                        />
                    </Grid>
                </LocalizationProvider>
                {/* 
                <Grid item xs={12} sm={3}>
                    <TextField
                        fullWidth
                        label="Employee"
                        placeholder="Search employee"
                        name="employee"
                        value={filters.employee}
                        onChange={handleFilterChange}
                        size="small"
                    />
                </Grid> */}
            </Grid>

            {/* Top Performer */}
            <Paper
                elevation={3}
                sx={{
                    p: 2,
                    mb: 3,
                    borderRadius: 2,
                    boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
                }}
            >
                <Typography variant="h6" mb={1}>
                    🏆 Top Performer
                </Typography>
                <Typography variant="h5" fontWeight={700}>
                    Divesh – ₹ 1,000 Earned
                </Typography>
            </Paper>

            {/* Table */}
            <MaterialReactTable
                columns={columns}
                data={data}
                enableStickyHeader
                initialState={{ density: "comfortable" }}
                muiTableProps={{
                    sx: {
                        borderRadius: 2,
                        overflow: "hidden",
                        boxShadow: "0px 4px 12px rgba(0,0,0,0.08)",
                    },
                }}
            />
        </Box>
    );
}
