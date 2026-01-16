// CreateAnnouncement.js
import React, { useEffect, useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogTitle,
    Box,
    TextField,
    Button,
    MenuItem,
    Autocomplete,
    Stack,
} from "@mui/material";
import dayjs from "dayjs";
import apiCalls from "apicall";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import ToastComponent, { showToast } from "utils/toast-component";

const priorities = ["High", "Medium", "Low"];

const CreateAnnouncement = ({ open, onClose, initialData = null, onSaved }) => {
    const orgId = localStorage.getItem("orgId");
    const loginUserName = localStorage.getItem("userName");
    const branchCode = localStorage.getItem("branchcode");

    const [isLoading, setIsLoading] = useState(false);
    const [categoryList, setCategoryList] = useState([]);
    const [editId, setEditId] = useState("");
    const [formData, setFormData] = useState({
        title: "",
        category: "",
        priority: "",
        description: "",
        validTill: "",
    });

    // if categories not passed, fetch them (backward compatible)
    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                const res = await apiCalls("get", `/master/getAllListValues?listDescription=Category&orgId=${orgId}`);
                if (mounted && res?.status) {
                    setCategoryList(res.paramObjectsMap?.listValues || []);
                }
            } catch (err) {
                console.error("Error fetching categories", err);
            }
        })();
        return () => (mounted = false);
    }, [open, orgId]);

    // fill form in edit mode
    useEffect(() => {
        if (initialData) {
            setEditId(initialData.id || "");
            setFormData({
                title: initialData.title || "",
                category: initialData.category || "",
                priority: initialData.priority || "",
                description: initialData.description || "",
                validTill: initialData.validTill || "",
            });
        } else {
            setEditId("");
            setFormData({
                title: "",
                category: "",
                priority: "",
                description: "",
                validTill: "",
            });
        }
    }, [initialData, open]);

    const handleClear = () => {
        setFormData({
            title: "",
            category: "",
            priority: "",
            description: "",
            validTill: "",
        });
        setEditId("");
    };

    const handleSubmit = async () => {
        setIsLoading(true);

        const payload = {
            ...(editId && { id: editId }),
            branchCode: branchCode,
            category: formData.category || "",
            createdBy: loginUserName,
            orgId: orgId,
            description: formData.description || "",
            priority: formData.priority || "",
            title: formData.title || "",
            validTill: formData.validTill || "",
        };

        try {
            const response = await apiCalls("put", `/announcement/createUpdateAnnouncement`, payload);
            if (response?.status === true) {
                showToast("success", editId ? "Announcement updated successfully" : "Announcement created successfully");
                handleClear();
                onSaved && onSaved(response);
            } else {
                showToast("error", editId ? "Announcement updation failed" : "Announcement creation failed");
            }
        } catch (error) {
            console.error("Error:", error);
            showToast("error", "Something went wrong");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>{editId ? "Edit Announcement" : "Create New Announcement"}</DialogTitle>
            <DialogContent>
                <Box display="flex" flexDirection="column" gap={2} mt={1}>
                    <TextField label="Title" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} fullWidth />

                    <Autocomplete
                        options={categoryList}
                        getOptionLabel={(option) => option?.listOfValues || ""}
                        value={categoryList.find((item) => item.listOfValues === formData.category) || null}
                        onChange={(_, newValue) => setFormData((prev) => ({ ...prev, category: newValue?.listOfValues || "" }))}
                        renderInput={(params) => <TextField {...params} label="Category" fullWidth name="category" />}
                    />

                    <TextField select label="Priority" value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: e.target.value })} fullWidth>
                        <MenuItem value="">None</MenuItem>
                        {priorities.map((p) => (
                            <MenuItem key={p} value={p}>
                                {p}
                            </MenuItem>
                        ))}
                    </TextField>

                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DatePicker
                            label="Valid Till"
                            format="DD-MM-YYYY"
                            disablePast
                            value={formData.validTill ? dayjs(formData.validTill) : null}
                            onChange={(newValue) => setFormData((prev) => ({ ...prev, validTill: newValue ? newValue.format("YYYY-MM-DD") : "" }))}
                            slotProps={{ textField: { fullWidth: true } }}
                        />
                    </LocalizationProvider>

                    <TextField label="Description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} fullWidth multiline rows={6} />

                    <Stack direction="row" justifyContent="flex-end" spacing={1}>
                        <Button variant="outlined" onClick={() => { handleClear(); onClose(); }}>
                            Cancel
                        </Button>
                        <Button variant="contained" onClick={handleSubmit} disabled={isLoading}>
                            {editId ? "Update" : "Save"}
                        </Button>
                    </Stack>
                </Box>
            </DialogContent>
        </Dialog>
    );
};

export default CreateAnnouncement;
