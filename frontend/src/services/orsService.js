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
  if (!ORS_API_KEY) throw new Error("ORS API key missing");
  if (!Array.isArray(coords) || coords.length < 2) {
    throw new Error("At least two coordinates are required");
  }

  const url = `${BASE_URL}/v2/directions/${profile}?api_key=${ORS_API_KEY}&geometry_format=geojson&instructions=false`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ coordinates: coords }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`ORS directions failed: ${res.status} ${text}`);
  }
  const json = await res.json();
  const line = json?.routes?.[0]?.geometry?.coordinates || [];
  // Convert [lng, lat] -> [lat, lng]
  return line.map(([lng, lat]) => [lat, lng]);
}