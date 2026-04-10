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

// Storage keys
const STORAGE_KEYS = {
    TRACKING_ACTIVE: "route_tracking_active",
    TRACKING_ID: "route_tracking_id",
    TRACKING_START_TIME: "route_tracking_start_time",
    SELECTED_LEAD: "route_selected_lead"
};

export default function RouteTracking() {
    // ---- localStorage mappings ----
    const orgId = localStorage.getItem("orgId") || "";
    const branchCode = localStorage.getItem("branchcode") || "";
    const loginUserName = localStorage.getItem("userName") || "";
    const employeeName = localStorage.getItem("employeeName") || "";
    const employeeCode = localStorage.getItem("employeeCode") || "";
    const branch = localStorage.getItem("branch") || "";
    const finYear = localStorage.getItem("finYear") || "";
    const userType = localStorage.getItem("userType") || "";

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
    const [trackingId, setTrackingId] = useState(null);
    const [arrowPos, setArrowPos] = useState(null);
    const [steps, setSteps] = useState([]);
    const [reached, setReached] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [trackingHistory, setTrackingHistory] = useState([]);
    const [totalDistance, setTotalDistance] = useState(0);
    const [lastApiCallTime, setLastApiCallTime] = useState(0);

    const watchIdRef = useRef(null);
    const mapRef = useRef(null);
    const { isLoaded } = useGoogleMapLoader();

    const trackingRef = useRef(false);
    const routeUpdateIntervalRef = useRef(null);
    const currentTrackingIdRef = useRef(null);

    // Load saved tracking state on component mount
    useEffect(() => {
        const savedTrackingActive = localStorage.getItem(STORAGE_KEYS.TRACKING_ACTIVE) === "true";
        const savedTrackingId = localStorage.getItem(STORAGE_KEYS.TRACKING_ID);
        const savedSelectedLead = localStorage.getItem(STORAGE_KEYS.SELECTED_LEAD);

        if (savedTrackingActive && savedTrackingId && savedSelectedLead) {
            try {
                const lead = JSON.parse(savedSelectedLead);
                setSelectedLead(lead);
                setTrackingId(savedTrackingId);
                currentTrackingIdRef.current = savedTrackingId;
                setTracking(true);

                // Resume tracking - start the 1-minute interval again
                setTimeout(async () => {
                    try {
                        const loc = await getFreshLocation();
                        setCurrentPosition(loc);

                        currentTrackingIdRef.current = savedTrackingId;
                        setTracking(true);

                        // 🔥 call API immediately after refresh
                        await updateRouteWithId(savedTrackingId);

                        startTrackingInterval(savedTrackingId);
                        startWatchingPosition();

                    } catch (e) {
                        console.error("Failed to restore tracking", e);
                    }
                }, 2000);
            } catch (e) {
                console.error("Error restoring tracking state", e);
            }
        }
    }, []);

    useEffect(() => {
        trackingRef.current = tracking;
    }, [tracking]);

    // Save tracking state to localStorage when it changes
    useEffect(() => {
        if (tracking && trackingId && selectedLead) {
            localStorage.setItem(STORAGE_KEYS.TRACKING_ACTIVE, "true");
            localStorage.setItem(STORAGE_KEYS.TRACKING_ID, trackingId);
            localStorage.setItem(STORAGE_KEYS.SELECTED_LEAD, JSON.stringify(selectedLead));
            localStorage.setItem(STORAGE_KEYS.TRACKING_START_TIME, Date.now().toString());
        } else if (!tracking) {
            localStorage.removeItem(STORAGE_KEYS.TRACKING_ACTIVE);
            localStorage.removeItem(STORAGE_KEYS.TRACKING_ID);
            localStorage.removeItem(STORAGE_KEYS.SELECTED_LEAD);
            localStorage.removeItem(STORAGE_KEYS.TRACKING_START_TIME);
        }
    }, [tracking, trackingId, selectedLead]);

    const getLiveTrackingData = async () => {
        try {
            const dynamicEmployeeCode =
                userType === "ADMIN"
                    ? selectedLead?.employeeCode
                    : employeeCode;

            if (!dynamicEmployeeCode) return;

            const res = await apiCalls(
                "get",
                `/officialworkroute/getLiveTracking?branchCode=${branchCode}&employeeCode=${dynamicEmployeeCode}&orgId=${orgId}`
            );

            const data = res?.paramObjectsMap?.officialWorkRouteVO;

            if (data && data.length > 0) {
                const trackingData = data[0];

                // ✅ ADDRESS MATCH CHECK
                const isSameAddress =
                    trackingData.address?.trim() === selectedLead?.address?.trim();

                if (isSameAddress) {
                    // ✅ VALID TRACKING
                    setTracking(true);
                    setTrackingId(trackingData.id);

                    const pos = {
                        lat: trackingData.latitude,
                        lng: trackingData.longitude
                    };

                    setCurrentPosition(pos);
                    setArrowPos(pos);

                    drawRoute(selectedLead, pos);

                } else {
                    // ❌ DIFFERENT ADDRESS → DO NOT TRACK
                    setTracking(false);
                    setTrackingId(null);
                    setDirections(null);
                }

            } else {
                setTracking(false);
                setTrackingId(null);
                setDirections(null);
            }

        } catch (err) {
            console.error("Error fetching live tracking:", err);
            setTracking(false);
            setDirections(null);
        }
    };

    // Start watching position
    const startWatchingPosition = () => {
        if (watchIdRef.current) {
            navigator.geolocation.clearWatch(watchIdRef.current);
        }

        watchIdRef.current = navigator.geolocation.watchPosition(
            (pos) => {
                const { latitude, longitude, accuracy } = pos.coords;

                if (accuracy > 100) return;

                const newPos = { lat: latitude, lng: longitude };
                setCurrentPosition(newPos);
                setArrowPos(newPos);
                mapRef.current?.panTo(newPos);
            },
            (err) => console.error("Tracking error", err),
            {
                enableHighAccuracy: true,
                maximumAge: 0,
                timeout: 20000
            }
        );
    };

    // Update route with current location (using existing ID)
    const updateRouteWithId = async (id) => {
        if (!id || !currentPosition) return;

        try {
            const payload = {
                id: parseInt(id), // ✅ send ID only here
                branch,
                branchCode,
                createdBy: loginUserName,
                employeeCode,
                employeeName,
                latitude: currentPosition.lat,
                longitude: currentPosition.lng,
                orgId: Number(orgId),
                type: "START",
                address: selectedLead?.address || "",
            };

            console.log("⏱ Calling update API...");

            const res = await apiCalls("post", "/officialworkroute/calculateOfficialRoute", payload);

            if (res?.paramObjectsMap?.distance) {
                setDistanceText(`${res.paramObjectsMap.distance} km`);
                setTotalDistance(res.paramObjectsMap.distance);
            }

            setLastApiCallTime(Date.now());

        } catch (err) {
            console.error("Error updating route:", err);
        }
    };

    // Start the interval to update route every minute with the same ID
    const startTrackingInterval = (id) => {
        if (routeUpdateIntervalRef.current) {
            clearInterval(routeUpdateIntervalRef.current);
        }

        routeUpdateIntervalRef.current = setInterval(() => {
            console.log("⏱ Interval running...");

            if (trackingRef.current && currentTrackingIdRef.current) {
                updateRouteWithId(currentTrackingIdRef.current);
            }
        }, 60000); // every 1 min
    };

    // Fetch all tracking history for the day
    const fetchAllTrackingHistory = async () => {
        try {
            const res = await apiCalls(
                "get",
                `/officialworkroute/getAllOfficialWorkRouteByOrgId?branchCode=${branchCode}&orgId=${orgId}`
            );

            if (res?.paramObjectsMap?.officialWorkRouteVO) {
                const routes = Array.isArray(res.paramObjectsMap.officialWorkRouteVO)
                    ? res.paramObjectsMap.officialWorkRouteVO
                    : [res.paramObjectsMap.officialWorkRouteVO];

                // Filter routes for current employee and today's date
                const today = new Date().toISOString().split('T')[0];
                const todayRoutes = routes.filter(route =>
                    route.employeeCode === employeeCode &&
                    route.currentDate === today
                );

                setTrackingHistory(todayRoutes);

                // Calculate total distance for today
                const totalDist = todayRoutes.reduce((sum, route) => sum + (route.distance || 0), 0);
                setTotalDistance(totalDist);

                // Get the latest position
                const latestRoute = todayRoutes[todayRoutes.length - 1];
                if (latestRoute && latestRoute.latitude && latestRoute.longitude) {
                    const pos = {
                        lat: latestRoute.latitude,
                        lng: latestRoute.longitude
                    };
                    setCurrentPosition(pos);
                    setArrowPos(pos);
                }
            }
        } catch (err) {
            console.error("Error fetching tracking history", err);
        }
    };

    // Create initial route entry (START)
    const createInitialRoute = async (lat, lng) => {
        const payload = {
            branch,
            branchCode,
            createdBy: loginUserName,
            employeeCode,
            employeeName,
            latitude: lat,
            longitude: lng,
            orgId: Number(orgId),
            type: "START",
            address: selectedLead?.address || "", // ✅ ADD THIS
        };

        try {
            const res = await apiCalls("post", "/officialworkroute/calculateOfficialRoute", payload);

            const route = res?.paramObjectsMap?.officialWorkRouteVO;

            if (res?.paramObjectsMap?.distance) {
                setDistanceText(`${res.paramObjectsMap.distance} km`);
            }

            return route?.id || null;

        } catch (err) {
            console.error("Error creating initial route", err);
            return null;
        }
    };

    // Create final route entry (END)
    const createEndRoute = async (lat, lng, id) => {
        const payload = {
            id: parseInt(id), // ✅ send ID only here
            branch,
            branchCode,
            createdBy: loginUserName,
            employeeCode,
            employeeName,
            latitude: lat,
            longitude: lng,
            orgId: Number(orgId),
            type: "END",
            address: selectedLead?.address || "",
        };

        return await apiCalls("post", "/officialworkroute/calculateOfficialRoute", payload);
    };

    // Geocode functions
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

    // Get fresh location with accuracy check
    const getFreshLocation = () =>
        new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    const { latitude, longitude, accuracy } = pos.coords;

                    if (accuracy > 100) {
                        reject("Low accuracy");
                        return;
                    }

                    resolve({ lat: latitude, lng: longitude });
                },
                reject,
                {
                    enableHighAccuracy: true,
                    timeout: 20000,
                    maximumAge: 0
                }
            );
        });

    // Draw route
    const drawRoute = useCallback(
        async (lead, originOverride = null) => {
            if (!isLoaded || !window.google || !lead) return;

            const origin = originOverride || currentPosition;

            if (!origin) {
                console.log("❌ No origin for route");
                return;
            }

            if (!lead.latitude || !lead.longitude) {
                console.log("❌ Lead location missing");
                return;
            }

            setLoadingRoute(true);

            const service = new window.google.maps.DirectionsService();

            service.route(
                {
                    origin: {
                        lat: Number(origin.lat),
                        lng: Number(origin.lng),
                    },
                    destination: {
                        lat: Number(lead.latitude),
                        lng: Number(lead.longitude),
                    },
                    travelMode: window.google.maps.TravelMode.DRIVING,
                },
                (result, status) => {
                    if (status === "OK" && result) {
                        const leg = result.routes[0].legs[0];

                        setDirections(result);
                        setDistanceText(leg.distance?.text || "");
                        setDurationText(leg.duration?.text || "");
                        setSteps(leg.steps || []);

                        console.log("✅ Route drawn");
                    } else {
                        console.error("❌ Route error:", status);
                        setErrorMsg("Route not available");
                    }

                    setLoadingRoute(false);
                }
            );
        },
        [isLoaded, currentPosition]
    );

    // Get initial accurate location
    const getAccurateLocation = useCallback(() => {
        if (!navigator.geolocation) {
            setErrorMsg("❌ Geolocation not supported.");
            setCurrentPosition(FALLBACK_CENTER);
            return;
        }

        const attemptLocation = () => {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    const { latitude, longitude, accuracy } = pos.coords;

                    console.log("📍 Accuracy:", accuracy);

                    if (accuracy > 100) {
                        console.log("⚠️ Low accuracy, retrying...");
                        setTimeout(attemptLocation, 2000);
                        return;
                    }

                    const loc = { lat: latitude, lng: longitude };
                    setCurrentPosition(loc);
                    mapRef.current?.panTo(loc);
                },
                (err) => {
                    console.error("❌ Location error:", err);
                    setErrorMsg("⚠️ Unable to fetch accurate location.");
                    setCurrentPosition(FALLBACK_CENTER);
                },
                {
                    enableHighAccuracy: true,
                    timeout: 20000,
                    maximumAge: 0
                }
            );
        };

        attemptLocation();
    }, []);

    useEffect(() => {
        if (isLoaded) {
            getAccurateLocation();
            fetchAllTrackingHistory();
        }
    }, [isLoaded, getAccurateLocation]);

    useEffect(() => {
        getLiveTrackingData();
    }, []);

    // Start tracking
    const startTracking = async () => {
        if (!selectedLead) {
            alert("Select a destination first");
            return;
        }

        if (tracking) {
            alert("Tracking already active");
            return;
        }

        setLoadingRoute(true);

        try {
            const freshLocation = await getFreshLocation();

            setCurrentPosition(freshLocation);
            setStartPos(freshLocation);

            const newId = await createInitialRoute(
                freshLocation.lat,
                freshLocation.lng
            );

            if (newId) {
                setTracking(true);
                setTrackingId(newId);
                currentTrackingIdRef.current = newId;

                await updateRouteWithId(newId);

                // ✅ DRAW ROUTE AFTER START ONLY
                drawRoute(selectedLead, freshLocation);

                startTrackingInterval(newId);
                startWatchingPosition();
            }

        } catch (e) {
            console.error("Start tracking error:", e);
        } finally {
            setLoadingRoute(false);
        }
    };

    // Stop tracking
    const stopTracking = async () => {
        if (!trackingId && !currentTrackingIdRef.current) {
            setTracking(false);
            return;
        }

        const idToStop = trackingId || currentTrackingIdRef.current;
        setLoadingRoute(true);

        // Clear intervals
        if (routeUpdateIntervalRef.current) {
            console.log("Clearing tracking interval");
            clearInterval(routeUpdateIntervalRef.current);
            routeUpdateIntervalRef.current = null;
        }

        if (watchIdRef.current) {
            navigator.geolocation.clearWatch(watchIdRef.current);
            watchIdRef.current = null;
        }

        try {
            // Get final location
            let finalLocation = currentPosition;
            try {
                finalLocation = await getFreshLocation();
            } catch (e) {
                console.log("Using last known location for END");
            }

            // Create END entry with the same ID
            await createEndRoute(finalLocation.lat, finalLocation.lng, idToStop);

            // Fetch final tracking details
            await fetchAllTrackingHistory();
            getLiveTrackingData();

            console.log(`✅ Tracking stopped for ID: ${idToStop}`);
        } catch (err) {
            console.error("Error stopping tracking:", err);
            setErrorMsg("⚠️ Error saving final location.");
        } finally {
            setTracking(false);
            setTrackingId(null);
            currentTrackingIdRef.current = null;

            setDirections(null); // ❌ REMOVE ROUTE

            setLoadingRoute(false);
        }
    };

    // Render map markers
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

    // Fetch leads
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

                const geocodedLeads = await Promise.all(
                    leads.map(async (lead) => {
                        const coords = await geocodeAddress(lead.address || "");
                        return {
                            ...lead,
                            employeeCode: lead.employeeCode,
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

    if (!isLoaded)
        return (
            <Box p={3}>
                <CircularProgress /> Loading map...
            </Box>
        );

    const filteredLeads = filterType === "All" ? filteredData : filteredData.filter((d) => d.type === filterType);

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
                                onClick={() => {
                                    setSelectedLead(lead);
                                    getLiveTrackingData(); // only check tracking
                                }}
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
                                <div style={{ transform: "translate(-50%, -50%)", width: 16, height: 16, borderRadius: "50%", background: tracking ? "#4caf50" : "#1976d2", boxShadow: "0 0 8px rgba(30,136,229,0.6)" }} />
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

                    {/* Floating Controls */}
                    {userType !== 'ADMIN' && (
                        <Fade in>
                            <Box sx={{ position: "absolute", bottom: 16, left: 16, backdropFilter: "blur(12px)", bgcolor: "rgba(255,255,255,0.8)", borderRadius: 3, px: 2, py: 1.5, boxShadow: 5, display: "flex", alignItems: "center", gap: 2 }}>
                                {!tracking ? (
                                    <Button
                                        variant="contained"
                                        startIcon={<NavigationIcon />}
                                        onClick={startTracking}
                                        disabled={!selectedLead || loadingRoute}
                                    >
                                        {loadingRoute ? "Starting..." : "Start"}
                                    </Button>
                                ) : (
                                    <Button variant="outlined" color="error" onClick={stopTracking}>
                                        Stop
                                    </Button>
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
                    )}

                    {/* Floating Zoom Controls */}
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