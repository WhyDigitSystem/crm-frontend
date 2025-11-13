import { useCallback } from "react";

export default function useGeocode() {
    const geocodeAddress = useCallback(async (address) => {
        if (!window.google?.maps || !address) return null;

        const cacheKey = address.trim().toLowerCase();
        const cached = localStorage.getItem(cacheKey);

        if (cached) {
            try {
                const data = JSON.parse(cached);
                const maxAge = 1000 * 60 * 60 * 24 * 30; // 30 days
                if (Date.now() - data.cachedAt < maxAge) {
                    return data;
                }
            } catch { }
        }

        const geocoder = new window.google.maps.Geocoder();

        return new Promise((resolve) => {
            geocoder.geocode(
                { address, componentRestrictions: { country: "IN" } },
                (results, status) => {
                    if (status === "OK" && results[0]) {
                        const loc = results[0].geometry.location;
                        const type = results[0].geometry.location_type; // ⬅️ accuracy info

                        const data = {
                            coords: { lat: loc.lat(), lng: loc.lng() },
                            accuracy: type,
                            cachedAt: Date.now(),
                        };

                        localStorage.setItem(cacheKey, JSON.stringify(data));
                        resolve(data);
                    } else {
                        console.warn(`⚠️ Geocode failed: ${address} (${status})`);
                        resolve(null);
                    }
                }
            );
        });
    }, []);

    return { geocodeAddress };
}
