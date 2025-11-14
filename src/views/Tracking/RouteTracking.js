import React, { useEffect, useState, useRef, useCallback } from "react";
import {
    Box,
    Grid,
    Tabs,
    Tab,
    Paper,
    Typography,
    CircularProgress,
    Stack,
    Button,
    Divider,
    Fade,
    IconButton,
    Overlay,
} from "@mui/material";
import {
    GoogleMap,
    Marker,
    OverlayView,
    Polyline,
} from "@react-google-maps/api";
import ScheduleIcon from "@mui/icons-material/Schedule";
import PersonIcon from "@mui/icons-material/Person";
import StraightenIcon from "@mui/icons-material/Straighten";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import RoomIcon from "@mui/icons-material/Room";
import NavigationIcon from "@mui/icons-material/Navigation";
import ReplayIcon from "@mui/icons-material/Replay";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import ZoomOutIcon from "@mui/icons-material/ZoomOut";
import apiCalls from "apicall";
import { useGoogleMapLoader } from "utils/googleMapLoader";

const FALLBACK_CENTER = { lat: 12.9716, lng: 77.5946 };
const containerStyle = { width: "100%", height: "85vh" };
const firstLetter = (name = "") => (name ? name.trim()[0].toUpperCase() : "?");
const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;

export default function RouteTracking() {
    // ---- localStorage mappings (confirmed by you) ----
    const orgId = localStorage.getItem("orgId") || "";
    const branchCode = localStorage.getItem("branchcode") || "";
    const loginUserName = localStorage.getItem("userName") || ""; // used as createdBy / employeeCode
    const employeeName = localStorage.getItem("employeeName") || "";
    const employeeCode = localStorage.getItem("employeeCode") || "";
    const branch = localStorage.getItem("branch") || "";
    const finYear = localStorage.getItem("finYear") || "";

    // ---- state ----
    const [startPos, setStartPos] = useState(null);
    const [filterType, setFilterType] = useState("All");
    const [filteredData, setFilteredData] = useState([]);
    const [selectedLead, setSelectedLead] = useState(null);
    const [directions, setDirections] = useState(null);
    const [distanceText, setDistanceText] = useState("");
    const [durationText, setDurationText] = useState("");
    const [loadingRoute, setLoadingRoute] = useState(false);
    const [currentPosition, setCurrentPosition] = useState(null);
    const [tracking, setTracking] = useState(false);
    const [arrowPos, setArrowPos] = useState(null);
    const [steps, setSteps] = useState([]);
    const [reached, setReached] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    const watchIdRef = useRef(null);
    const mapRef = useRef(null);
    const { isLoaded } = useGoogleMapLoader();

    // travel mode is fixed to DRIVING (2-wheeler approx)
    const travelMode = "DRIVING";

    // -------------------- Smart geocode cache --------------------
    const buildGeocodeKey = (address) => `geocode_${orgId}_${branchCode}_${address}`;

    const geocodeAddress = async (address) => {
        if (!address) return null;
        const cacheKey = buildGeocodeKey(address);
        const cachedRaw = localStorage.getItem(cacheKey);

        if (cachedRaw) {
            try {
                const cached = JSON.parse(cachedRaw);
                const isExpired = Date.now() - (cached.timestamp || 0) > THIRTY_DAYS;
                const addressChanged = cached.address !== address;
                if (!isExpired && !addressChanged && cached.lat != null && cached.lng != null) {
                    return { lat: cached.lat, lng: cached.lng };
                }
            } catch (e) {
                console.warn("Invalid geocode cache entry, ignoring...", e);
            }
        }

        const geocoder = new window.google.maps.Geocoder();
        return new Promise((resolve) => {
            geocoder.geocode({ address }, (results, status) => {
                if (status === "OK" && results && results[0]) {
                    const loc = results[0].geometry.location;
                    const coords = {
                        lat: loc.lat(),
                        lng: loc.lng(),
                        address,
                        timestamp: Date.now(),
                    };
                    try {
                        localStorage.setItem(cacheKey, JSON.stringify(coords));
                    } catch (e) {
                        console.warn("Could not save geocode to localStorage", e);
                    }
                    resolve({ lat: coords.lat, lng: coords.lng });
                } else {
                    resolve(null);
                }
            });
        });
    };

    // -------------------- Helpers --------------------
    const calcDistance = (p1, p2) => {
        if (!p1 || !p2) return Infinity;
        const R = 6371; // km
        const dLat = ((p2.lat - p1.lat) * Math.PI) / 180;
        const dLng = ((p2.lng - p1.lng) * Math.PI) / 180;
        const a =
            Math.sin(dLat / 2) ** 2 +
            Math.cos((p1.lat * Math.PI) / 180) *
            Math.cos((p2.lat * Math.PI) / 180) *
            Math.sin(dLng / 2) ** 2;
        return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    };

    // -------------------- Fetch leads & schedules --------------------
    useEffect(() => {
        let mounted = true;
        const getLeadAndSchedule = async () => {
            try {
                const [leadsRes, scheduleRes] = await Promise.all([
                    apiCalls(
                        "get",
                        `/transaction/getMyLeads?assginedName=${loginUserName}&branchCode=${branchCode}&orgId=${orgId}`
                    ),
                    apiCalls(
                        "get",
                        `/activities/getScheduleAssignedUserName?assginedName=${loginUserName}&branchCode=${branchCode}&finYear=${finYear}&orgId=${orgId}`
                    ),
                ]);

                const leads = leadsRes.paramObjectsMap?.myLeads || [];
                const schedules = scheduleRes.paramObjectsMap?.clientLists || [];

                // geocode all entries with caching
                const geocodedLeads = await Promise.all(
                    leads.map(async (lead) => {
                        const coords = await geocodeAddress(lead.address || "");
                        return {
                            ...lead,
                            latitude: coords?.lat ?? FALLBACK_CENTER.lat,
                            longitude: coords?.lng ?? FALLBACK_CENTER.lng,
                            type: "MyLeads",
                        };
                    })
                );

                const geocodedSchedules = await Promise.all(
                    schedules.map(async (sch) => {
                        const coords = await geocodeAddress(sch.address || "");
                        return {
                            ...sch,
                            latitude: coords?.lat ?? FALLBACK_CENTER.lat,
                            longitude: coords?.lng ?? FALLBACK_CENTER.lng,
                            type: "Scheduled",
                        };
                    })
                );

                if (mounted) setFilteredData([...geocodedLeads, ...geocodedSchedules]);
            } catch (err) {
                console.error(err);
                if (mounted) setErrorMsg("❌ Failed to fetch or geocode data.");
            }
        };

        if (isLoaded) getLeadAndSchedule();
        return () => (mounted = false);
    }, [isLoaded]);

    // -------------------- Directions --------------------
    const drawRoute = useCallback(
        async (lead) => {
            if (!isLoaded || !window.google || !currentPosition || !lead) return;
            setLoadingRoute(true);
            const service = new window.google.maps.DirectionsService();
            service.route(
                {
                    origin: currentPosition,
                    destination: { lat: +lead.latitude, lng: +lead.longitude },
                    travelMode: window.google.maps.TravelMode.DRIVING,
                },
                (result, status) => {
                    if (status === "OK" && result) {
                        const leg = result.routes[0].legs[0];
                        setDirections(result);
                        setDistanceText(leg.distance?.text || "");
                        setDurationText(leg.duration?.text || "");
                        setSteps(leg.steps || []);
                        setArrowPos(currentPosition);
                    } else {
                        setErrorMsg("⚠️ Route could not be calculated. Try again.");
                    }
                    setLoadingRoute(false);
                }
            );
        },
        [isLoaded, currentPosition]
    );

    // -------------------- Tracking: get current position once map ready --------------------
    useEffect(() => {
        if (!navigator.geolocation) {
            setErrorMsg("❌ Geolocation not supported by your browser.");
            setCurrentPosition(FALLBACK_CENTER);
            return;
        }

        const getCurrent = () => {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
                    setCurrentPosition(loc);
                    if (mapRef.current) mapRef.current.panTo(loc);
                },
                (err) => {
                    console.warn("⚠️ Error getting current position:", err);
                    setErrorMsg("⚠️ Unable to get your location.");
                    setCurrentPosition(FALLBACK_CENTER);
                },
                { enableHighAccuracy: true, timeout: 10000 }
            );
        };

        if (isLoaded) getCurrent();
    }, [isLoaded]);

    // -------------------- API call: save START/END point --------------------
    const saveRoutePoint = async (lat, lng, type) => {
        const payload = {
            branch: branch || "",
            branchCode: branchCode || "",
            createdBy: loginUserName || "",
            employeeCode: employeeCode || loginUserName || "",
            employeeName: employeeName || loginUserName || "",
            id: 0,
            latitude: lat,
            longitude: lng,
            orgId: Number(orgId) || 0,
            type: type,
        };

        try {
            const res = await apiCalls("post", "/officialworkroute/calculateOfficialRoute", payload);
            // If backend returns calculated KM, set it in UI if present
            if (res?.paramObjectsMap?.distance) {
                setDistanceText(`${res.paramObjectsMap.distance} km`);
            }
            return res;
        } catch (err) {
            console.error("Error saving KM entry", err);
            setErrorMsg("⚠️ Failed to save route point.");
            return null;
        }
    };

    // -------------------- Start / Stop tracking --------------------
    const startTracking = async () => {
        if (!selectedLead) return alert("Select a destination first");

        if (currentPosition) {
            setStartPos(currentPosition); // save start point
            await saveRoutePoint(currentPosition.lat, currentPosition.lng, "START");
        }

        setTracking(true);
        drawRoute(selectedLead);

        watchIdRef.current = navigator.geolocation.watchPosition(
            (pos) => {
                const newPos = { lat: pos.coords.latitude, lng: pos.coords.longitude };
                setCurrentPosition(newPos);
                mapRef.current?.panTo(newPos);
                setArrowPos(newPos);

                // live ETA update using DistanceMatrixService
                try {
                    const distService = new window.google.maps.DistanceMatrixService();
                    distService.getDistanceMatrix(
                        {
                            origins: [newPos],
                            destinations: [{ lat: +selectedLead.latitude, lng: +selectedLead.longitude }],
                            travelMode: window.google.maps.TravelMode.DRIVING,
                        },
                        (res, stat) => {
                            if (stat === "OK") {
                                const el = res.rows?.[0]?.elements?.[0];
                                if (el) {
                                    setDistanceText(el.distance?.text || "");
                                    setDurationText(el.duration?.text || "");
                                }
                            }
                        }
                    );
                } catch (e) {
                    // ignore live ETA errors
                }

                const dist = calcDistance(newPos, { lat: +selectedLead.latitude, lng: +selectedLead.longitude });
                if (dist < 0.1 && !reached) setReached(true);
            },
            (err) => {
                console.error("Location watch error", err);
                setErrorMsg("Location tracking error.");
            },
            { enableHighAccuracy: true, maximumAge: 2000, timeout: 10000 }
        );
    };

    const stopTracking = async () => {
        if (watchIdRef.current) {
            navigator.geolocation.clearWatch(watchIdRef.current);
            watchIdRef.current = null;
        }

        if (currentPosition) {
            await saveRoutePoint(currentPosition.lat, currentPosition.lng, "END");

            // 👉 Log movement distance in meters (Start → End)
            if (startPos && currentPosition) {
                const distKm = calcDistance(startPos, currentPosition);
                console.log("Start → End Distance (meters):", distKm * 1000);
            }
        }

        setTracking(false);
    };

    // -------------------- Render --------------------
    if (!isLoaded)
        return (
            <Box p={3}>
                <CircularProgress /> Loading map...
            </Box>
        );

    const filteredLeads = filterType === "All" ? filteredData : filteredData.filter((d) => d.type === filterType);

    const buildLetterIcon = (letter, color = "#ef5350") => {
        if (!window.google?.maps) return null;
        const svg = encodeURIComponent(
            `<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"60\" height=\"80\" viewBox=\"0 0 60 80\"> <path d=\"M30 0 C10 0 0 20 0 32 C0 50 30 80 30 80 C30 80 60 50 60 32 C60 20 50 0 30 0 Z\" fill=\"${color}\" /> <text x=\"50%\" y=\"46%\" font-family=\"Arial\" font-size=\"28\" fill=\"#fff\" font-weight=\"700\" text-anchor=\"middle\">${letter}</text></svg>`
        );
        return {
            url: `data:image/svg+xml;charset=UTF-8,${svg}`,
            scaledSize: new window.google.maps.Size(40, 53),
        };
    };

    return (
        <Grid container spacing={2} sx={{ p: 2 }}>
            {/* LEFT PANEL */}
            <Grid item xs={12} md={3}>
                <Paper sx={{ p: 2, height: "85vh", overflowY: "auto", bgcolor: "#f9fafc" }}>
                    <Tabs
                        value={filterType}
                        onChange={(e, v) => setFilterType(v)}
                        variant="scrollable"
                        scrollButtons="auto"
                        sx={{ mb: 2, "& .MuiTab-root": { textTransform: "none", borderRadius: "20px", fontWeight: 600 } }}
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
                                sx={{ p: 2, mb: 1.5, borderRadius: 2, cursor: "pointer", border: isSelected ? "2px solid #1976d2" : "1px solid #e0e0e0", bgcolor: isSelected ? "#f1f5ff" : "#fff", transition: "0.3s" }}
                            >
                                <Typography fontWeight={600} variant="subtitle1">{lead.clientName}</Typography>
                                <Typography variant="body2" color="text.secondary">
                                    <RoomIcon sx={{ fontSize: 16, mr: 0.5 }} /> {lead.address || "No address"}
                                </Typography>
                            </Paper>
                        );
                    })}

                    {steps.length > 0 && (
                        <Box mt={2}>
                            <Divider />
                            <Typography fontWeight={600} mt={1} mb={1}>Turn-by-Turn Directions</Typography>
                            <Box sx={{ maxHeight: 200, overflowY: "auto" }}>
                                {steps.map((s, idx) => (
                                    <Typography key={idx} variant="body2" sx={{ mb: 0.5 }} color="text.secondary">• {s.instructions.replace(/<[^>]*>?/gm, "")}</Typography>
                                ))}
                            </Box>
                        </Box>
                    )}
                </Paper>
            </Grid>

            {/* MAP PANEL */}
            <Grid item xs={12} md={9}>
                <Paper sx={{ height: "85vh", borderRadius: 3, overflow: "hidden", position: "relative" }}>
                    <GoogleMap
                        key={currentPosition ? "map-loaded" : "map-loading"}
                        mapContainerStyle={containerStyle}
                        center={currentPosition ?? FALLBACK_CENTER}
                        zoom={14}
                        onLoad={(map) => (mapRef.current = map)}
                        options={{ streetViewControl: false, mapTypeControl: false }}
                    >
                        {currentPosition && (
                            <OverlayView position={currentPosition} mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}>
                                <div style={{ transform: "translate(-50%, -50%)", width: 16, height: 16, borderRadius: "50%", background: "#1976d2", boxShadow: "0 0 8px rgba(30,136,229,0.6)" }} />
                            </OverlayView>
                        )}

                        {filteredLeads.map((lead, i) => (
                            <Marker
                                key={i}
                                position={{ lat: +lead.latitude, lng: +lead.longitude }}
                                title={lead.clientName}
                                icon={buildLetterIcon(firstLetter(lead.clientName))}
                                onClick={() => setSelectedLead(lead)}
                            />
                        ))}

                        {directions && (
                            <Polyline path={directions.routes[0].overview_path} options={{ strokeColor: "#1976d2", strokeWeight: 5 }} />
                        )}
                        {arrowPos && (
                            <Marker position={arrowPos} icon={{ path: window.google.maps.SymbolPath.FORWARD_CLOSED_ARROW, scale: 5, strokeColor: "blue" }} />
                        )}
                    </GoogleMap>

                    {/* Floating Glass Dashboard */}
                    <Fade in>
                        <Box sx={{ position: "absolute", bottom: 16, left: 16, backdropFilter: "blur(12px)", bgcolor: "rgba(255,255,255,0.8)", borderRadius: 3, px: 2, py: 1.5, boxShadow: 5, display: "flex", alignItems: "center", gap: 2 }}>
                            {!tracking ? (
                                <Button variant="contained" startIcon={<NavigationIcon />} onClick={startTracking}>Start</Button>
                            ) : (
                                <Button variant="outlined" color="error" onClick={stopTracking}>Stop</Button>
                            )}

                            <Stack direction="row" spacing={1} alignItems="center">
                                <StraightenIcon color="primary" />
                                <Typography sx={{ transition: "0.3s ease" }}>{distanceText}</Typography>
                            </Stack>
                            <Stack direction="row" spacing={1} alignItems="center">
                                <AccessTimeIcon color="secondary" />
                                <Typography sx={{ transition: "0.3s ease" }}>{durationText}</Typography>
                            </Stack>

                            {reached && (
                                <Typography color="success.main" fontWeight={600}>🎯 Reached</Typography>
                            )}
                        </Box>
                    </Fade>

                    {/* Floating Zoom / Recenter */}
                    <Box sx={{ position: "absolute", top: 16, right: 16, display: "flex", flexDirection: "column", gap: 1, bgcolor: "rgba(255,255,255,0.8)", borderRadius: 2, p: 0.5, boxShadow: 3 }}>
                        <IconButton size="small" onClick={() => mapRef.current?.setZoom(mapRef.current.getZoom() + 1)}>
                            <ZoomInIcon />
                        </IconButton>
                        <IconButton size="small" onClick={() => mapRef.current?.setZoom(mapRef.current.getZoom() - 1)}>
                            <ZoomOutIcon />
                        </IconButton>
                        <IconButton size="small" onClick={() => mapRef.current?.panTo(currentPosition)}>
                            <ReplayIcon />
                        </IconButton>
                    </Box>

                    {errorMsg && (
                        <Typography sx={{ position: "absolute", bottom: 10, right: 20, color: "red", fontSize: 14, fontWeight: 500 }}>{errorMsg}</Typography>
                    )}
                </Paper>
            </Grid>
        </Grid>
    );
}
