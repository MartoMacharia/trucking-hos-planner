const ORS_API_KEY = process.env.REACT_APP_ORS_API_KEY;
const BASE_URL = "https://api.openrouteservice.org";

/**
 * Geocode an address to [lng, lat]
 * @param {string} query - address or place name
 */
export async function geocodeAddress(query) {
  if (!ORS_API_KEY) throw new Error("ORS API key missing");

  const url = `${BASE_URL}/geocode/search?api_key=${ORS_API_KEY}&text=${encodeURIComponent(
    query
  )}&size=1`;

  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch geocoding data");

  const data = await res.json();
  if (!data.features || data.features.length === 0) {
    throw new Error(`No results for "${query}"`);
  }

  return data.features[0].geometry.coordinates; // [lng, lat]
}

/**
 * Get a route polyline between waypoints using ORS directions
 * @param {Array<[number, number]>} coords - array of [lng, lat] waypoints (2+ points)
 * @param {string} profile - routing profile (driving-car or driving-hgv)
 * @returns {Promise<Array<[number, number]>>} array of [lat, lng] suitable for Leaflet
 */
export async function getRoutePolyline(coords, profile = "driving-car") {
  const apiKey = process.env.REACT_APP_ORS_API_KEY; // Access the API key
  if (!apiKey) {
    throw new Error("ORS API key is missing. Check your .env.local file.");
  }

  const url = `https://api.openrouteservice.org/v2/directions/${profile}/geojson`;

  const body = {
    coordinates: coords,
  };

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: apiKey,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`ORS API error: ${response.statusText}`);
  }

  const data = await response.json();
  return data.features[0].geometry.coordinates.map(([lng, lat]) => [lat, lng]);
}