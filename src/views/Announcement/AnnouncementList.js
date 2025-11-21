// AnnouncementList.js
import React, { useEffect, useState, useMemo } from "react";
import {
    Box,
    Button,
    Grid,
    Typography,
    Tabs,
    Tab,
    TextField,
    InputAdornment,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
} from "@mui/material";
import apiCalls from "apicall";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import AnnouncementCard from "./AnnouncementCard";
import CreateAnnouncement from "./CreateAnnouncement";
import { getPermissions } from "utils/CommonFunctions";

const DeleteConfirmDialog = ({ open, onClose, onConfirm }) => (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
            <Typography>
                You are about to permanently delete this announcement. This action cannot be undone.
                Do you want to continue?
            </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button variant="outlined" onClick={onClose}>
                Cancel
            </Button>
            <Button variant="contained" color="error" onClick={onConfirm}>
                Delete Permanently
            </Button>
        </DialogActions>
    </Dialog>
);

const AnnouncementList = () => {
    const { canRead, canWrite } = getPermissions("ANN");

    const orgId = localStorage.getItem("orgId");
    const branchCode = localStorage.getItem("branchcode");

    // top-level hooks (always declared at top)
    const [tabData, setTabData] = useState([]); // categories
    const [tabValue, setTabValue] = useState("ALL");
    const [announcements, setAnnouncements] = useState([]);
    const [searchText, setSearchText] = useState("");
    const [openCreate, setOpenCreate] = useState(false);
    const [initialEditData, setInitialEditData] = useState(null);
    const [deleteId, setDeleteId] = useState(null);
    const [openDelete, setOpenDelete] = useState(false);
    const [loading, setLoading] = useState(false);

    // --- fetch category tabs (master) ---
    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                const res = await apiCalls(
                    "get",
                    `/master/getAllListValues?listDescription=Category&orgId=${orgId}`
                );
                if (mounted && res?.status) {
                    setTabData(res.paramObjectsMap?.listValues || []);
                }
            } catch (err) {
                console.error("Error fetching categories", err);
            }
        })();
        return () => (mounted = false);
    }, [orgId]);

    // --- fetch announcements (category-driven) ---
    const loadAnnouncements = async (tabValue) => {
        setLoading(true);
        try {
            // Backend expects "All" as default category, NOT empty string
            const categoryParam =
                tabValue === "ALL" ? "All" : tabValue;

            const res = await apiCalls(
                "get",
                `/announcement/getAnnouncementReport?branchCode=${branchCode}&category=${encodeURIComponent(
                    categoryParam
                )}&orgId=${orgId}`
            );

            if (res?.status) {
                const vo = res.paramObjectsMap?.announcementVO;
                const data = vo?.data ?? vo ?? [];
                setAnnouncements(Array.isArray(data) ? data : []);
            } else {
                setAnnouncements([]);
            }
        } catch (err) {
            console.error("Error fetching announcements", err);
            setAnnouncements([]);
        } finally {
            setLoading(false);
        }
    };

    // load whenever tabValue changes (or on mount)
    useEffect(() => {
        loadAnnouncements(tabValue);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tabValue]);

    // normalize priority display (HIGH -> High)
    const normalizePriority = (p) => {
        if (p === null || p === undefined) return "";
        try {
            const s = String(p);
            return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
        } catch {
            return p;
        }
    };

    // filteredData computed from announcements + search
    const filteredData = useMemo(() => {
        const text = (searchText || "").trim().toLowerCase();
        return announcements
            .map((it) => ({ ...it, priority: normalizePriority(it.priority) }))
            .filter((item) => {
                if (!item) return false;
                if (tabValue !== "ALL" && item.category !== tabValue) return false;
                if (!text) return true;
                return `${item.title || ""} ${item.description || ""}`.toLowerCase().includes(text);
            });
    }, [announcements, searchText, tabValue]);

    // counts for tabs (client-side)
    const getCount = (category) => {
        if (category === "ALL") return announcements.length;
        return announcements.filter((i) => i.category === category).length;
    };

    // handlers
    const handleOpenCreate = () => {
        setInitialEditData(null);
        setOpenCreate(true);
    };

    const handleEdit = (payload) => {
        setInitialEditData(payload);
        setOpenCreate(true);
    };

    const handleDeleteClick = (id) => {
        setDeleteId(id);
        setOpenDelete(true);
    };

    const confirmDelete = async () => {
        if (!deleteId) return;
        try {
            // your DELETE endpoint (GET with id param)
            const res = await apiCalls(
                "delete",
                `/announcement/getAnnouncementDelete?id=${encodeURIComponent(deleteId)}`
            );
            if (res?.status) {
                await loadAnnouncements(tabValue);
            } else {
                console.error("Delete failed", res);
            }
        } catch (err) {
            console.error("Delete API error", err);
        } finally {
            setOpenDelete(false);
            setDeleteId(null);
        }
    };

    const onSaved = async () => {
        setOpenCreate(false);
        setInitialEditData(null);
        await loadAnnouncements(tabValue);
    };

    if (!canRead) {
        return (
            <Typography variant="h6" color="error">
                You do not have permission to view this screen.
            </Typography>
        );
    }

    return (
        <Box p={3}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h5" fontWeight={600}>
                    CRM Announcements
                </Typography>

                {canWrite && (
                    <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenCreate}>
                        New Announcement
                    </Button>
                )}
            </Box>

            <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} sx={{ mb: 2 }}>
                <Tab label={`All (${getCount("ALL")})`} value="ALL" />
                {tabData.map((t) => (
                    <Tab
                        key={t.listOfValues}
                        label={`${t.listOfValues} (${getCount(t.listOfValues)})`}
                        value={t.listOfValues}
                    />
                ))}
            </Tabs>

            <Box display="flex" gap={2} mb={3}>
                <TextField
                    placeholder="Search announcements..."
                    fullWidth
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon />
                            </InputAdornment>
                        ),
                    }}
                />
            </Box>

            <Grid container spacing={2}>
                {filteredData.map((item) => (
                    <Grid item xs={12} md={4} key={item.id}>
                        <AnnouncementCard
                            data={item}
                            onEdit={() => handleEdit(item)}
                            onDelete={() => handleDeleteClick(item.id)}
                        />
                    </Grid>
                ))}

                {filteredData.length === 0 && (
                    <Box mx="auto" mt={5} textAlign="center">
                        <Typography>{loading ? "Loading..." : "No announcements found."}</Typography>
                    </Box>
                )}
            </Grid>

            <CreateAnnouncement
                open={openCreate}
                onClose={() => {
                    setOpenCreate(false);
                    setInitialEditData(null);
                }}
                initialData={initialEditData}
                onSaved={onSaved}
                categories={tabData} // pass categories to avoid duplicate fetch
            />

            <DeleteConfirmDialog open={openDelete} onClose={() => setOpenDelete(false)} onConfirm={confirmDelete} />
        </Box>
    );
};

export default AnnouncementList;
