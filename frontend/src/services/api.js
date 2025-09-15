export const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:8000";

export async function calculateTrip(payload) {
  const url = `${API_BASE_URL}/api/calculate-trip/`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      current_location: payload.currentLocation,
      pickup_location: payload.pickupLocation,
      dropoff_location: payload.dropoffLocation,
      current_cycle_hours: Number(payload.cycleHours) || 0,
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Trip calculation failed: ${res.status} ${text}`);
  }
  return res.json();
} 