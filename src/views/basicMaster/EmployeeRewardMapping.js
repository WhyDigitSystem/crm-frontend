import React, { useEffect, useState } from "react";
import {
  Box,
  Grid,
  TextField,
  Button,
  Autocomplete,
  Checkbox,
  FormControlLabel,
  Paper,
  Stack
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import apiCalls from "apicall";
import { motion } from "framer-motion";
import ActionButton from "utils/ActionButton";
import ClearIcon from "@mui/icons-material/Clear";
import SaveIcon from "@mui/icons-material/Save";
import AddIcon from "@mui/icons-material/Add";
import FormatListBulletedTwoToneIcon from "@mui/icons-material/FormatListBulletedTwoTone";
import ToastComponent, { showToast } from "utils/toast-component";
import ListviewTablepagi from "./ListviewTablepagi";

const EmployeeTargetAssignment = () => {
  const [formData, setFormData] = useState({
    employeeCode: null,
    employeeName: null,
    rewardPolicy: null,
    periodType: "",
    fromDate: null,
    toDate: null,
    targetValue: "",
    targetBasis: '',
    active: true
  });
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 5,
    totalCount: 0
  });
  useEffect(() => {
    getEmployeeDetails();
    getAllRewardName();
    getTargetBasis();
  }, []);

  const [fieldErrors, setFieldErrors] = useState({});

  const orgId = localStorage.getItem('orgId') || '';
  const branch = localStorage.getItem('branch') || '';
  const branchCode = localStorage.getItem('branchcode');
  const finYear = localStorage.getItem('finYear') || '';
  const loginUserName = localStorage.getItem('userName') || '';
  const [employees, setEmployee] = useState([]);
  const [rewardNameList, setRewardNameList] = useState([]);
  const [listView, setListView] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [editId, setEditId] = useState("");
  const [listViewData, setListViewData] = useState([]);
  const [targetBasisList, setTargetBasisList] = useState([]);
  const periodTypes = ["Monthly", "Quarterly", "Yearly"];
  const handleView = () => {
    setListView(prev => !prev);

    // reset pagination on entering listview
    setPagination({
      pageIndex: 0,
      pageSize: 5,
      totalCount: pagination.totalCount
    });
  };
  useEffect(() => {
    if (listView) {
      getAllEmployeeRewardMap();
    }
  }, [pagination.pageIndex, pagination.pageSize, listView]);
  const handleClear = () => {
    setEditId("");
    setFormData({
      employeeName: null,
      employeeCode: null,
      rewardPolicy: null,
      periodType: "",
      fromDate: null,
      toDate: null,
      targetValue: "",
      targetBasis: '',
      active: true
    });

    setFieldErrors({});
  };
  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
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
  const getEmployeeDetails = async () => {
    try {
      const response = await apiCalls('get', `/activities/getAssignedUserName?orgId=${orgId}`);
      setEmployee(response.paramObjectsMap.assginedUserName);
    } catch (error) {
      console.error('Error fetching assignees:', error);
      showToast('error', 'Failed to load assignees');
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
  const getEmployeeRewardMapping = async (row) => {
    const id = row?.original?.id;
    if (!id) return;
    setEditId(id);
    try {
      const response = await apiCalls(
        "get",
        `/commonmaster/getEmployeeRewardMappingById?id=${id}`
      );
      if (response?.status === true) {
        const reward = response.paramObjectsMap?.employeeRewardMappingVO || {};
        setFormData({
          employeeName: reward.employeeCode || "",
          employeeCode: reward.employeeName || "",
          rewardPolicy: reward.rewardPolicy || "",
          periodType: reward.periodType || "",
          fromDate: reward.validFrom || "",
          toDate: reward.validTo || "",
          targetValue: reward.targetvalue || "",
          targetBasis: reward.type || "",
          active: !!reward.active,
        });
        setListView(false);
      } else {
        console.error("Get by id error:", response);
      }
    } catch (error) {
      console.error("Error fetching reward by ID:", error);
    }
  };
  const validateForm = () => {
    const errors = {};
    if (!formData.employeeName) errors.employeeName = "Employee required";
    if (!formData.rewardPolicy) errors.rewardPolicy = "Reward Policy required";
    if (!formData.targetValue) errors.targetValue = "Target Value required";
    if (!formData.targetBasis) errors.targetBasis = "Target Basis required";
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
      employeeName: formData.employeeCode || '',
      employeeCode: formData.employeeName || '',
      periodType: formData.periodType || '',
      rewardPolicy: formData.rewardPolicy || '',
      type: formData.targetBasis || '',
      targetvalue: formData.targetValue || 0,
      validFrom: safeDate(formData.fromDate),
      validTo: safeDate(formData.toDate),
    };
    try {
      const result = await apiCalls("put", `/commonmaster/createUpdateEmployeeRewardMapping`, saveFormData);
      if (result?.status === true) {
        showToast("success", editId ? "Reward Mapping updated successfully" : "Reward Mapping created successfully");
        handleClear();
        getAllEmployeeRewardMap();
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
  const getAllEmployeeRewardMap = async () => {
    try {
      const limit = pagination.pageSize;
      const offset = pagination.pageIndex + 1;

      const result = await apiCalls("get",
        `/commonmaster/getAllEmployeeRewardMappingByOrgId?branchCode=${branchCode}&size=${limit}&page=${offset}&orgId=${orgId}`
      );
      const rows = result?.paramObjectsMap?.employeeRewardMappingVO?.data || [];
      const total = result?.paramObjectsMap?.employeeRewardMappingVO?.totalCount || 0;

      setListViewData(rows);

      // ⭐ prevent useless pagination updates
      setPagination(prev => {
        if (prev.totalCount === total) return prev; // avoid re-render loop
        return { ...prev, totalCount: total };
      });

      // detect last page
      // setHasMore(rows.length > 0);

    } catch (err) {
      console.error("Error loading policies:", err);
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
  const listViewColumns = [
    { accessorKey: "employeeName", header: "Employee", size: 200 },
    { accessorKey: "rewardPolicy", header: "Reward Policy", size: 140 },
    { accessorKey: "periodType", header: "period Type", size: 140 },
    { accessorKey: "type", header: "Target Basis", size: 140 },
    { accessorKey: "targetvalue", header: "Target Value", size: 140 },
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
                    toEdit={getEmployeeRewardMapping}
                    pagination={pagination}
                    setPagination={setPagination}
                  />
                </Grid>
              </Grid>
            ) : (
              <Grid container spacing={2}>

                <Grid item xs={12} sm={3}>
                  <Autocomplete
                    options={employees}
                    getOptionLabel={(option) => (option?.assignedUser ? `${option.assignedUser} - ${option.assignedTo}` : '')}
                    value={employees.find((item) => item.assignedUser === formData.employeeName) || null}
                    onChange={(event, newValue) => {
                      if (newValue) {
                        setFormData((prev) => ({
                          ...prev,
                          employeeName: newValue.assignedUser,
                          employeeCode: newValue.assignedTo,
                        }));
                        setFieldErrors((prev) => ({ ...prev, employeeName: '' }));
                      } else {
                        setFormData((prev) => ({ ...prev, employeeName: '' }));
                        setFieldErrors((prev) => ({ ...prev, employeeName: 'Employee is required' }));
                      }
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label={
                          <span>
                            Employee <span className="asterisk">*</span>
                          </span>
                        }
                        size="small"
                        error={!!fieldErrors.employeeName}
                        helperText={fieldErrors.employeeName}
                        fullWidth
                      />
                    )}
                  />
                </Grid>

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
                        (item) => item.rewardName === formData.rewardPolicy
                      ) || null
                    }
                    onChange={(event, newValue) => {
                      if (newValue) {
                        setFormData((prev) => ({
                          ...prev,
                          rewardPolicy: newValue.rewardName || '',
                        }));
                      } else {
                        setFormData((prev) => ({
                          ...prev,
                          rewardPolicy: '',
                        }));
                      }
                    }}
                    isOptionEqualToValue={(option, value) =>
                      option.rewardName === value.rewardPolicy
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

                <Grid item xs={12} sm={3}>
                  <Autocomplete
                    options={periodTypes}
                    value={formData.periodType}
                    onChange={(e, v) => handleChange("periodType", v)}
                    renderInput={(params) =>
                      <TextField {...params} label="Period Type" size="small" />
                    }
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
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <Grid item xs={12} sm={3}>
                    <DatePicker
                      label="Valid From"
                      format="DD-MM-YYYY"
                      value={formData.fromDate ? dayjs(formData.fromDate) : null}
                      onChange={(newValue) =>
                        handleInputChange({
                          target: { name: "fromDate", value: newValue ? newValue.format("YYYY-MM-DD") : "" }
                        })
                      }
                      slotProps={{
                        textField: {
                          size: "small",
                          error: !!fieldErrors.fromDate,
                          helperText: fieldErrors.fromDate,
                          fullWidth: true,
                        },
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={3}>
                    <DatePicker
                      label="Valid To"
                      format="DD-MM-YYYY"
                      value={formData.toDate ? dayjs(formData.toDate) : null}
                      onChange={(newValue) =>
                        handleInputChange({
                          target: { name: "toDate", value: newValue ? newValue.format("YYYY-MM-DD") : "" }
                        })
                      }
                      slotProps={{
                        textField: {
                          size: "small",
                          error: !!fieldErrors.toDate,
                          helperText: fieldErrors.toDate,
                          fullWidth: true,
                        },
                      }}
                    />
                  </Grid>
                </LocalizationProvider>
                {/* <Grid item xs={12} sm={3}>
          <DatePicker
            label="From Date"
            value={formData.fromDate}
            onChange={(v) => handleChange("fromDate", v)}
            slotProps={{ textField: { size: "small", fullWidth: true } }}
          />
        </Grid>

        <Grid item xs={12} sm={3}>
          <DatePicker
            label="To Date"
            value={formData.toDate}
            onChange={(v) => handleChange("toDate", v)}
            slotProps={{ textField: { size: "small", fullWidth: true } }}
          />
        </Grid> */}

                <Grid item xs={12} sm={3}>
                  <TextField
                    label="Target Value"
                    size="small"
                    fullWidth
                    value={formData.targetValue}
                    onChange={(e) => handleChange("targetValue", e.target.value)}
                  />
                </Grid>

                <Grid item xs={12} sm={3}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData.active}
                        onChange={(e) => handleChange("active", e.target.checked)}
                      />
                    }
                    label="Active"
                  />
                </Grid>

              </Grid>
            )}
          </Paper>

          <ToastComponent />
        </Grid>
      </Grid>
    </motion.div>
  );
};

export default EmployeeTargetAssignment;
