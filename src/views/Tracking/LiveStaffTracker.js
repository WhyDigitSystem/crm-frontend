import React, { useState, useEffect, useCallback } from "react";
import {
  GoogleMap,
  useLoadScript,
  Marker,
  InfoWindow,
  MarkerClustererF,
} from "@react-google-maps/api";
import axios from "axios";

const containerStyle = {
  width: "100%",
  height: "600px",
};

export default function LiveStaffTracker() {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: "YOUR_GOOGLE_MAPS_API_KEY", // 🔑 Replace with API key
  });

  const [dealers, setDealers] = useState([]);
  const [selectedDealer, setSelectedDealer] = useState(null);

  // Fetch dealer data from CRM API
  useEffect(() => {
    const fetchDealers = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/dealers"); 
        // API should return array like:
        // [{ id, name, address, lat, lng, contact, salesHistory }]
        setDealers(response.data);
      } catch (error) {
        console.error("Error fetching dealer data:", error);
      }
    };

    fetchDealers();
  }, []);

  const onMarkerClick = useCallback((dealer) => {
    setSelectedDealer(dealer);
  }, []);

  if (!isLoaded) return <div>Loading Map...</div>;

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={{ lat: 20.5937, lng: 78.9629 }} // India center
      zoom={5}
    >
      <MarkerClustererF>
        {(clusterer) =>
          dealers.map((dealer) => (
            <Marker
              key={dealer.id}
              position={{ lat: dealer.lat, lng: dealer.lng }}
              clusterer={clusterer}
              onClick={() => onMarkerClick(dealer)}
            />
          ))
        }
      </MarkerClustererF>

      {selectedDealer && (
        <InfoWindow
          position={{ lat: selectedDealer.lat, lng: selectedDealer.lng }}
          onCloseClick={() => setSelectedDealer(null)}
        >
          <div style={{ maxWidth: "200px" }}>
            <h4>{selectedDealer.name}</h4>
            <p>{selectedDealer.address}</p>
            <p><b>Contact:</b> {selectedDealer.contact}</p>
            <p><b>Sales:</b> {selectedDealer.salesHistory}</p>
          </div>
        </InfoWindow>
      )}
    </GoogleMap>
  );
}
