import React, { useEffect, useState, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { getRoutePolyline } from "../services/orsService";

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
  const { currentCoords, pickupCoords, dropoffCoords } = tripData || {};
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const mapRef = useRef(null);

  const center = currentCoords
    ? [currentCoords[1], currentCoords[0]]
    : [39.5, -98.35];

  useEffect(() => {
    const buildRoute = async () => {
      const points = [];
      if (currentCoords) points.push([currentCoords[0], currentCoords[1]]);
      if (pickupCoords) points.push([pickupCoords[0], pickupCoords[1]]);
      if (dropoffCoords) points.push([dropoffCoords[0], dropoffCoords[1]]);

      // If fewer than 2 points, nothing to draw
      if (points.length < 2) {
        setRouteCoordinates([]);
        return;
      }

      // Try ORS directions for 2+ points
      try {
        const poly = await getRoutePolyline(points, "driving-hgv");
        setRouteCoordinates(poly);
      } catch (e) {
        console.warn("ORS directions failed:", e.message);
        setRouteCoordinates(points.map(([lng, lat]) => [lat, lng])); // Fallback
      }
    };
    buildRoute();
  }, [currentCoords, pickupCoords, dropoffCoords]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const boundsPoints = [];
    if (currentCoords) boundsPoints.push([currentCoords[1], currentCoords[0]]);
    if (pickupCoords) boundsPoints.push([pickupCoords[1], pickupCoords[0]]);
    if (dropoffCoords) boundsPoints.push([dropoffCoords[1], dropoffCoords[0]]);
    routeCoordinates.forEach((p) => boundsPoints.push(p));
    if (boundsPoints.length > 0) {
      const bounds = L.latLngBounds(boundsPoints);
      map.fitBounds(bounds.pad(0.2));
    }
  }, [routeCoordinates, currentCoords, pickupCoords, dropoffCoords]);

  useEffect(() => {
    console.log("Route coordinates:", routeCoordinates);
  }, [routeCoordinates]);

  return (
    <MapContainer
      center={center}
      zoom={5}
      whenCreated={(map) => (mapRef.current = map)}
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

      {routeCoordinates.length > 1 && (
        <Polyline positions={routeCoordinates} color="#2563eb" weight={5} opacity={0.9} />
      )}
    </MapContainer>
  );
}