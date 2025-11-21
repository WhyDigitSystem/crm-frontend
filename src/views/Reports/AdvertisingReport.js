import React, { useState, useMemo, useEffect } from "react";
import {
    Box,
    Grid,
    Paper,
    Typography,
    TextField,
    Autocomplete,
    Button,
    CircularProgress,
    Card,
    CardContent,
} from "@mui/material";
import CurrencyRupeeIcon from "@mui/icons-material/CurrencyRupee";
import HourglassTopIcon from '@mui/icons-material/HourglassTop';
import ApprovalIcon from '@mui/icons-material/ThumbUpAlt';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import apiCalls from "apicall";
import CommonReportTable from "utils/CommonReportTable";
import KPIBox from "views/basicMaster/KPIBox";

export default function AdvertisingReport() {
    const orgId = localStorage.getItem("orgId");
    const branchCode = localStorage.getItem("branchcode");

    const [dealerList, setDealerList] = useState([]);
    const [advTypeList, setAdvTypeList] = useState([]);

    const [reportData, setReportData] = useState([]);
    const [loading, setLoading] = useState(false);

    const [filters, setFilters] = useState({
        dealer: "All",
        advertisementType: "All",
        month: "",
        fromDate: "",
        toDate: "",
    });

    const [summary, setSummary] = useState({
        expiringsoon: 0,
        pendingApprovals: 0,
        totalActualCost: 0,
        totalAdvertisement: 0
    });

    // -------------------------------------------------------------------
    // Initial load: masters + default report
    // -------------------------------------------------------------------
    useEffect(() => {
        getDealerList();
        getAdvertisementTypes();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const getDealerList = async () => {
        try {
            const res = await apiCalls(
                "get",
                `/dealer/getDealerAndDistributorName?orgId=${orgId}`
            );
            if (res?.status) {
                setDealerList(res.paramObjectsMap?.dealerAndDistributorNames || []);
            }
        } catch (err) {
            console.error("Dealer list API error", err);
        }
    };

    const getAdvertisementTypes = async () => {
        try {
            // 🔁 Adjust endpoint according to your backend
            const res = await apiCalls(
                "get",
                `/master/getAllListValues?listDescription=AdvertisementType&orgId=${orgId}`
            );
            if (res?.status) {
                setAdvTypeList(res.paramObjectsMap?.listValues || []);
            }
        } catch (err) {
            console.error("Adv type API error", err);
        }
    };

    const loadReportAndSummary = async () => {
        setLoading(true);

        try {
            // ------------------------------
            // 1️⃣ KPI API
            // ------------------------------
            let kpiUrl = `/checkin/getAdvertisementCount?branchCode=${branchCode}&name=${filters.dealer}&orgId=${orgId}&type=${filters.advertisementType}`;

            if (filters.fromDate && filters.toDate) {
                kpiUrl += `&fromDate=${filters.fromDate}&toDate=${filters.toDate}`;
            }

            const kpiRes = await apiCalls("get", kpiUrl);

            if (kpiRes?.status) {
                const s = kpiRes.paramObjectsMap?.mapp?.[0] || {};
                setSummary({
                    expiringsoon: s.expiringsoon || 0,
                    pendingApprovals: s.pendingApprovals || 0,
                    totalActualCost: s.totalActualCost || 0,
                    totalAdvertisement: s.totalAdvertisement || 0,
                });
            } else {
                setSummary({
                    expiringsoon: 0,
                    pendingApprovals: 0,
                    totalActualCost: 0,
                    totalAdvertisement: 0,
                });
            }

            // ------------------------------
            // 2️⃣ Report API (table data)
            // ------------------------------
            let reportUrl = `/checkin/getAdvertisementReport?branchCode=${branchCode}&name=${filters.dealer}&orgId=${orgId}&type=${filters.advertisementType}`;

            if (filters.fromDate && filters.toDate) {
                reportUrl += `&fromDate=${filters.fromDate}&toDate=${filters.toDate}`;
            }

            const reportRes = await apiCalls("get", reportUrl);

            if (reportRes?.status) {
                const list = reportRes.paramObjectsMap?.advertisementDetails || [];
                setReportData(Array.isArray(list) ? list : []);
            } else {
                setReportData([]);
            }
        } catch (err) {
            console.error("API error", err);
            setReportData([]);
        } finally {
            setLoading(false);
        }
    };

    const handleClearFilters = () => {
        setFilters({
            dealer: "All",
            advertisementType: "All",
            month: "",
            fromDate: "",
            toDate: "",
        });
        loadReportAndSummary();
    };
    const formatAmount = (amount) => {
        if (!amount) return "0";
        const num = Number(amount);
        if (isNaN(num)) return amount;
        return num.toLocaleString("en-IN");
    };
    const formatDate = (dateStr) => {
        if (!dateStr) return "";
        return dayjs(dateStr).format("DD-MM-YYYY");
    };

    const columns = useMemo(
        () => [
            { accessorKey: "name", header: "Dealer" },
            { accessorKey: "type", header: "Type" },
            { accessorKey: "size", header: "Size / Dimension" },
            { accessorKey: "quantity", header: "Quantity" },

            {
                accessorKey: "estimatedCost",
                header: "Estimated Cost",
                Cell: ({ cell }) => {
                    const value = cell.getValue();
                    return (
                        <span style={{ fontWeight: 600 }}>
                            ₹ {formatAmount(value)}
                        </span>
                    );
                },
            },

            {
                accessorKey: "actualCost",
                header: "Actual Cost",
                Cell: ({ cell, row }) => {
                    const actual = Number(cell.getValue());
                    const estimated = Number(row.original.estimatedCost);

                    const isHigher = actual > estimated;

                    return (
                        <span
                            style={{
                                fontWeight: 700,
                                color: isHigher ? "#d32f2f" : "#2e7d32", // red if higher, green if okay
                            }}
                        >
                            ₹ {formatAmount(actual)}
                        </span>
                    );
                },
            },
            {
                accessorKey: "validFrom",
                header: "Valid From",
                Cell: ({ cell }) => {
                    const value = cell.getValue();
                    return formatDate(value);
                },
            },
            {
                accessorKey: "validTill",
                header: "Valid To",
                Cell: ({ cell }) => {
                    const value = cell.getValue();
                    return formatDate(value);
                },
            },
        ],
        []
    );

    const listView = false;
    return (
        <Box p={3} sx={{ background: "#f1f3f6", minHeight: "100vh" }}>
            {/* ===================== FILTER BAR ===================== */}
            <Paper
                sx={{
                    p: 3,
                    borderRadius: 3,
                    mb: 3,
                    boxShadow: "0px 4px 14px rgba(0,0,0,0.08)",
                }}
            >
                <Grid container spacing={2} alignItems="center">

                    {/* Dealer Filter */}
                    <Grid item xs={12} md={3.1}>
                        <Autocomplete
                            options={[{ name: "All" }, ...dealerList]}
                            getOptionLabel={(option) => option?.name || ""}
                            value={{ name: filters.dealer }}
                            onChange={(e, val) =>
                                setFilters((prev) => ({
                                    ...prev,
                                    dealer: val?.name || "All",
                                }))
                            }
                            renderInput={(params) => (
                                <TextField {...params} label="Dealer" size="small" fullWidth />
                            )}
                        />
                    </Grid>

                    {/* Advertisement Type Filter */}
                    <Grid item xs={12} md={2.5}>
                        <Autocomplete
                            options={[{ listOfValues: "All" }, ...advTypeList]}
                            getOptionLabel={(option) => option?.listOfValues || ""}
                            value={{ listOfValues: filters.advertisementType }}
                            onChange={(e, val) =>
                                setFilters((prev) => ({
                                    ...prev,
                                    advertisementType: val?.listOfValues || "All",
                                }))
                            }
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Advertisement Type"
                                    size="small"
                                    fullWidth
                                />
                            )}
                        />
                    </Grid>

                    {/* From Date */}
                    <Grid item xs={12} md={2.2}>
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DatePicker
                                label="From Date"
                                format="DD-MM-YYYY"
                                value={filters.fromDate ? dayjs(filters.fromDate) : null}
                                onChange={(newValue) =>
                                    setFilters((prev) => ({
                                        ...prev,
                                        fromDate: newValue ? newValue.format("YYYY-MM-DD") : "",
                                    }))
                                }
                                slotProps={{
                                    textField: { size: "small", fullWidth: true },
                                }}
                            />
                        </LocalizationProvider>
                    </Grid>

                    {/* To Date */}
                    <Grid item xs={12} md={2.2}>
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DatePicker
                                label="To Date"
                                format="DD-MM-YYYY"
                                value={filters.toDate ? dayjs(filters.toDate) : null}
                                onChange={(newValue) =>
                                    setFilters((prev) => ({
                                        ...prev,
                                        toDate: newValue ? newValue.format("YYYY-MM-DD") : "",
                                    }))
                                }
                                slotProps={{
                                    textField: { size: "small", fullWidth: true },
                                }}
                            />
                        </LocalizationProvider>
                    </Grid>

                    {/* Month Filter (Optional) */}
                    {/* <Grid item xs={12} md={2}>
                        <TextField
                            select
                            label="Month (Optional)"
                            name="month"
                            size="small"
                            fullWidth
                            value={filters.month}
                            onChange={handleFilterChange}
                            SelectProps={{ native: true }}
                        >
                            <option value=""></option>
                            {monthOptions.map((m) => (
                                <option key={m.value} value={m.value}>
                                    {m.label}
                                </option>
                            ))}
                        </TextField>
                    </Grid> */}

                    {/* GO + CLEAR */}
                    {/* <Grid item xs={12} md={2} mt={{ xs: 1, md: 0 }}>
                        <Grid container spacing={1}> */}
                    <Grid item xs={6} md={1}>
                        <Button
                            variant="contained"
                            fullWidth
                            size="small"
                            onClick={loadReportAndSummary}
                            sx={{
                                height: "38px",
                                fontWeight: 700,
                                borderRadius: "10px",
                            }}
                        >
                            Search
                        </Button>
                    </Grid>
                    <Grid item xs={6} md={1}>
                        <Button
                            variant="outlined"
                            fullWidth
                            size="small"
                            onClick={handleClearFilters}
                            sx={{
                                height: "38px",
                                fontWeight: 600,
                                borderRadius: "10px",
                            }}
                        >
                            Clear
                        </Button>
                    </Grid>
                    {/* </Grid>
                    </Grid> */}
                </Grid>
            </Paper>
            {/* ===================== SUMMARY CARDS ===================== */}
            {/* ===================== SUMMARY CARDS ===================== */}
            <Grid container spacing={2} mb={3}>

                {/* Total Advertisements (only approved) */}
                <Grid item xs={12} md={3}>
                    <KPIBox
                        summaryData={{
                            label: 'Total Advertisements',
                            count: summary.totalAdvertisement,
                            color: '#1E88E5', // blue
                            icon: <ApprovalIcon fontSize="large" />,
                        }}
                    />
                </Grid>

                {/* Total Actual Cost */}
                <Grid item xs={12} md={3}>
                    <KPIBox
                        summaryData={{
                            label: 'Total Actual Cost',
                            // count: `₹ ${Number(summary.totalActualCost).toLocaleString("en-IN")}`,
                            count: summary.totalActualCost,
                            color: '#43A047',
                            icon: <CurrencyRupeeIcon fontSize="large" />,
                        }}
                    />
                </Grid>

                {/* Pending Approvals */}
                <Grid item xs={12} md={3}>
                    <KPIBox
                        summaryData={{
                            label: 'Pending Approvals',
                            count: summary.pendingApprovals,
                            color: '#FB8C00', // orange
                            icon: <HourglassTopIcon fontSize="large" />,
                        }}
                    />
                </Grid>

                {/* Expiring Soon */}
                <Grid item xs={12} md={3}>
                    <KPIBox
                        summaryData={{
                            label: 'Expiring Soon',
                            count: summary.expiringsoon,
                            color: '#E53935', // red
                            icon: <NotificationsActiveIcon fontSize="large" />,
                        }}
                    />
                </Grid>

            </Grid>
            {/* ===================== TABLE / LOADER ===================== */}
            {loading ? (
                <Box textAlign="center" mt={5}>
                    <CircularProgress />
                    <Typography mt={2}>Fetching advertising details...</Typography>
                </Box>
            ) : (
                <CommonReportTable
                    data={reportData}
                    columns={columns}
                    isListView={listView}
                    fileName="AdvertisingReport"
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
                        },
                    }}
                    muiTableBodyRowProps={{
                        sx: {
                            "&:nth-of-type(odd)": {
                                backgroundColor: "#fafafa",
                            },
                            "&:hover": {
                                backgroundColor: "#eef7ff",
                                transition: "0.2s",
                            },
                        },
                    }}
                />
            )}
        </Box>
    );
}
