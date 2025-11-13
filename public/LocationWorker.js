// public/locationWorker.js
let watchId = null;
let lastCoords = null;

// Receive messages from main thread
self.onmessage = (event) => {
    const { command, payload } = event.data;

    if (command === 'start') {
        if (navigator.geolocation) {
            watchId = navigator.geolocation.watchPosition(
                (pos) => {
                    const { latitude, longitude } = pos.coords;
                    self.postMessage({
                        type: 'location',
                        coords: { latitude, longitude },
                        timestamp: new Date().toISOString(),
                    });
                },
                (err) => {
                    self.postMessage({ type: 'error', message: err.message });
                },
                { enableHighAccuracy: true, maximumAge: 10000, timeout: 15000 }
            );
        }
    }

    if (command === 'stop' && watchId) {
        navigator.geolocation.clearWatch(watchId);
        watchId = null;
    }
};
