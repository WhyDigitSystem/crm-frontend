import { useEffect, useRef, useState } from "react";
import { calcDistance } from "../utils/calcDistance";

export default function useTracking({ selectedLead, drawRoute, travelMode, speak }) {
    const [currentPosition, setCurrentPosition] = useState(null);
    const [arrowPos, setArrowPos] = useState(null);
    const [tracking, setTracking] = useState(false);
    const [speed, setSpeed] = useState("");
    const [eta, setEta] = useState("");
    const [paused, setPaused] = useState(false);
    const [reached, setReached] = useState(false);

    const watchIdRef = useRef(null);
    const prevPositionRef = useRef(null);
    const prevTimestampRef = useRef(null);

    useEffect(() => {
        if (!navigator.geolocation) {
            console.warn("Geolocation not supported.");
            return;
        }
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
                setCurrentPosition(loc);
                setArrowPos(loc);
            },
            () => console.error("Location error"),
            { enableHighAccuracy: true }
        );
    }, []);

    const animateMovement = (start, end, duration = 1000) => {
        const startTime = performance.now();
        const step = (now) => {
            const progress = Math.min((now - startTime) / duration, 1);
            const lat = start.lat + (end.lat - start.lat) * progress;
            const lng = start.lng + (end.lng - start.lng) * progress;
            setArrowPos({ lat, lng });
            if (progress < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
    };

    const startTracking = () => {
        if (!selectedLead) return alert("Select a destination first");
        setTracking(true);
        drawRoute(selectedLead);
        speak(`Starting navigation to ${selectedLead.clientName}`);

        watchIdRef.current = navigator.geolocation.watchPosition(
            (pos) => {
                if (paused) return;
                const newPos = { lat: pos.coords.latitude, lng: pos.coords.longitude };

                if (prevPositionRef.current) {
                    animateMovement(prevPositionRef.current, newPos);
                    const distKm = calcDistance(prevPositionRef.current, newPos);
                    const timeH = (pos.timestamp - prevTimestampRef.current) / 3600000;
                    const currentSpeed = distKm / timeH;
                    if (currentSpeed && currentSpeed < 200)
                        setSpeed(currentSpeed.toFixed(1) + " km/h");
                }

                setCurrentPosition(newPos);
                prevPositionRef.current = newPos;
                prevTimestampRef.current = pos.timestamp;

                const dest = {
                    lat: +selectedLead.latitude,
                    lng: +selectedLead.longitude,
                };
                const distToDest = calcDistance(newPos, dest);
                if (distToDest < 0.1 && !reached) {
                    setReached(true);
                    speak("You have reached your destination.");
                }
            },
            (err) => console.error("Tracking error", err),
            { enableHighAccuracy: true, maximumAge: 2000, timeout: 10000 }
        );
    };

    const stopTracking = () => {
        if (watchIdRef.current) {
            navigator.geolocation.clearWatch(watchIdRef.current);
            watchIdRef.current = null;
        }
        setTracking(false);
        setPaused(false);
    };

    return {
        tracking,
        paused,
        speed,
        eta,
        reached,
        currentPosition,
        arrowPos,
        startTracking,
        stopTracking,
        setPaused,
    };
}
