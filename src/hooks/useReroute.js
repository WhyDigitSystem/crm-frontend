import { useCallback } from "react";
import { calcDistance } from "../utils/calcDistance";

export default function useReroute(drawRoute) {
    const checkDeviation = useCallback(
        (currentPos, destination, thresholdKm = 0.2) => {
            const dist = calcDistance(currentPos, destination);
            if (dist > thresholdKm) {
                console.log("Re-routing user...");
                drawRoute(destination);
            }
        },
        [drawRoute]
    );

    return { checkDeviation };
}
