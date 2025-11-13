import React from "react";
import { Paper, Tabs, Tab, Typography, Divider, Box } from "@mui/material";
import RoomIcon from "@mui/icons-material/Room";
import ScheduleIcon from "@mui/icons-material/Schedule";
import PersonIcon from "@mui/icons-material/Person";

export default function LeadListPanel({ data, selectedLead, setSelectedLead, filterType, setFilterType, steps }) {
    const filteredLeads =
        filterType === "All" ? data : data.filter((d) => d.type === filterType);

    return (
        <Paper sx={{ p: 2, height: "85vh", overflowY: "auto", bgcolor: "#f9fafc" }}>
            <Tabs
                value={filterType}
                onChange={(e, v) => setFilterType(v)}
                variant="scrollable"
                scrollButtons="auto"
                sx={{
                    mb: 2,
                    "& .MuiTab-root": {
                        textTransform: "none",
                        borderRadius: "20px",
                        fontWeight: 600,
                    },
                }}
            >
                <Tab label="All" value="All" />
                <Tab icon={<ScheduleIcon />} iconPosition="start" label="Scheduled" value="Scheduled" />
                <Tab icon={<PersonIcon />} iconPosition="start" label="My Leads" value="MyLeads" />
            </Tabs>

            {filteredLeads.map((lead, i) => {
                const isSelected = selectedLead?.docId === lead.docId;
                return (
                    <Paper
                        key={i}
                        onClick={() => setSelectedLead(lead)}
                        sx={{
                            p: 2,
                            mb: 1.5,
                            borderRadius: 2,
                            cursor: "pointer",
                            border: isSelected ? "2px solid #1976d2" : "1px solid #e0e0e0",
                            bgcolor: isSelected ? "#f1f5ff" : "#fff",
                            transition: "0.3s",
                        }}
                    >
                        <Typography fontWeight={600} variant="subtitle1">
                            {lead.clientName || "Unknown"}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            <RoomIcon sx={{ fontSize: 16, mr: 0.5 }} /> {lead.address || "No address"}
                        </Typography>
                    </Paper>
                );
            })}

            {steps?.length > 0 && (
                <Box mt={2}>
                    <Divider />
                    <Typography fontWeight={600} mt={1} mb={1}>
                        Turn-by-Turn Directions
                    </Typography>
                    <Box sx={{ maxHeight: 200, overflowY: "auto" }}>
                        {steps.map((s, idx) => (
                            <Typography key={idx} variant="body2" sx={{ mb: 0.5 }} color="text.secondary">
                                • {s.instructions.replace(/<[^>]*>?/gm, "")}
                            </Typography>
                        ))}
                    </Box>
                </Box>
            )}
        </Paper>
    );
}
