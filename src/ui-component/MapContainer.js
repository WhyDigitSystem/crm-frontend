import React from "react";
import { GoogleMap, Marker, Polyline, OverlayView } from "@react-google-maps/api";

export default function MapContainer({
    currentPosition,
    arrowPos,
    directions,
    leads,
    onMarkerClick,
    mapRef,
}) {
    const FALLBACK_CENTER = { lat: 12.9716, lng: 77.5946 };

    return (
        <GoogleMap
            mapContainerStyle={{ width: "100%", height: "85vh" }}
            center={currentPosition || FALLBACK_CENTER}
            zoom={14}
            onLoad={(map) => (mapRef.current = map)}
            options={{ streetViewControl: false, mapTypeControl: false }}
        >
            {currentPosition && (
                <OverlayView position={currentPosition} mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}>
                    <div
                        style={{
                            transform: "translate(-50%, -50%)",
                            width: 18,
                            height: 18,
                            borderRadius: "50%",
                            background: "#1976d2",
                            boxShadow: "0 0 10px rgba(30,136,229,0.6)",
                        }}
                    />
                </OverlayView>
            )}
            {leads.map((lead, i) => (
                <Marker
                    key={i}
                    position={{ lat: +lead.latitude, lng: +lead.longitude }}
                    title={lead.clientName}
                    onClick={() => onMarkerClick(lead)}
                />
            ))}
            {directions && (
                <Polyline path={directions.routes[0].overview_path} options={{ strokeColor: "#1976d2", strokeWeight: 5 }} />
            )}
            {arrowPos && (
                <Marker
                    position={arrowPos}
                    icon={{
                        path: window.google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
                        scale: 5,
                        strokeColor: "blue",
                    }}
                />
            )}
        </GoogleMap>
    );
}
