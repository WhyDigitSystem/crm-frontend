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
    CardContent,
    Card
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

export default function CompanyTarget() {
    const [orgId] = useState(localStorage.getItem("orgId"));
    const [loginUserName] = useState(localStorage.getItem("userName"));
    const [branch] = useState(localStorage.getItem("branch"));
    const [branchCode] = useState(localStorage.getItem("branchcode"));
    const [finYear] = useState(localStorage.getItem("finYear"));

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
        periodType: '',
        targetBasis: '',
        targetValue: ''
    });
    const [fieldErrors, setFieldErrors] = useState({});
    const [targetBasisList, setTargetBasisList] = useState([]);
    const [durationTypeList, setDurationTypeList] = useState([]);
    const [listViewData, setListViewData] = useState([]);

    useEffect(() => {
        getDurationType();
        getTargetBasis();
    }, []);
    useEffect(() => {
        if (listView) {
            getAllCompanyTarget();
        }
    }, [pagination.pageIndex, pagination.pageSize, listView]);
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
    const getAllCompanyTarget = async () => {
        try {
            const limit = pagination.pageSize;
            const offset = pagination.pageIndex + 1;

            const result = await apiCalls("get",
                `/commonmaster/getAllCompanyTargetByOrgId?branchCode=${branchCode}&size=${limit}&page=${offset}&orgId=${orgId}`
            );
            const rows = result?.paramObjectsMap?.companyTargetVO?.data || [];
            const total = result?.paramObjectsMap?.companyTargetVO?.totalCount || 0;

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
    const getCompanyTargetById = async (row) => {
        const id = row?.original?.id;
        if (!id) return;
        setEditId(id);
        try {
            const response = await apiCalls(
                "get",
                `/commonmaster/getCompanyTargetById?id=${id}`
            );
            if (response?.status === true) {
                const reward = response.paramObjectsMap?.companyTargetVO || {};
                setFormData({
                    periodType: reward.periodType || "",
                    targetBasis: reward.type || "",
                    targetValue: reward.targetvalue || ""
                });
                setListView(false);
            } else {
                console.error("Get by id error:", response);
            }
        } catch (error) {
            console.error("Error fetching reward by ID:", error);
        }
    };
    const handleInputChange = (e) => {
        // works with native events and synthetic custom event shapes
        const target = e?.target || {};
        const name = target.name;
        const value = target.value;

        if (!name) return;

        setFormData((prev) => ({ ...prev, [name]: value }));
        setFieldErrors((prev) => ({ ...prev, [name]: "" }));
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
            periodType: '',
            targetBasis: '',
            targetValue: ''
        });
        setFieldErrors({});
    };

    const validateForm = () => {
        const errors = {};
        if (!formData.periodType) errors.periodType = "Period type required";
        if (!formData.targetBasis) errors.targetBasis = "Target Basis required";
        if (!formData.targetValue) errors.targetValue = "Target Value required";
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
        const saveFormData = {
            ...(editId && { id: editId }),
            orgId: parseInt(orgId),
            createdBy: loginUserName,
            branchCode,
            branch,
            finYear,
            periodType: formData.periodType,
            type: formData.targetBasis,
            targetvalue: formData.targetValue
        };
        try {
            const result = await apiCalls("put", `/commonmaster/createUpdateCompanyTarget`, saveFormData);
            if (result?.status === true) {
                showToast("success", editId ? "Company Target updated successfully" : "Company Target created successfully");
                handleClear();
                getAllCompanyTarget();
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
        { accessorKey: "periodType", header: "Period Type", size: 140 },
        { accessorKey: "type", header: "Target Basis ", size: 140 },
        { accessorKey: "targetvalue", header: "Target Value", size: 140 },
    ];
    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Grid container spacing={1}>
                <Grid item xs={12}>
                    <Paper
                        elevation={3}
                        style={{
                            padding: 14,
                            borderRadius: 16,
                            width: "100%",
                        }}
                    >
                        <Stack direction="row" spacing={1} className="mb-1">
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
                                        toEdit={getCompanyTargetById}
                                        pagination={pagination}
                                        setPagination={setPagination}
                                    />
                                </Grid>
                            </Grid>
                        ) : (
                            <Card sx={{ mb: 2 }}>
                                <CardContent>
                                    <Grid container spacing={2}>
                                        <Grid item xs={12} sm={3}>
                                            <Autocomplete
                                                options={durationTypeList}
                                                getOptionLabel={(option) => (option?.listOfValues ? option.listOfValues : "")}
                                                value={durationTypeList.find((item) => item.listOfValues === formData.periodType) || null}
                                                onChange={(_, newValue) =>
                                                    handleInputChange({
                                                        target: { name: "periodType", value: newValue?.listOfValues || "" },
                                                    })
                                                }
                                                isOptionEqualToValue={(option, value) => option?.listOfValues === value?.listOfValues}
                                                renderInput={(params) => (
                                                    <TextField {...params} label="Duration Type" size="small" fullWidth error={!!fieldErrors.periodType} />
                                                )}
                                                fullWidth
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={3}>
                                            <Autocomplete
                                                options={targetBasisList}
                                                getOptionLabel={(option) => (option?.listOfValues ? option.listOfValues : "")}
                                                value={targetBasisList.find((item) => item.listOfValues === formData.targetBasis) || null}
                                                onChange={(_, newValue) =>
                                                    handleInputChange({
                                                        target: { name: "targetBasis", value: newValue?.listOfValues || "" },
                                                    })
                                                }
                                                isOptionEqualToValue={(option, value) => option?.listOfValues === value?.listOfValues}
                                                renderInput={(params) => (
                                                    <TextField {...params} label="Target Basis" size="small" fullWidth error={!!fieldErrors.targetBasis} />
                                                )}
                                                fullWidth
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={3}>
                                            <TextField
                                                label="Target Value"
                                                name="targetValue"
                                                size="small"
                                                fullWidth
                                                value={formData.targetValue || ""}
                                                onChange={handleInputChange}
                                            />
                                        </Grid>
                                    </Grid>
                                </CardContent>
                            </Card>
                        )}
                    </Paper>

                    <ToastComponent />
                </Grid>
            </Grid>
        </motion.div>
    );
}
