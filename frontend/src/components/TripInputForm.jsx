import React, { useState } from "react";
import { geocodeAddress } from "../services/orsService";

export default function TripInputForm({ onTripSubmit }) {
  const [formData, setFormData] = useState({
    currentLocation: "",
    pickupLocation: "",
    dropoffLocation: "",
    cycleHours: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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
      className="max-w-md mx-auto p-4 bg-gray-500 rounded-lg shadow-md space-y-4"
    >
      <input
        type="text"
        name="currentLocation"
        placeholder="Current location"
        value={formData.currentLocation}
        onChange={handleChange}
        className="w-full p-2 border rounded"
        required
      />
      <input
        type="text"
        name="pickupLocation"
        placeholder="Pickup location"
        value={formData.pickupLocation}
        onChange={handleChange}
        className="w-full p-2 border rounded"
        required
      />
      <input
        type="text"
        name="dropoffLocation"
        placeholder="Dropoff location"
        value={formData.dropoffLocation}
        onChange={handleChange}
        className="w-full p-2 border rounded"
        required
      />
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
