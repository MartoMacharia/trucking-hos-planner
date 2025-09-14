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
