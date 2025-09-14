import React, { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { geocodeAddress } from "../services/orsService"; // Import geocodeAddress from orsService.js

// Fix for missing marker icons using Leaflet's default assets
import markerIconUrl from "leaflet/dist/images/marker-icon.png";
import markerShadowUrl from "leaflet/dist/images/marker-shadow.png";

const markerIcon = L.icon({
  iconUrl: markerIconUrl,
  shadowUrl: markerShadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

export default function MapView({ tripData }) {
  const { currentCoords, pickupCoords, dropoffCoords } = tripData;
  const [routeCoordinates, setRouteCoordinates] = useState([]);

  // Default center (current location)
  const center = currentCoords
    ? [currentCoords[1], currentCoords[0]] // [lat, lng]
    : [39.5, -98.35]; // USA center fallback

  useEffect(() => {
    const fetchRoute = async () => {
      if (currentCoords && pickupCoords && dropoffCoords) {
        try {
          // Fetch route using geocodeAddress from orsService.js
          const route = await geocodeAddress(
            `${currentCoords[0]},${currentCoords[1]}`
          );
          setRouteCoordinates(route.map((coord) => [coord[1], coord[0]])); // Convert [lng, lat] to [lat, lng]
        } catch (error) {
          console.error("Error fetching route:", error);
        }
      }
    };

    fetchRoute();
  }, [currentCoords, pickupCoords, dropoffCoords]);

  return (
    <MapContainer
      center={center}
      zoom={5}
      style={{ height: "500px", width: "100%" }}
      className="rounded-lg shadow"
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
      />

      {currentCoords && (
        <Marker position={[currentCoords[1], currentCoords[0]]} icon={markerIcon}>
          <Popup>Current Location</Popup>
        </Marker>
      )}

      {pickupCoords && (
        <Marker position={[pickupCoords[1], pickupCoords[0]]} icon={markerIcon}>
          <Popup>Pickup Location</Popup>
        </Marker>
      )}

      {dropoffCoords && (
        <Marker position={[dropoffCoords[1], dropoffCoords[0]]} icon={markerIcon}>
          <Popup>Dropoff Location</Popup>
        </Marker>
      )}

      {/* Draw route using Polyline */}
      {routeCoordinates.length > 0 && (
        <Polyline positions={routeCoordinates} color="blue" />
      )}
    </MapContainer>
  );
}