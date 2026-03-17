import React, { useEffect, useState, useRef } from "react";
import {
    Box,
    Grid,
    TextField,
    Card,
    CardContent,
    Typography,
    MenuItem,
    Button,
    Autocomplete,
    IconButton,
    Dialog,
    DialogContent,
    Avatar,
    Chip,
    Stack
} from "@mui/material";
import ThumbUpAltIcon from "@mui/icons-material/ThumbUpAlt";
import ThumbDownAltIcon from "@mui/icons-material/ThumbDownAlt";
import SaveIcon from '@mui/icons-material/Save';
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import AddIcon from '@mui/icons-material/Add';
import ClearIcon from '@mui/icons-material/Clear';
import FormatListBulletedTwoToneIcon from '@mui/icons-material/FormatListBulletedTwoTone';
import ControlCameraIcon from "@mui/icons-material/ControlCamera";
import dayjs from "dayjs";
import ActionButton from "utils/ActionButton";
import ToastComponent, { showToast } from "utils/toast-component";
import apiCalls from "apicall";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import FullScreenLoader from "utils/FullScreenLoader";
import ListviewTablepagi from "./ListviewTablepagi";
import ConfirmationModal from "utils/confirmationPopup";

export default function AdvertisingMaster() {
    const screenAccess = JSON.parse(localStorage.getItem("screenAccess") || "{}");
    const canApprove = screenAccess?.AM?.canApprove || false; // AM for ADVERTISEMENT screen

    const [orgId] = useState(localStorage.getItem("orgId"));
    const [loginUserName] = useState(localStorage.getItem("userName"));
    const [branch] = useState(localStorage.getItem("branch"));
    const [branchCode] = useState(localStorage.getItem("branchcode"));
    const [finYear] = useState(localStorage.getItem("finYear"));

    const [showForm, setShowForm] = useState(true);
    const [editId, setEditId] = useState("");
    const [hasMore, setHasMore] = useState(true);

    const [openPreview, setOpenPreview] = useState(false);
    const [previewTitle, setPreviewTitle] = useState("");
    const [previewSrc, setPreviewSrc] = useState("");

    // action/approval related
    const [approveStatus, setApproveStatus] = useState("");
    const [actionType, setActionType] = useState(""); // 'Approved' | 'reject'

    // default to empty object to avoid null read errors
    const [advertisement, setAdvertisement] = useState({});

    const [listViewData, setListViewData] = useState([]);
    const [cityList, setCityList] = useState([]);
    const [dealerList, setDealerList] = useState([]);
    const [advertisemnetTypeList, setAdvertisemnetTypeList] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 5,
        totalCount: 0
    });
    const [photos, setPhotos] = useState({
        beforePhoto: null,
        afterPhoto: null,
    });

    const mountedRef = useRef(true);
    useEffect(() => {
        mountedRef.current = true;
        return () => { mountedRef.current = false; };
    }, []);

    const [formData, setFormData] = useState({
        name: "",
        type: "",
        size: "",
        quantity: "",
        validFrom: "",
        validTill: "",
        estimatedCost: "",
        actualCost: "",
        description: "",
        vendorName: "",
        status: "",
        location: "",
        city: "",
        state: "",
        country: "",
        approvedBy: "",
        approvedDate: "",
        followUpDate: "",
        beforePhoto: null,
        afterPhoto: null,
    });

    const handleCloseModal = () => setModalOpen(false);

    // Confirmation handler (called when user confirms in modal)
    const handleAction = async (data, action) => {
        if (!data || !data.id) {
            showToast('error', 'No advertisement selected for action');
            return;
        }
        setIsLoading(true);
        try {
            const result = await apiCalls(
                'put',
                `/checkin/approveAdvertisement?action=${action}&actionBy=${loginUserName}&id=${data.id}&orgId=${orgId}`
            );

            if (result?.status === true) {
                const newAd = result.paramObjectsMap?.advertisementVO || {};
                const newStatus = newAd?.approveStatus || action;
                showToast(
                    newStatus === 'APPROVED' ? 'success' : 'info',
                    newStatus === 'APPROVED' ? 'Advertisement approved successfully' : 'Advertisement updated'
                );
                // refresh list
                await getAllAdvertisement();
                // refresh loaded advertisement if same
                if (advertisement?.id === data.id) {
                    await getAdvertisementById({ original: { id: data.id } });
                }
            } else {
                showToast('error', result?.paramObjectsMap?.message || 'Operation failed');
                console.error('API Error:', result);
            }
        } catch (error) {
            console.error('Error performing action:', error);
            showToast('error', 'Something went wrong while performing action');
        } finally {
            setIsLoading(false);
            setModalOpen(false);
        }
    };

    // Generic handler for inputs and files
    const handleChange = (e) => {
        if (!e || !e.target) return;

        const { name, value, files } = e.target;

        // File upload
        if (files && files.length) {
            const file = files[0];
            if (!file.type.startsWith("image/")) {
                showToast("error", "Please upload a valid image (PNG or JPEG).");
                return;
            }
            setFormData((prev) => ({ ...prev, [name]: file }));
            return;
        }

        // Prevent negative values for numeric fields
        if (["quantity", "estimatedCost", "actualCost"].includes(name)) {
            if (value < 0) return; // block negative typing
        }

        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const handlePhotoUpload = (field, file) => {
        if (!file) return;
        if (!file.type.startsWith("image/")) {
            showToast("error", "Please upload a PNG / JPEG image");
            return;
        }
        setPhotos(prev => ({ ...prev, [field]: file }));
    };

    const handleClosePreview = () => {
        // revoke object URL if we created one
        if (previewSrc && previewSrc.startsWith("blob:")) {
            try { URL.revokeObjectURL(previewSrc); } catch (e) { /* ignore */ }
        }
        setPreviewSrc("");
        setPreviewTitle("");
        setOpenPreview(false);
    };

    // API fetches — execute once
    useEffect(() => {
        getCityName();
        getAdvertisementType();
        getDealerAndDistributor();
        getAllAdvertisement();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // re-fetch when pagination changes (pageIndex/pageSize)
    useEffect(() => {
        getAllAdvertisement();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pagination.pageIndex, pagination.pageSize]);

    const getAdvertisementType = async () => {
        try {
            const response = await apiCalls(
                "get",
                `/master/getAllListValues?listDescription=AdvertisementType&orgId=${orgId}`
            );
            if (response?.status === true) {
                setAdvertisemnetTypeList(response.paramObjectsMap?.listValues || []);
            } else {
                console.error("API Error:", response);
            }
        } catch (error) {
            console.error("Error fetching advertisement types:", error);
        }
    };

    const getDealerAndDistributor = async () => {
        try {
            const response = await apiCalls("get", `/dealer/getDealerAndDistributorName?orgId=${orgId}`);
            if (response?.status === true) {
                setDealerList(response.paramObjectsMap?.dealerAndDistributorNames || []);
            } else {
                console.error("API Error:", response);
            }
        } catch (error) {
            console.error("Error fetching dealers:", error);
        }
    };

    const getCityName = async () => {
        try {
            const response = await apiCalls("get", `/commonmaster/getCityNameFromMaster?orgId=${orgId}`);
            if (response?.status === true) {
                setCityList(response.paramObjectsMap?.cityName || []);
            } else {
                console.error("API Error:", response);
            }
        } catch (error) {
            console.error("Error fetching city list:", error);
        }
    };

    const getAllAdvertisement = async () => {
        try {
            const limit = pagination.pageSize;
            const page = pagination.pageIndex + 1; // backend expects page starting at 1

            const result = await apiCalls("get",
                `/checkin/getAllAdvertisementByOrgId?count=${limit}&orgId=${orgId}&page=${page}`
            );

            // backend might return different wrapper names; try common ones
            const rows =
                result?.paramObjectsMap?.rewardPolicyVO?.data.reverse() ||
                [];

            const total =
                result?.paramObjectsMap?.rewardPolicyVO?.totalCount ||
                0;

            setListViewData(rows || []);

            // update pagination totalCount if changed
            setPagination(prev => {
                if (prev.totalCount === total) return prev;
                return { ...prev, totalCount: total };
            });

            // detect last page based on total count
            const more = page * limit < (total || 0);
            setHasMore(more);

        } catch (err) {
            console.error("Error loading advertisements:", err);
            // keep previous state intact
        }
    };

    const getAdvertisementById = async (row) => {
        const id = row?.original?.id;
        if (!id) return;

        setEditId(id);

        try {
            const response = await apiCalls("get", `/checkin/getAdvertisementById?id=${id}`);

            if (response?.status) {
                const ad = response.paramObjectsMap?.advertisementVO || response.paramObjectsMap?.data || {};
                setAdvertisement(ad || {});

                setFormData({
                    name: ad.name || "",
                    type: ad.type || "",
                    size: ad.size || "",
                    quantity: ad.quantity || "",
                    validFrom: ad.validFrom || "",
                    validTill: ad.validTill || "",
                    estimatedCost: ad.estimatedCost || "",
                    actualCost: ad.actualCost || "",
                    description: ad.description || "",
                    vendorName: ad.vendorName || "",
                    status: ad.status || "",
                    location: ad.location || "",
                    city: ad.city || "",
                    state: ad.state || "",
                    country: ad.country || "",
                    beforePhoto: ad.beforePhoto || null,
                    afterPhoto: ad.afterPhoto || null,
                });

                // show preview images (base64 or file path)
                setPhotos({
                    beforePhoto: ad.beforePhoto || null,
                    afterPhoto: ad.afterPhoto || null,
                });

                // update approveStatus (defensive)
                const aStatus = ad.approveStatus ?? ad.approvedStatus ?? "";
                setApproveStatus(aStatus);

                // show form
                setShowForm(true);
            }
        } catch (err) {
            console.error("Get by ID failed:", err);
        }
    };

    const handleSave = async () => {
        setIsLoading(true);

        if (formData.quantity < 0) {
            showToast("error", "Quantity cannot be negative");
            return;
        }

        if (formData.estimatedCost < 0) {
            showToast("error", "Estimated cost cannot be negative");
            return;
        }

        if (formData.actualCost < 0) {
            showToast("error", "Actual cost cannot be negative");
            return;
        }

        const formatDate = (date) => (date ? dayjs(date).format("YYYY-MM-DD") : null);

        const payload = {
            ...(editId && { id: editId }),
            branch: branch,
            orgId: orgId,
            branchCode: branchCode,
            finYear: finYear,
            createdBy: loginUserName,
            actualCost: formData.actualCost || 0,
            city: formData.city || "",
            country: formData.country || "",
            description: formData.description || "",
            estimatedCost: formData.estimatedCost || 0,
            location: formData.location || "",
            name: formData.name || "",
            quantity: formData.quantity || "",
            size: formData.size || "",
            state: formData.state || "",
            status: formData.status || "",
            type: formData.type || "",
            vendorName: formData.vendorName || "",
            validFrom: formatDate(formData.validFrom),
            validTill: formatDate(formData.validTill),
            followUpDate: formatDate(formData.validTill),
        };

        try {
            const response = await apiCalls("put", "/checkin/createUpdateAdvertisement", payload);

            if (response?.status) {
                showToast("success", editId ? "Advertisement updated" : "Advertisement created");

                const id = response.paramObjectsMap?.advertisementVO?.id || response.paramObjectsMap?.id;
                if (id) {
                    // upload before/after images if available
                    await uploadBothImages(id);
                } else {
                    console.warn("Save response did not include id.");
                }

                handleClear();
                await getAllAdvertisement();
            } else {
                showToast("error", response.paramObjectsMap?.message || "Failed to save");
            }
        } catch (err) {
            console.error("Save error:", err);
            showToast("error", "Something went wrong");
        } finally {
            if (mountedRef.current) setIsLoading(false);
        }
    };

    const uploadBothImages = async (id) => {
        try {
            if (photos.beforePhoto && photos.beforePhoto instanceof File) {
                const fd1 = new FormData();
                fd1.append("file", photos.beforePhoto);

                await apiCalls(
                    "post",
                    `/checkin/uploadBeforPhotoInBloob?id=${id}`,
                    fd1,
                    {},
                    { "Content-Type": "multipart/form-data" }
                );
            }

            if (photos.afterPhoto && photos.afterPhoto instanceof File) {
                const fd2 = new FormData();
                fd2.append("file", photos.afterPhoto);

                await apiCalls(
                    "post",
                    `/checkin/uploadAfterPhotoInBloob?id=${id}`,
                    fd2,
                    {},
                    { "Content-Type": "multipart/form-data" }
                );
            }
        } catch (error) {
            console.error("Image upload failed:", error);
            showToast("error", "Image upload failed");
        }
    };

    const getPreviewSrc = (file) => {
        if (!file) return "";
        if (file instanceof File) return URL.createObjectURL(file);
        // if it's already data URI or path, return as-is
        if (typeof file === 'string' && (file.startsWith('data:') || file.startsWith('http') || file.startsWith('/')))
            return file;
        return `data:image/jpeg;base64,${file}`;
    };

    const handleRemovePhoto = (field) => {
        setPhotos(prev => ({ ...prev, [field]: null }));
        handleClosePreview();
    };

    const handleOpenPreview = (field) => {
        const file = photos[field];
        if (!file) return;
        // create object URL if file is a File
        const src = getPreviewSrc(file);
        // revoke previous if it was a blob
        if (previewSrc && previewSrc.startsWith("blob:")) {
            try { URL.revokeObjectURL(previewSrc); } catch (e) { /* ignore */ }
        }
        setPreviewSrc(src);
        setPreviewTitle(field === "beforePhoto" ? "Before Photo" : "After Photo");
        setOpenPreview(true);
    };

    const handleList = () => {
        setShowForm(!showForm);
    };
    const handleClear = () => {
        // revoke any created blob urls for preview
        if (previewSrc && previewSrc.startsWith("blob:")) {
            try { URL.revokeObjectURL(previewSrc); } catch (e) { /* ignore */ }
        }

        setPhotos({
            beforePhoto: null,
            afterPhoto: null,
        });
        setFormData({
            name: "",
            type: "",
            size: "",
            quantity: "",
            validFrom: "",
            validTill: "",
            estimatedCost: "",
            actualCost: "",
            description: "",
            vendorName: "",
            status: "",
            location: "",
            city: "",
            state: "",
            country: "",
            approvedBy: "",
            approvedDate: "",
            followUpDate: "",
            beforePhoto: null,
            afterPhoto: null,
        });
        setEditId("");
        setAdvertisement({});
        setApproveStatus("");
    };

    const listViewColumns = [
        { accessorKey: "name", header: "Dealer Name", size: 200 },
        { accessorKey: "type", header: "Type", size: 140 },
        { accessorKey: "estimatedCost", header: "Estimated Cost", size: 140 },
        { accessorKey: "actualCost", header: "Actual Cost", size: 140 },
        { accessorKey: "status", header: "Status", size: 80 },
    ];

    const openApproveModal = () => {
        setActionType('Approved');
        setModalOpen(true);
    };

    const openRejectModal = () => {
        setActionType('reject');
        setModalOpen(true);
    };

    // decide when to show approve/reject buttons
    const canShowApproveButtons = canApprove && (approveStatus === 'Pending' || approveStatus === '' || approveStatus == null);

    return (
        <Box p={3} sx={{ background: "#f5f5f5", minHeight: "100vh" }}>
            {isLoading && <FullScreenLoader open={isLoading} />}
            <Card sx={{ mb: 2 }}>
                <CardContent>
                    <Box
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                        flexWrap="wrap"
                        paddingBottom={2}
                    >
                        <Box display="flex" alignItems="center">
                            {!showForm && (
                                <ActionButton title="New Entry" icon={AddIcon} onClick={handleList} />
                            )}

                            {showForm && (
                                <>
                                    <ActionButton title="List View" icon={FormatListBulletedTwoToneIcon} onClick={handleList} />
                                    <ActionButton title="Clear" icon={ClearIcon} onClick={handleClear} />
                                    <ActionButton title="Save" icon={SaveIcon} onClick={handleSave} />
                                </>
                            )}
                        </Box>

                        <Box display="flex" alignItems="center" gap={1}>
                            {showForm && canShowApproveButtons && advertisement?.approveStatus === 'Pending' && (
                                <>
                                    <ActionButton
                                        title="Approve"
                                        icon={ThumbUpAltIcon}
                                        onClick={openApproveModal}
                                        color="#16a34a"
                                    />
                                    <ActionButton title="Reject" icon={ThumbDownAltIcon} onClick={openRejectModal} color="#dc2626" />
                                </>
                            )}
                            {/* ALWAYS show Approved/Rejected info if already approved/rejected */}
                            {showForm && (
                                <>
                                    {advertisement?.approveStatus === 'Approved' && (
                                        <Stack direction="row" spacing={2}>
                                            <Chip
                                                label={`Approved By: ${advertisement?.approveBy || "-"}`}
                                                variant="outlined"
                                                color="success"
                                            />
                                            <Chip
                                                label={`Approved On: ${advertisement?.approveOn || "-"}`}
                                                variant="outlined"
                                                color="success"
                                            />
                                        </Stack>
                                    )}

                                    {advertisement?.approveStatus === 'reject' && (
                                        <Stack direction="row" spacing={2}>
                                            <Chip
                                                label={`Rejected By: ${advertisement?.approveBy || "-"}`}
                                                variant="outlined"
                                                color="error"
                                            />
                                            <Chip
                                                label={`Rejected On: ${advertisement?.approveOn || "-"}`}
                                                variant="outlined"
                                                color="error"
                                            />
                                        </Stack>
                                    )}
                                </>
                            )}
                        </Box>
                    </Box>

                    {showForm ? (
                        <Grid container spacing={2}>
                            {/* Dealer Name */}
                            <Grid item xs={12} md={3}>
                                <Autocomplete
                                    options={dealerList || []}
                                    disabled={approveStatus === 'Approved' || approveStatus === 'reject'}
                                    getOptionLabel={(option) => option?.name || ""}
                                    value={dealerList.find((item) => item.name === formData.name) || null}
                                    onChange={(e, val) =>
                                        setFormData((prev) => ({
                                            ...prev,
                                            name: val ? val.name : "",
                                        }))
                                    }
                                    renderInput={(params) => <TextField {...params} label="Dealer Name" size="small" fullWidth name="name" />}
                                />
                            </Grid>

                            {/* Location */}
                            <Grid item xs={12} md={3}>
                                <TextField fullWidth size="small" label="Location / Area" name="location" disabled={approveStatus === 'Approved' || approveStatus === 'reject'} value={formData.location} onChange={handleChange} />
                            </Grid>

                            {/* City */}
                            <Grid item xs={12} md={3}>
                                <Autocomplete
                                    options={cityList}
                                    disabled={approveStatus === 'Approved' || approveStatus === 'reject'}
                                    getOptionLabel={(option) => option?.city || ""}
                                    value={cityList.find((item) => item.city === formData.city) || null}
                                    onChange={(event, newValue) => {
                                        if (newValue) {
                                            setFormData((prev) => ({ ...prev, city: newValue.city, state: newValue.state, country: newValue.country || "" }));
                                        } else {
                                            setFormData((prev) => ({ ...prev, city: "", state: "", country: "" }));
                                        }
                                    }}
                                    renderInput={(params) => <TextField {...params} label="City" size="small" fullWidth name="city" />}
                                />
                            </Grid>

                            {/* Advertisement Type */}
                            <Grid item xs={12} md={3}>
                                <Autocomplete
                                    options={advertisemnetTypeList}
                                    disabled={approveStatus === 'Approved' || approveStatus === 'reject'}
                                    getOptionLabel={(option) => option?.listOfValues || ""}
                                    value={advertisemnetTypeList.find((item) => item.listOfValues === formData.type) || null}
                                    onChange={(_, newValue) => setFormData((prev) => ({ ...prev, type: newValue?.listOfValues || "" }))}
                                    renderInput={(params) => <TextField {...params} label="Advertisement Type" size="small" fullWidth name="type" />}
                                />
                            </Grid>

                            {/* Size */}
                            <Grid item xs={12} md={3}>
                                <TextField fullWidth size="small" disabled={approveStatus === 'Approved' || approveStatus === 'reject'} label="Size / Dimension" name="size" value={formData.size} onChange={handleChange} />
                            </Grid>

                            {/* Quantity */}
                            <Grid item xs={12} md={3}>
                                <TextField
                                    fullWidth
                                    size="small"
                                    label="Quantity"
                                    type="number"
                                    name="quantity"
                                    value={formData.quantity}
                                    onChange={handleChange}
                                    inputProps={{ min: 0 }}
                                />
                            </Grid>

                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <Grid item xs={12} sm={3}>
                                    <DatePicker
                                        label="Valid From"
                                        disabled={approveStatus === 'Approved' || approveStatus === 'reject'}
                                        format="DD-MM-YYYY"
                                        value={formData.validFrom ? dayjs(formData.validFrom) : null}
                                        onChange={(newValue) =>
                                            setFormData((prev) => ({ ...prev, validFrom: newValue ? newValue.format("YYYY-MM-DD") : "" }))
                                        }
                                        slotProps={{ textField: { size: "small", fullWidth: true } }}
                                    />
                                </Grid>

                                <Grid item xs={12} sm={3}>
                                    <DatePicker
                                        label="Valid Till"
                                        disabled={approveStatus === 'Approved' || approveStatus === 'reject'}
                                        format="DD-MM-YYYY"
                                        value={formData.validTill ? dayjs(formData.validTill) : null}
                                        onChange={(newValue) => setFormData((prev) => ({ ...prev, validTill: newValue ? newValue.format("YYYY-MM-DD") : "" }))}
                                        slotProps={{ textField: { size: "small", fullWidth: true } }}
                                    />
                                </Grid>
                            </LocalizationProvider>

                            {/* Costs */}
                            <Grid item xs={12} md={3}>
                                <TextField
                                    fullWidth
                                    size="small"
                                    label="Estimated Cost"
                                    type="number"
                                    name="estimatedCost"
                                    value={formData.estimatedCost}
                                    onChange={handleChange}
                                    inputProps={{ min: 0 }}
                                />
                            </Grid>

                            <Grid item xs={12} md={3}>
                                <TextField
                                    fullWidth
                                    size="small"
                                    label="Actual Cost"
                                    type="number"
                                    name="actualCost"
                                    value={formData.actualCost}
                                    onChange={handleChange}
                                    inputProps={{ min: 0 }}
                                />
                            </Grid>

                            {/* Vendor */}
                            <Grid item xs={12} md={3}>
                                <TextField fullWidth size="small" disabled={approveStatus === 'Approved' || approveStatus === 'reject'} label="Vendor / Painter Name" name="vendorName" value={formData.vendorName} onChange={handleChange} />
                            </Grid>

                            {/* Status */}
                            <Grid item xs={12} md={3}>
                                <TextField select fullWidth size="small" label="Status" disabled={approveStatus === 'Approved' || approveStatus === 'reject'} name="status" value={formData.status} onChange={handleChange}>
                                    <MenuItem value="Pending">Pending</MenuItem>
                                    <MenuItem value="Completed">Completed</MenuItem>
                                </TextField>
                            </Grid>

                            {/* Description */}
                            <Grid item xs={12} md={6}>
                                <TextField fullWidth size="small" disabled={approveStatus === 'Approved' || approveStatus === 'reject'} multiline label="Description" name="description" value={formData.description} onChange={handleChange} />
                            </Grid>

                            {/* Before Photo */}
                            <Grid item xs={12} md={3}>
                                <Box display="flex" alignItems="center" gap={1}>
                                    <Button
                                        variant="outlined"
                                        disabled={approveStatus === 'Approved' || approveStatus === 'reject'}
                                        component="label"
                                        startIcon={<CloudUploadIcon />}
                                        sx={{
                                            color: "#374151",
                                            borderColor: "#374151",
                                            borderRadius: "12px",
                                            "&:hover": {
                                                borderColor: "#374151",
                                                backgroundColor: "rgba(193,86,255,0.08)",
                                            },
                                        }}
                                    >
                                        {photos.beforePhoto ? (photos.beforePhoto.name || 'Before Photo') : "Before Photo"}
                                        <input
                                            type="file"
                                            hidden
                                            accept="image/*"
                                            onChange={(e) => handlePhotoUpload("beforePhoto", e.target.files?.[0])}
                                        />
                                    </Button>

                                    {photos.beforePhoto && (
                                        <>
                                            <IconButton onClick={() => handleOpenPreview("beforePhoto")}>
                                                <ControlCameraIcon />
                                            </IconButton>
                                        </>
                                    )}
                                </Box>
                            </Grid>

                            {/* After Photo */}
                            <Grid item xs={12} md={3}>
                                <Box display="flex" alignItems="center" gap={1}>
                                    <Button
                                        variant="outlined"
                                        component="label"
                                        disabled={approveStatus === 'Approved' || approveStatus === 'reject'}
                                        startIcon={<CloudUploadIcon />}
                                        sx={{
                                            color: "#374151",
                                            borderColor: "#374151",
                                            borderRadius: "12px",
                                            "&:hover": {
                                                borderColor: "#374151",
                                                backgroundColor: "rgba(193,86,255,0.08)",
                                            },
                                        }}
                                    >
                                        {photos.afterPhoto ? (photos.afterPhoto.name || 'After Photo') : "After Photo"}
                                        <input
                                            type="file"
                                            hidden
                                            accept="image/*"
                                            onChange={(e) => handlePhotoUpload("afterPhoto", e.target.files?.[0])}
                                        />
                                    </Button>

                                    {photos.afterPhoto && (
                                        <>
                                            <IconButton onClick={() => handleOpenPreview("afterPhoto")}>
                                                <ControlCameraIcon />
                                            </IconButton>
                                        </>
                                    )}
                                </Box>
                            </Grid>
                        </Grid>
                    ) : (
                        <ListviewTablepagi
                            data={listViewData}
                            columns={listViewColumns}
                            enableEditing
                            toEdit={getAdvertisementById}
                            pagination={pagination}
                            setPagination={setPagination}
                        />
                    )}
                </CardContent>
            </Card>

            {/* Preview Dialog */}
            <Dialog open={openPreview} onClose={handleClosePreview} maxWidth="sm" fullWidth>
                <DialogContent sx={{ display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column", gap: 2 }}>
                    <Typography variant="h6">{previewTitle}</Typography>
                    {previewSrc ? (
                        <>
                            <Avatar
                                src={previewSrc}
                                alt={previewTitle}
                                variant="rounded"
                                sx={{ width: "100%", height: "auto", borderRadius: 1 }}
                            />
                            <Box display="flex" gap={2} mt={2}>
                                <Button onClick={() => {
                                    if (previewTitle === "Before Photo") handleRemovePhoto("beforePhoto");
                                    else handleRemovePhoto("afterPhoto");
                                }}>
                                    Delete
                                </Button>
                                <Button onClick={handleClosePreview}>Close</Button>
                            </Box>
                        </>
                    ) : (
                        <Typography>No image to preview</Typography>
                    )}
                </DialogContent>
            </Dialog>

            {/* Toast placeholder if your ToastComponent needs to be rendered */}
            <ToastComponent />

            <ConfirmationModal
                open={modalOpen}
                title="Advertisement Approval"
                message={`Are you sure you want to ${actionType === 'Approved' ? 'Approved' : 'reject'} this Advertisement?`}
                onConfirm={() => handleAction(advertisement, actionType)}
                onCancel={handleCloseModal}
            />
        </Box>
    );
}
