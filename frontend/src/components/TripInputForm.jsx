import React, { useState } from "react";
import { geocodeAddress } from "../services/orsService";

export default function TripInputForm({ onTripSubmit }) {
  const [formData, setFormData] = useState({
    currentLocation: "",
    pickupLocation: "",
    dropoffLocation: "",
    cycleHours: "",
  });

  const [suggestions, setSuggestions] = useState({
    currentLocation: [],
    pickupLocation: [],
    dropoffLocation: [],
  });

  const handleChange = async (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Fetch suggestions for location inputs
    if (name === "currentLocation" || name === "pickupLocation" || name === "dropoffLocation") {
      try {
        const url = `https://api.openrouteservice.org/geocode/autocomplete?api_key=${process.env.REACT_APP_ORS_API_KEY}&text=${encodeURIComponent(
          value
        )}`;
        const res = await fetch(url);
        const data = await res.json();
        const locations = data.features.map((feature) => feature.properties.label);
        setSuggestions((prev) => ({ ...prev, [name]: locations }));
      } catch (err) {
        console.error("Error fetching suggestions:", err);
      }
    }
  };

  const handleSuggestionClick = (name, suggestion) => {
    setFormData({ ...formData, [name]: suggestion });
    setSuggestions((prev) => ({ ...prev, [name]: [] })); // Clear suggestions after selection
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const currentCoords = await geocodeAddress(formData.currentLocation);
      const pickupCoords = await geocodeAddress(formData.pickupLocation);
      const dropoffCoords = await geocodeAddress(formData.dropoffLocation);

      onTripSubmit({
        ...formData,
        currentCoords,
        pickupCoords,
        dropoffCoords,
      });
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-md mx-auto p-4 bg-gray-500 rounded-3xl shadow-md space-y-6"
    >
      {/* Current Location Input */}
      <div className="relative">
        <input
          type="text"
          name="currentLocation"
          placeholder="Current location"
          value={formData.currentLocation}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />
        {suggestions.currentLocation.length > 0 && (
          <ul className="absolute bg-white border rounded shadow-md w-full z-10">
            {suggestions.currentLocation.map((suggestion, index) => (
              <li
                key={index}
                className="p-2 hover:bg-gray-200 cursor-pointer"
                onClick={() => handleSuggestionClick("currentLocation", suggestion)}
              >
                {suggestion}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Pickup Location Input */}
      <div className="relative">
        <input
          type="text"
          name="pickupLocation"
          placeholder="Pickup location"
          value={formData.pickupLocation}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />
        {suggestions.pickupLocation.length > 0 && (
          <ul className="absolute bg-white border rounded shadow-md w-full z-10">
            {suggestions.pickupLocation.map((suggestion, index) => (
              <li
                key={index}
                className="p-2 hover:bg-gray-200 cursor-pointer"
                onClick={() => handleSuggestionClick("pickupLocation", suggestion)}
              >
                {suggestion}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Dropoff Location Input */}
      <div className="relative">
        <input
          type="text"
          name="dropoffLocation"
          placeholder="Dropoff location"
          value={formData.dropoffLocation}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />
        {suggestions.dropoffLocation.length > 0 && (
          <ul className="absolute bg-white border rounded shadow-md w-full z-10">
            {suggestions.dropoffLocation.map((suggestion, index) => (
              <li
                key={index}
                className="p-2 hover:bg-gray-200 cursor-pointer"
                onClick={() => handleSuggestionClick("dropoffLocation", suggestion)}
              >
                {suggestion}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Cycle Hours Input */}
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