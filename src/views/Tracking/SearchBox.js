import React from "react";
import usePlacesAutocomplete, {
    getGeocode,
    getLatLng,
} from "use-places-autocomplete";

const SearchBox = ({ setLocation }) => {
    const {
        ready,
        value,
        suggestions: { status, data },
        setValue,
        clearSuggestions,
    } = usePlacesAutocomplete();

    const handleInput = (e) => {
        setValue(e.target.value);
    };

    const handleSelect = async (place) => {
        setValue(place.description, false);
        clearSuggestions();

        try {
            const results = await getGeocode({ address: place.description });
            const { lat, lng } = await getLatLng(results[0]);
            setLocation([lat, lng]);
        } catch (error) {
            console.log("Error:", error);
        }
    };

    return (
        <div style={{ position: "absolute", top: 10, left: 10, zIndex: 1000 }}>
            <input
                value={value}
                onChange={handleInput}
                disabled={!ready}
                placeholder="Search location..."
                style={{
                    padding: "8px",
                    width: "250px",
                    borderRadius: "8px",
                    border: "1px solid #ccc",
                }}
            />
            {status === "OK" && (
                <ul style={{ background: "white", listStyle: "none", padding: "5px" }}>
                    {data.map(({ place_id, description }) => (
                        <li
                            key={place_id}
                            onClick={() => handleSelect({ description })}
                            style={{ cursor: "pointer", padding: "5px" }}
                        >
                            {description}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default SearchBox;
