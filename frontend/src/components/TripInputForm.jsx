import React, { useState, useEffect } from "react";
import useDebounce from "../hooks/useDebounce";

export default function TripInputForm({ onTripSubmit }) {
  const [formData, setFormData] = useState({
    currentLocation: { text: "", coords: null },
    pickupLocation: { text: "", coords: null },
    dropoffLocation: { text: "", coords: null },
    cycleHours: "",
  });

  const [suggestions, setSuggestions] = useState({
    currentLocation: [],
    pickupLocation: [],
    dropoffLocation: [],
  });

  // Debounced search inputs
  const debouncedCurrent = useDebounce(formData.currentLocation.text);
  const debouncedPickup = useDebounce(formData.pickupLocation.text);
  const debouncedDropoff = useDebounce(formData.dropoffLocation.text);

  useEffect(() => {
    const fetchSuggestions = async (name, query) => {
      if (!query) {
        setSuggestions((prev) => ({ ...prev, [name]: [] }));
        return;
      }

      try {
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          query
        )}&addressdetails=1&limit=5`;
        const res = await fetch(url);
        const data = await res.json();
        const locations = data.map((item) => ({
          label: item.display_name,
          coords: [parseFloat(item.lon), parseFloat(item.lat)], // [lng, lat]
        }));
        setSuggestions((prev) => ({ ...prev, [name]: locations }));
      } catch (err) {
        console.error("Error fetching suggestions:", err);
      }
    };

    fetchSuggestions("currentLocation", debouncedCurrent);
  }, [debouncedCurrent]);

  useEffect(() => {
    const fetchSuggestions = async (name, query) => {
      if (!query) {
        setSuggestions((prev) => ({ ...prev, [name]: [] }));
        return;
      }

      try {
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          query
        )}&addressdetails=1&limit=5`;
        const res = await fetch(url);
        const data = await res.json();
        const locations = data.map((item) => ({
          label: item.display_name,
          coords: [parseFloat(item.lon), parseFloat(item.lat)], // [lng, lat]
        }));
        setSuggestions((prev) => ({ ...prev, [name]: locations }));
      } catch (err) {
        console.error("Error fetching suggestions:", err);
      }
    };

    fetchSuggestions("pickupLocation", debouncedPickup);
  }, [debouncedPickup]);

  useEffect(() => {
    const fetchSuggestions = async (name, query) => {
      if (!query) {
        setSuggestions((prev) => ({ ...prev, [name]: [] }));
        return;
      }

      try {
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          query
        )}&addressdetails=1&limit=5`;
        const res = await fetch(url);
        const data = await res.json();
        const locations = data.map((item) => ({
          label: item.display_name,
          coords: [parseFloat(item.lon), parseFloat(item.lat)], // [lng, lat]
        }));
        setSuggestions((prev) => ({ ...prev, [name]: locations }));
      } catch (err) {
        console.error("Error fetching suggestions:", err);
      }
    };

    fetchSuggestions("dropoffLocation", debouncedDropoff);
  }, [debouncedDropoff]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "cycleHours") {
      setFormData({ ...formData, [name]: value });
    } else {
      setFormData({
        ...formData,
        [name]: { text: value, coords: null },
      });
    }
  };

  const handleSuggestionClick = (name, suggestion) => {
    setFormData({
      ...formData,
      [name]: { text: suggestion.label, coords: suggestion.coords },
    });
    setSuggestions((prev) => ({ ...prev, [name]: [] })); // clear dropdown
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setFormData({
          ...formData,
          currentLocation: {
            text: `Lat: ${latitude}, Lng: ${longitude}`,
            coords: [longitude, latitude], // [lng, lat]
          },
        });
        setSuggestions((prev) => ({ ...prev, currentLocation: [] })); // Clear suggestions
      },
      (error) => {
        console.error("Error getting current location:", error);
        alert("Unable to retrieve your location.");
      }
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    onTripSubmit({
      cycleHours: formData.cycleHours,
      currentLocation: formData.currentLocation.text,
      pickupLocation: formData.pickupLocation.text,
      dropoffLocation: formData.dropoffLocation.text,
      currentCoords: formData.currentLocation.coords,
      pickupCoords: formData.pickupLocation.coords,
      dropoffCoords: formData.dropoffLocation.coords,
    });
  };

  const renderLocationInput = (name, placeholder, extraButton = null) => (
    <div className="relative">
      <input
        type="text"
        name={name}
        placeholder={placeholder}
        value={formData[name].text}
        onChange={handleChange}
        className="w-full p-2 border rounded"
        required
      />
      {extraButton && (
        <button
          type="button"
          onClick={extraButton}
          className="absolute right-2 top-2 bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
        >
          Use My Location
        </button>
      )}
      {suggestions[name].length > 0 && (
        <ul className="absolute bg-white border rounded shadow-md w-full z-10 max-h-48 overflow-y-auto">
          {suggestions[name].map((s, i) => (
            <li
              key={i}
              className="p-2 hover:bg-gray-200 cursor-pointer"
              onClick={() => handleSuggestionClick(name, s)}
            >
              {s.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-md mx-auto p-8 m-4 bg-white rounded-xl shadow-md space-y-6"
    >
      {renderLocationInput("currentLocation", "Current Location", handleUseCurrentLocation)}
      {renderLocationInput("pickupLocation", "Pickup Location")}
      {renderLocationInput("dropoffLocation", "Dropoff Location")}

      <input
        type="number"
        name="cycleHours"
        placeholder="Current Cycle Used (Hrs)"
        value={formData.cycleHours}
        onChange={handleChange}
        className="w-full p-2 border rounded"
        required
      />

      <button
        type="submit"
        className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
      >
        Plan Trip
      </button>
    </form>
  );
}