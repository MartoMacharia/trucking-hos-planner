import React from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import L from "leaflet";

// Fix default Leaflet icon issue with Webpack
import "leaflet/dist/leaflet.css";
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

/**
 * Props:
 * - current: { lat, lng } | null
 * - pickup: { lat, lng } | null
 * - dropoff: { lat, lng } | null
 * - routeCoords: Array<[lat, lng]> (polyline)
 */
export default function TripMap({ current, pickup, dropoff, routeCoords }) {
  const center = current || pickup || dropoff || { lat: 39.8283, lng: -98.5795 }; // fallback: center of US

  return (
    <div className="w-full h-[500px] rounded-xl overflow-hidden shadow-md">
      <MapContainer
        center={center}
        zoom={5}
        scrollWheelZoom={true}
        className="w-full h-full"
      >
        {/* OpenStreetMap tiles */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/">OSM</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Current Location Marker */}
        {current && (
          <Marker position={current}>
            <Popup>Current Location</Popup>
          </Marker>
        )}

        {/* Pickup Marker */}
        {pickup && (
          <Marker position={pickup}>
            <Popup>Pickup</Popup>
          </Marker>
        )}

        {/* Dropoff Marker */}
        {dropoff && (
          <Marker position={dropoff}>
            <Popup>Dropoff</Popup>
          </Marker>
        )}

        {/* Route Polyline */}
        {routeCoords && routeCoords.length > 0 && (
          <Polyline positions={routeCoords} color="blue" />
        )}
      </MapContainer>
    </div>
  );
}

