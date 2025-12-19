import React, { useEffect, useMemo, useState } from "react";
import {
    Box,
    Grid,
    Paper,
    Typography,
    TextField,
    Autocomplete,
    Button,
    Chip
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { MaterialReactTable } from "material-react-table";
import dayjs from "dayjs";
import apiCalls from "apicall";
import { showToast } from "utils/toast-component";

export default function RewardReport() {
    const [orgId] = useState(localStorage.getItem("orgId"));
    const [loginUserName] = useState(localStorage.getItem("userName"));
    const [branch] = useState(localStorage.getItem("branch"));
    const [branchCode] = useState(localStorage.getItem("branchcode"));
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState([]);
    const [durationTypeList, setDurationTypeList] = useState([]);
    const [employees, setEmployee] = useState([]);
    const [departmentList, setDepartmentList] = useState([]);
    const [rewardNameList, setRewardNameList] = useState([]);
    const [targetBasisList, setTargetBasisList] = useState([]);
    const [filters, setFilters] = useState({
        periodType: "MONTHLY",
        employeeName: 'All',
        employeeCode: 'All',
        departmentId: 'All',
        rewardPolicyId: 'All',
        targetBasis: 'All'
    });
    useEffect(() => {
        getEmployeeDetails();
        getAllDepartment();
        getDurationType();
        getTargetBasis();
        getAllRewardName();
    }, []);
    const handleInputChange = (e) => {
        // works with native events and synthetic custom event shapes
        const target = e?.target || {};
        const name = target.name;
        const value = target.value;

        if (!name) return;

        setFilters((prev) => ({ ...prev, [name]: value }));
    };
    const handleSearch = async () => {
        if (!filters.periodType) {
            showToast("Period Type is mandatory");
            return;
        }
        setLoading(true);
        try {
            const response = await apiCalls("get", `/commonmaster/getEmployeeRewardDetails?branchCode=${branchCode}&department=${filters.departmentId}&orgId=${orgId}&periodType=${filters.periodType}&rewardName=${filters.rewardPolicyId}&type=${filters.targetBasis}&userName=${filters.employeeName}`);
            if (response?.status) {
                setData(response.paramObjectsMap.rewardInformation || []);
            } else {
                setData([]);
            }
        } catch (error) {
            console.error(error);
            setData([]);
        } finally {
            setLoading(false);
        }
    };

    const columns = useMemo(() => [
        {
            header: "Employee",
            size: 200,
            Cell: ({ row }) => (
                <Box>
                    <Typography fontWeight={600}>
                        {row.original.employeeName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        {row.original.employeeCode}
                    </Typography>
                </Box>
            )
        },
        {
            accessorKey: "periodType",
            header: "Period",
            size: 100,
            Cell: ({ cell }) => (
                <Chip
                    label={cell.getValue()}
                    size="small"
                    sx={{
                        backgroundColor: "#E3F2FD",
                        color: "#1565C0",
                        fontWeight: 500
                    }}
                />
            )
        },
        {
            accessorKey: "clientName",
            header: "Client",
            size: 160,
            Cell: ({ cell }) => (
                <Typography fontWeight={500}>
                    {cell.getValue()}
                </Typography>
            )
        },
        {
            accessorKey: "targetValue",
            header: "Target",
            size: 120,
            Cell: ({ cell }) => (
                <Typography fontWeight={600} color="text.secondary">
                    {cell.getValue() != null
                        ? Number(cell.getValue()).toLocaleString("en-IN")
                        : "-"}
                </Typography>
            )
        },
        {
            accessorKey: "totalAmount",
            header: "Achieved",
            size: 120,
            Cell: ({ row }) => {
                const achieved = Number(row.original.totalAmount) || 0;
                const target = Number(row.original.targetValue) || 0;

                const color =
                    achieved >= target ? "#2E7D32" : "#C62828"; // green / red

                return (
                    <Typography fontWeight={700} sx={{ color }}>
                        {achieved.toLocaleString("en-IN")}
                    </Typography>
                );
            }
        },
        {
            accessorKey: "percentage",
            header: "Achievement %",
            size: 150,
            Cell: ({ cell }) => {
                const value = Number(cell.getValue()) || 0;

                const chipStyle =
                    value >= 100
                        ? { bg: "#E8F5E9", color: "#2E7D32" }
                        : value >= 80
                            ? { bg: "#FFF8E1", color: "#EF6C00" }
                            : { bg: "#FDECEA", color: "#C62828" };

                return (
                    <Chip
                        label={`${value}%`}
                        size="small"
                        sx={{
                            backgroundColor: chipStyle.bg,
                            color: chipStyle.color,
                            fontWeight: 600,
                            minWidth: 70,
                            textAlign: "center"
                        }}
                    />
                );
            }
        },
        {
            accessorKey: "rewardName",
            header: "Reward Policy",
            size: 180,
            Cell: ({ cell }) => (
                <Typography fontWeight={500}>
                    {cell.getValue()}
                </Typography>
            )
        },
        {
            accessorKey: "rewardAmount",
            header: "Reward",
            size: 140,
            Cell: ({ row }) => {
                const isAmount = row.original.type === "Amount";
                const value = row.original.rewardAmount;

                return (
                    <Typography
                        fontWeight={700}
                        color={isAmount ? "primary.main" : "info.main"}
                    >
                        {isAmount
                            ? `₹ ${Number(value).toLocaleString("en-IN")}`
                            : value}
                    </Typography>
                );
            }
        }
    ], []);
    const getDurationType = async () => {
        try {
            const response = await apiCalls(
                "get",
                `/master/getAllListValues?listDescription=DurationType&orgId=${orgId}`
            );
            if (response?.status === true) {
                setDurationTypeList(response.paramObjectsMap?.listValues || []);
            } else {
                console.error("API Error:", response);
            }
        } catch (error) {
            console.error("Error fetching duration types:", error);
        }
    };
    const getEmployeeDetails = async () => {
        try {
            const response = await apiCalls('get', `/activities/getAssignedUserName?orgId=${orgId}`);
            setEmployee(response.paramObjectsMap.assginedUserName);
        } catch (error) {
            console.error('Error fetching assignees:', error);
            showToast('error', 'Failed to load assignees');
        }
    };
    const getAllDepartment = async () => {
        try {
            const response = await apiCalls('get', `commonmaster/getDepartmentByOrgId?orgId=${orgId}`);
            console.log('API Response:', response);

            if (response.status === true) {
                setDepartmentList(response.paramObjectsMap.departmentVO);
            } else {
                console.error('API Error:', response);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };
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
    const getTargetBasis = async () => {
        try {
            const response = await apiCalls(
                "get",
                `/master/getAllListValues?listDescription=targetBasis&orgId=${orgId}`
            );
            if (response?.status === true) {
                setTargetBasisList(response.paramObjectsMap?.listValues || []);
            } else {
                console.error("API Error:", response);
            }
        } catch (error) {
            console.error("Error fetching duration types:", error);
        }
    };
    return (
        <Box p={3}>
            <Paper sx={{ p: 2, mb: 2 }}>
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={2}>
                        <Autocomplete
                            options={durationTypeList}
                            getOptionLabel={(option) => (option?.listOfValues ? option.listOfValues : "")}
                            value={durationTypeList.find((item) => item.listOfValues === filters.periodType) || null}
                            onChange={(_, newValue) =>
                                handleInputChange({
                                    target: { name: "periodType", value: newValue?.listOfValues || "" },
                                })
                            }
                            isOptionEqualToValue={(option, value) => option?.listOfValues === value?.listOfValues}
                            renderInput={(params) => (
                                <TextField {...params} label="Duration Type" size="small" fullWidth />
                            )}
                            fullWidth
                        />
                    </Grid>
                    <Grid item xs={12} sm={2}>
                        <Autocomplete
                            options={[
                                { assignedUser: "All", assignedTo: "" }, // 👈 ALL option
                                ...employees
                            ]}
                            getOptionLabel={(option) =>
                                option.assignedUser === "All"
                                    ? "All"
                                    : `${option.assignedUser} - ${option.assignedTo}`
                            }
                            value={
                                filters.employeeName
                                    ? employees.find(
                                        (item) => item.assignedUser === filters.employeeName
                                    )
                                    : { assignedUser: "All", assignedTo: "" } // 👈 default ALL
                            }
                            onChange={(event, newValue) => {
                                if (!newValue || newValue.assignedUser === "All") {
                                    // ALL selected
                                    setFilters((prev) => ({
                                        ...prev,
                                        employeeName: "",
                                        employeeCode: ""
                                    }));
                                } else {
                                    setFilters((prev) => ({
                                        ...prev,
                                        employeeName: newValue.assignedUser,
                                        employeeCode: newValue.assignedTo
                                    }));
                                }
                            }}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Employee"
                                    size="small"
                                    fullWidth
                                />
                            )}
                        />
                    </Grid>
                    <Grid item xs={12} sm={2}>
                        <Autocomplete
                            options={[
                                { departmentName: "All" }, // 👈 ALL option
                                ...departmentList
                            ]}
                            getOptionLabel={(option) => option.departmentName || ""}
                            size="small"
                            value={
                                filters.departmentId
                                    ? departmentList.find(
                                        (d) => d.departmentName === filters.departmentId
                                    )
                                    : { departmentName: "All" } // 👈 default ALL
                            }
                            onChange={(event, newValue) => {
                                if (!newValue || newValue.departmentName === "All") {
                                    handleInputChange({
                                        target: { name: "departmentId", value: "" }
                                    });
                                } else {
                                    handleInputChange({
                                        target: { name: "departmentId", value: newValue.departmentName }
                                    });
                                }
                            }}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Department"
                                    size="small"
                                    fullWidth
                                    InputProps={{
                                        ...params.InputProps,
                                        style: { height: 40 }
                                    }}
                                />
                            )}
                        />
                    </Grid>
                    <Grid item xs={12} sm={2}>
                        <Autocomplete
                            options={[
                                { rewardName: "All" }, // 👈 ALL option
                                ...(rewardNameList || [])
                            ]}
                            getOptionLabel={(option) => option.rewardName || ""}
                            size="small"
                            value={
                                filters.rewardPolicyId
                                    ? rewardNameList.find(
                                        (r) => r.rewardName === filters.rewardPolicyId
                                    )
                                    : { rewardName: "All" } // 👈 default ALL
                            }
                            onChange={(event, newValue) => {
                                if (!newValue || newValue.rewardName === "All") {
                                    setFilters((prev) => ({
                                        ...prev,
                                        rewardPolicyId: ""
                                    }));
                                } else {
                                    setFilters((prev) => ({
                                        ...prev,
                                        rewardPolicyId: newValue.rewardName
                                    }));
                                }
                            }}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Reward Policy"
                                    size="small"
                                    fullWidth
                                />
                            )}
                        />
                    </Grid>
                    <Grid item xs={12} sm={2}>
                        <Autocomplete
                            options={[
                                { listOfValues: "All" }, // 👈 ALL option
                                ...targetBasisList
                            ]}
                            getOptionLabel={(option) => option.listOfValues || ""}
                            size="small"
                            value={
                                filters.targetBasis
                                    ? targetBasisList.find(
                                        (t) => t.listOfValues === filters.targetBasis
                                    )
                                    : { listOfValues: "All" } // 👈 default ALL
                            }
                            onChange={(event, newValue) => {
                                if (!newValue || newValue.listOfValues === "All") {
                                    handleInputChange({
                                        target: { name: "targetBasis", value: "" }
                                    });
                                } else {
                                    handleInputChange({
                                        target: {
                                            name: "targetBasis",
                                            value: newValue.listOfValues
                                        }
                                    });
                                }
                            }}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Target Basis"
                                    size="small"
                                    fullWidth
                                />
                            )}
                        />
                    </Grid>
                    <Grid item xs={12} sm={2} display="flex" alignItems="center">
                        <Button
                            variant="contained"
                            fullWidth
                            onClick={handleSearch}
                            sx={{ height: 40 }}
                        >
                            Search
                        </Button>
                    </Grid>
                </Grid>
            </Paper>

            {/* TABLE */}
            <MaterialReactTable
                columns={columns}
                data={data}
                state={{ isLoading: loading }}
                enableStickyHeader
                enableColumnActions={false}
                enableSorting
                initialState={{ density: "compact" }}
            />
        </Box>
    );
}
