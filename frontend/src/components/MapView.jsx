import React from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";

export default function MapView({ tripData }) {
  const { currentCoords, pickupCoords, dropoffCoords } = tripData;

  // Default center (current location)
  const center = currentCoords
    ? [currentCoords[1], currentCoords[0]] // [lat, lng]
    : [39.5, -98.35]; // USA center fallback

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
        <Marker position={[currentCoords[1], currentCoords[0]]}>
          <Popup>Current Location</Popup>
        </Marker>
      )}

      {pickupCoords && (
        <Marker position={[pickupCoords[1], pickupCoords[0]]}>
          <Popup>Pickup Location</Popup>
        </Marker>
      )}

      {dropoffCoords && (
        <Marker position={[dropoffCoords[1], dropoffCoords[0]]}>
          <Popup>Dropoff Location</Popup>
        </Marker>
      )}
    </MapContainer>
  );
}