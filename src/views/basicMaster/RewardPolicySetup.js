import React, { useEffect, useState } from "react";
import {
    Box,
    Grid,
    TextField,
    MenuItem,
    Button,
    Paper,
    Typography,
    Autocomplete,
    Checkbox,
    FormControlLabel,
    IconButton,
    Stack,
    Tabs,
    Tab,
} from "@mui/material";
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { motion } from "framer-motion";
import apiCalls from "apicall";
import ActionButton from "utils/ActionButton";
import ClearIcon from "@mui/icons-material/Clear";
import FormatListBulletedTwoToneIcon from "@mui/icons-material/FormatListBulletedTwoTone";
import SaveIcon from "@mui/icons-material/Save";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import CommonListViewTable from "./CommonListViewTable";
import ToastComponent, { showToast } from "utils/toast-component";
import dayjs from "dayjs";
import ListviewTablepagi from "./ListviewTablepagi";

export default function RewardPolicySetup() {
    const [orgId] = useState(localStorage.getItem("orgId"));
    const [loginUserName] = useState(localStorage.getItem("userName"));
    const [branch] = useState(localStorage.getItem("branch"));
    const [branchCode] = useState(localStorage.getItem("branchcode"));

    // UI state
    const [value, setValue] = useState(0); // tabs
    const [listView, setListView] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);

    // form state
    const [editId, setEditId] = useState("");
    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 5,
        totalCount: 0
    });
    const [formData, setFormData] = useState({
        rewardName: "",
        rewardType: "",
        statusName: "",
        validFrom: "",
        validTo: "",
        fixedTarget: "",
        description: "",
        active: true,
    });

    const [rangeDetails, setRangeDetails] = useState([
        { id: Date.now(), fromRange: "", toRange: "", rewards: "" },
    ]);

    const [fieldErrors, setFieldErrors] = useState({});
    const [rewardTypeList, setRewardTypeList] = useState([]);
    const [durationTypeList, setDurationTypeList] = useState([]);
    const [listViewData, setListViewData] = useState([]);

    useEffect(() => {
        getRewardType();
        getDurationType();
    }, []);
    useEffect(() => {
        if (listView) {
            getAllRewardPolicy();
        }
    }, [pagination.pageIndex, pagination.pageSize, listView]);
    // ---------- API calls ----------
    const getRewardType = async () => {
        try {
            const response = await apiCalls(
                "get",
                `/master/getAllListValues?listDescription=RewardType&orgId=${orgId}`
            );
            if (response?.status === true) {
                setRewardTypeList(response.paramObjectsMap?.listValues || []);
            } else {
                console.error("API Error:", response);
            }
        } catch (error) {
            console.error("Error fetching reward types:", error);
        }
    };

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
    const getAllRewardPolicy = async () => {
        try {
            const limit = pagination.pageSize;
            const offset = pagination.pageIndex * pagination.pageSize;

            const result = await apiCalls("get",
                `/master/getAllRewardPolicyByOrgId?limit=${limit}&offset=${offset}&orgId=${orgId}`
            );

            const rows = result?.paramObjectsMap?.data?.rewardPolicyVO || [];
            const total = result?.paramObjectsMap?.data?.totalCount || 0;

            setListViewData(rows);

            // ⭐ prevent useless pagination updates
            setPagination(prev => {
                if (prev.totalCount === total) return prev; // avoid re-render loop
                return { ...prev, totalCount: total };
            });

            // detect last page
            setHasMore(rows.length > 0);

        } catch (err) {
            console.error("Error loading policies:", err);
        }
    };
    const getRewardPolicyById = async (row) => {
        const id = row?.original?.id;
        if (!id) return;
        setEditId(id);
        try {
            const response = await apiCalls(
                "get",
                `/master/getRewardPolicyById?id=${id}`
            );
            if (response?.status === true) {
                const reward = response.paramObjectsMap?.rewardPolicyVO || {};
                setFormData({
                    rewardName: reward.rewardName || "",
                    rewardType: reward.rewardType || "",
                    statusName: reward.statusName || "",
                    validFrom: reward.fromDate || "",
                    validTo: reward.toDate || "",
                    fixedTarget: reward.fixedTarget || "",
                    description: reward.description || "",
                    active: !!reward.active,
                });

                setRangeDetails(
                    Array.isArray(reward.rewardPolicyDetailsVO) && reward.rewardPolicyDetailsVO.length
                        ? reward.rewardPolicyDetailsVO.map((d) => ({
                            id: d.id || Date.now(),
                            fromRange: d.fromRange || "",
                            toRange: d.toRange || "",
                            rewards: d.pointsPerActivity || "",
                        }))
                        : [{ id: Date.now(), fromRange: "", toRange: "", rewards: "" }]
                );

                setListView(false);
            } else {
                console.error("Get by id error:", response);
            }
        } catch (error) {
            console.error("Error fetching reward by ID:", error);
        }
    };

    // ---------- Handlers ----------
    const handleInputChange = (e) => {
        // works with native events and synthetic custom event shapes
        const target = e?.target || {};
        const name = target.name;
        const value = target.value;

        if (!name) return;

        setFormData((prev) => ({ ...prev, [name]: value }));
        setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    };

    const handleCheckboxChange = (e) => {
        const checked = e.target.checked;
        setFormData((prev) => ({ ...prev, active: checked }));
    };

    const handleTabChange = (_, newValue) => {
        setValue(newValue);
    };

    const handleAddRow = () => {
        setRangeDetails((prev) => [
            ...prev,
            { id: Date.now(), fromRange: "", toRange: "", rewards: "" },
        ]);
    };

    const handleRangeChange = (index, fieldName, value) => {
        setRangeDetails((prev) =>
            prev.map((item, i) => (i === index ? { ...item, [fieldName]: value } : item))
        );
    };

    const handleDeleteRow = (id) => {
        setRangeDetails((prev) => {
            const updated = prev.filter((r) => r.id !== id);
            return updated.length ? updated : [{ id: Date.now(), fromRange: "", toRange: "", rewards: "" }];
        });
    };

    const handleView = () => {
        setListView(prev => !prev);

        // reset pagination on entering listview
        setPagination({
            pageIndex: 0,
            pageSize: 5,
            totalCount: pagination.totalCount
        });
    };
    const handleClear = () => {
        setEditId("");
        setFormData({
            rewardName: "",
            rewardType: "",
            statusName: "",
            validFrom: "",
            validTo: "",
            fixedTarget: "",
            description: "",
            active: true,
        });
        setRangeDetails([{ id: Date.now(), fromRange: "", toRange: "", rewards: "" }]);
        setFieldErrors({});
    };

    const validateForm = () => {
        const errors = {};
        if (!formData.rewardName?.trim()) errors.rewardName = "Reward name is required";
        if (!formData.rewardType) errors.rewardType = "Reward type required";
        if (!formData.statusName) errors.statusName = "Duration required";
        if (!formData.validFrom) errors.validFrom = "Start date required";
        if (!formData.validTo) errors.validTo = "End date required";
        // add more rules as required
        return errors;
    };

    const handleSave = async () => {
        const errors = validateForm();
        if (Object.keys(errors).length) {
            setFieldErrors(errors);
            showToast("error", "Please fix validation errors");
            return;
        }

        setIsLoading(true);

        const safeDate = (dateValue) =>
            dateValue && dayjs(dateValue).isValid() ? dayjs(dateValue).format("YYYY-MM-DD") : null;

        const saveFormData = {
            ...(editId && { id: editId }),
            orgId: parseInt(orgId),
            createdBy: loginUserName,
            branchCode,
            branch,
            active: !!formData.active,
            rewardName: formData.rewardName,
            rewardType: formData.rewardType,
            description: formData.description,
            statusName: formData.statusName,
            fixedTarget: formData.fixedTarget || null,
            fromDate: safeDate(formData.validFrom),
            toDate: safeDate(formData.validTo),
            rewardPolicyDetailsDTO: rangeDetails.map((r) => ({
                fromRange: r.fromRange || null,
                toRange: r.toRange || null,
                pointsPerActivity: r.rewards || null,
            })),
        };

        try {
            const result = await apiCalls("put", `/master/createUpdateRewardPolicy`, saveFormData);
            if (result?.status === true) {
                showToast("success", editId ? "Reward updated successfully" : "Reward created successfully");
                handleClear();
                getAllRewardPolicy();
            } else {
                showToast("error", result?.paramObjectsMap?.errorMessage || "Save failed");
            }
        } catch (err) {
            console.error("Save error:", err);
            showToast("error", "Error occurred while saving");
        } finally {
            setIsLoading(false);
        }
    };

    // list view columns (adjust as required by CommonListViewTable)
    const listViewColumns = [
        { accessorKey: "rewardName", header: "Reward Name", size: 200 },
        { accessorKey: "rewardType", header: "Reward Type", size: 140 },
        { accessorKey: "fixedTarget", header: "Fixed Target", size: 140 },
        { accessorKey: "active", header: "Active", size: 80 },
    ];

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Grid container spacing={2}>
                <Grid item xs={12}>
                    <Paper
                        elevation={3}
                        style={{
                            padding: 24,
                            borderRadius: 16,
                            width: "100%",
                        }}
                    >
                        <Stack direction="row" spacing={1} className="mb-3">
                            {listView && <ActionButton title="New Entry" icon={AddIcon} onClick={handleView} />}
                            {!listView && (
                                <>
                                    <ActionButton title="List View" icon={FormatListBulletedTwoToneIcon} onClick={handleView} />
                                    <ActionButton title="Clear" icon={ClearIcon} onClick={handleClear} />
                                    <ActionButton title="Save" icon={SaveIcon} onClick={handleSave} />
                                </>
                            )}
                        </Stack>
                        {listView && !isLoading ? (
                            <Grid container spacing={1} sx={{ mt: 2 }}>
                                <Grid item xs={12}>
                                    <ListviewTablepagi
                                        data={listViewData}
                                        columns={listViewColumns}
                                        enableEditing
                                        toEdit={getRewardPolicyById}
                                        pagination={pagination}
                                        setPagination={setPagination}
                                    />
                                </Grid>
                            </Grid>
                        ) : (
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={3}>
                                    <TextField
                                        fullWidth
                                        label="Reward Name"
                                        size="small"
                                        placeholder="Enter reward name"
                                        name="rewardName"
                                        value={formData.rewardName}
                                        onChange={handleInputChange}
                                        error={!!fieldErrors.rewardName}
                                        helperText={fieldErrors.rewardName}
                                    />
                                </Grid>

                                <Grid item xs={12} sm={3}>
                                    <Autocomplete
                                        options={rewardTypeList}
                                        getOptionLabel={(option) => (option?.listOfValues ? option.listOfValues : "")}
                                        value={rewardTypeList.find((item) => item.listOfValues === formData.rewardType) || null}
                                        onChange={(_, newValue) =>
                                            handleInputChange({
                                                target: { name: "rewardType", value: newValue?.listOfValues || "" },
                                            })
                                        }
                                        isOptionEqualToValue={(option, value) => option?.listOfValues === value?.listOfValues}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                label="Reward Type"
                                                size="small"
                                                fullWidth
                                                error={!!fieldErrors.rewardType}
                                            />
                                        )}
                                        fullWidth
                                    />
                                </Grid>
                                <Grid item xs={12} sm={3}>
                                    <Autocomplete
                                        options={durationTypeList}
                                        getOptionLabel={(option) => (option?.listOfValues ? option.listOfValues : "")}
                                        value={durationTypeList.find((item) => item.listOfValues === formData.statusName) || null}
                                        onChange={(_, newValue) =>
                                            handleInputChange({
                                                target: { name: "statusName", value: newValue?.listOfValues || "" },
                                            })
                                        }
                                        isOptionEqualToValue={(option, value) => option?.listOfValues === value?.listOfValues}
                                        renderInput={(params) => (
                                            <TextField {...params} label="Duration Type" size="small" fullWidth error={!!fieldErrors.statusName} />
                                        )}
                                        fullWidth
                                    />
                                </Grid>
                                <Grid item xs={12} sm={3}>
                                    <TextField
                                        fullWidth
                                        type="number"
                                        label="Fixed Target"
                                        size="small"
                                        name="fixedTarget"
                                        value={formData.fixedTarget}
                                        onChange={handleInputChange}
                                    />
                                </Grid>
                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                    <Grid item xs={12} sm={3}>
                                        <DatePicker
                                            label="Valid From"
                                            format="DD-MM-YYYY"
                                            value={formData.validFrom ? dayjs(formData.validFrom) : null}
                                            onChange={(newValue) =>
                                                handleInputChange({
                                                    target: { name: "validFrom", value: newValue ? newValue.format("YYYY-MM-DD") : "" }
                                                })
                                            }
                                            slotProps={{
                                                textField: {
                                                    size: "small",
                                                    error: !!fieldErrors.validFrom,
                                                    helperText: fieldErrors.validFrom,
                                                    fullWidth: true,
                                                },
                                            }}
                                        />
                                    </Grid>

                                    <Grid item xs={12} sm={3}>
                                        <DatePicker
                                            label="Valid To"
                                            format="DD-MM-YYYY"
                                            value={formData.validTo ? dayjs(formData.validTo) : null}
                                            onChange={(newValue) =>
                                                handleInputChange({
                                                    target: { name: "validTo", value: newValue ? newValue.format("YYYY-MM-DD") : "" }
                                                })
                                            }
                                            slotProps={{
                                                textField: {
                                                    size: "small",
                                                    error: !!fieldErrors.validTo,
                                                    helperText: fieldErrors.validTo,
                                                    fullWidth: true,
                                                },
                                            }}
                                        />
                                    </Grid>
                                </LocalizationProvider>
                                <Grid item xs={12} sm={3}>
                                    <FormControlLabel
                                        control={<Checkbox checked={!!formData.active} onChange={handleCheckboxChange} />}
                                        label="Active"
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        multiline
                                        rows={3}
                                        label="Description"
                                        size="small"
                                        placeholder="Write details here..."
                                        name="description"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                    />
                                </Grid>
                                {/* Range / Slab Section */}
                                <Grid item xs={12}>
                                    <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                                        <Tabs value={value} onChange={handleTabChange} textColor="secondary" indicatorColor="secondary">
                                            <Tab value={0} label="Range Details" />
                                        </Tabs>
                                    </Box>

                                    <Box sx={{ p: 2 }}>
                                        <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                                            <ActionButton title="Add" icon={AddIcon} onClick={handleAddRow} />
                                        </Stack>

                                        <div className="table-responsive">
                                            <table className="table table-bordered">
                                                <thead>
                                                    <tr style={{ background: "#374151", color: "#fff" }}>
                                                        <th style={{ width: "80px" }} className="text-center">Action</th>
                                                        <th style={{ width: "40px" }} className="text-center">#</th>
                                                        <th className="text-center">From (Range)</th>
                                                        <th className="text-center">To (Range)</th>
                                                        <th className="text-center">Reward Points / Amt</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {rangeDetails.map((row, index) => (
                                                        <tr key={row.id}>
                                                            <td className="text-center align-middle">
                                                                <IconButton size="small" onClick={() => handleDeleteRow(row.id)}>
                                                                    <DeleteIcon />
                                                                </IconButton>
                                                            </td>
                                                            <td className="text-center align-middle">{index + 1}</td>
                                                            <td className="align-middle">
                                                                <TextField
                                                                    fullWidth
                                                                    type="number"
                                                                    size="small"
                                                                    value={row.fromRange}
                                                                    onChange={(e) => handleRangeChange(index, "fromRange", e.target.value)}
                                                                    placeholder="From"
                                                                />
                                                            </td>
                                                            <td className="align-middle">
                                                                <TextField
                                                                    fullWidth
                                                                    type="number"
                                                                    size="small"
                                                                    value={row.toRange}
                                                                    onChange={(e) => handleRangeChange(index, "toRange", e.target.value)}
                                                                    placeholder="To"
                                                                />
                                                            </td>
                                                            <td className="align-middle">
                                                                <TextField
                                                                    fullWidth
                                                                    type="number"
                                                                    size="small"
                                                                    value={row.rewards}
                                                                    onChange={(e) => handleRangeChange(index, "rewards", e.target.value)}
                                                                    placeholder="Reward"
                                                                />
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </Box>
                                </Grid>
                            </Grid>
                        )}
                    </Paper>

                    <ToastComponent />
                </Grid>
            </Grid>
        </motion.div>
    );
}
