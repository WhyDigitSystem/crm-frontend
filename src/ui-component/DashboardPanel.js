import React from "react";
import { Box, Stack, Typography, Button, Select, MenuItem } from "@mui/material";
import NavigationIcon from "@mui/icons-material/Navigation";
import PauseIcon from "@mui/icons-material/Pause";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import StopIcon from "@mui/icons-material/Stop";
import StraightenIcon from "@mui/icons-material/Straighten";
import AccessTimeIcon from "@mui/icons-material/AccessTime";

export default function DashboardPanel({
    tracking,
    paused,
    reached,
    travelMode,
    setTravelMode,
    startTracking,
    stopTracking,
    setPaused,
    distanceText,
    durationText,
    speed,
    eta,
}) {
    return (
        <Box
            sx={{
                position: "absolute",
                bottom: 16,
                left: 16,
                backdropFilter: "blur(12px)",
                bgcolor: "rgba(255,255,255,0.8)",
                borderRadius: 3,
                px: 2,
                py: 1.5,
                boxShadow: 5,
                display: "flex",
                alignItems: "center",
                gap: 2,
            }}
        >
            <Select size="small" value={travelMode} onChange={(e) => setTravelMode(e.target.value)}>
                <MenuItem value="DRIVING">Driving</MenuItem>
                <MenuItem value="WALKING">Walking</MenuItem>
                <MenuItem value="BICYCLING">Cycling</MenuItem>
            </Select>

            {!tracking ? (
                <Button variant="contained" startIcon={<NavigationIcon />} onClick={startTracking}>
                    Start
                </Button>
            ) : paused ? (
                <Button color="success" variant="contained" startIcon={<PlayArrowIcon />} onClick={() => setPaused(false)}>
                    Resume
                </Button>
            ) : (
                <Button color="warning" variant="contained" startIcon={<PauseIcon />} onClick={() => setPaused(true)}>
                    Pause
                </Button>
            )}

            {tracking && (
                <Button color="error" variant="outlined" startIcon={<StopIcon />} onClick={stopTracking}>
                    Stop
                </Button>
            )}

            <Stack direction="row" spacing={1} alignItems="center">
                <StraightenIcon color="primary" />
                <Typography>{distanceText}</Typography>
            </Stack>
            <Stack direction="row" spacing={1} alignItems="center">
                <AccessTimeIcon color="secondary" />
                <Typography>{durationText}</Typography>
            </Stack>

            {speed && <Typography color="primary">Speed: {speed}</Typography>}
            {eta && <Typography color="secondary">ETA: {eta}</Typography>}
            {reached && <Typography color="success.main">🎯 Reached</Typography>}
        </Box>
    );
}
