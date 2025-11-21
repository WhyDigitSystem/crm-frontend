// AnnouncementCard.js
import React, { useState } from "react";
import {
    Card,
    CardContent,
    Typography,
    Chip,
    Stack,
    Box,
    IconButton,
    Menu,
    MenuItem,
} from "@mui/material";
import CampaignIcon from "@mui/icons-material/Campaign";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import { getPermissions } from "utils/CommonFunctions";

const priorityColor = {
    High: "error",
    Medium: "warning",
    Low: "success",
};

const AnnouncementCard = ({ data, onEdit, onDelete }) => {
    const { canRead, canWrite, canDelete } = getPermissions("ANN");
    const [anchorEl, setAnchorEl] = useState(null);
    const [expanded, setExpanded] = useState(false);
    const open = Boolean(anchorEl);

    const handleMenuClick = (e) => setAnchorEl(e.currentTarget);
    const handleClose = () => setAnchorEl(null);

    const handleEditClick = () => {
        handleClose();
        onEdit && onEdit(data);
    };

    const handleDeleteClick = () => {
        handleClose();
        onDelete && onDelete(data.id);
    };

    return (
        <Card
            elevation={0}
            sx={{
                borderRadius: 3,
                padding: 1,
                background: "linear-gradient(145deg,#ffffff,#fbfbfb)",
                border: "1px solid #eee",
                boxShadow: "0 3px 12px rgba(0,0,0,0.06)",
                transition: "transform .15s ease, box-shadow .15s ease",
                display: "flex",
                flexDirection: "column",
                height: "100%",
                "&:hover": { transform: "translateY(-4px)", boxShadow: "0 6px 18px rgba(0,0,0,0.12)" },
            }}
        >
            <CardContent sx={{ flexGrow: 1 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={1}>
                    <Stack direction="row" spacing={1} alignItems="center">
                        <Chip
                            icon={<CampaignIcon />}
                            label={data.category}
                            size="small"
                            sx={{ bgcolor: "#e9f5ff", color: "#0b6fb3", fontWeight: 700 }}
                        />
                        {data.priority && (
                            <Chip
                                label={data.priority}
                                color={priorityColor[data.priority]}
                                size="small"
                                sx={{ fontWeight: 700, textTransform: "capitalize" }}
                            />
                        )}
                    </Stack>

                    {(canWrite || canDelete) && <Box>
                        <IconButton size="small" onClick={handleMenuClick}>
                            <MoreVertIcon />
                        </IconButton>

                        <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
                            {canWrite && <MenuItem onClick={handleEditClick}>
                                <EditIcon sx={{ mr: 1 }} /> Edit
                            </MenuItem>}
                            {canDelete && <MenuItem onClick={handleDeleteClick}>
                                <DeleteIcon sx={{ mr: 1, color: "error.main" }} /> Delete
                            </MenuItem>}
                        </Menu>
                    </Box>}
                </Stack>

                <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>
                    {data.title}
                </Typography>

                <Box>
                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                            overflow: "hidden",
                            display: "-webkit-box",
                            WebkitLineClamp: expanded ? "none" : 3,
                            WebkitBoxOrient: "vertical",
                        }}
                    >
                        {data.description}
                    </Typography>

                    <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
                        <Stack direction="row" spacing={1} alignItems="center">
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                Posted by:
                            </Typography>
                            <Typography variant="body2" sx={{ color: "#1976d2", fontWeight: 600 }}>
                                {data.createdBy}
                            </Typography>
                        </Stack>

                        <Stack direction="row" alignItems="center" spacing={0.5}>
                            <AccessTimeIcon sx={{ fontSize: 16, color: "gray" }} />
                            <Typography variant="caption" color="gray">
                                {data.createdTimeAgo}
                            </Typography>

                            <IconButton size="small" onClick={() => setExpanded((s) => !s)}>
                                {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                            </IconButton>
                        </Stack>
                    </Box>
                </Box>
            </CardContent>
        </Card>
    );
};

export default AnnouncementCard;
