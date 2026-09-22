"use client";

import { useEffect, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapDestination } from "@/lib/sri-lanka-map-data";

interface LeafletRouteMapProps {
  allDestinations: MapDestination[];
  selectedDestinations: MapDestination[];
  onSelectDestination: (id: string) => void;
  onRemoveDestination: (id: string) => void;
  isMandatory: (id: string) => boolean;
  atLimit: boolean;
}

/** Component to auto-fit bounds when selected destinations change */
function MapBoundsController({ points }: { points: [number, number][] }) {
  const map = useMap();

  useEffect(() => {
    if (points.length === 0) return;
    if (points.length === 1) {
      map.setView(points[0], 9);
      return;
    }
    const bounds = L.latLngBounds(points);
    map.fitBounds(bounds, { padding: [60, 60], maxZoom: 10, animate: true });
  }, [map, points]);

  return null;
}

/** Create custom HTML divIcon for Red Location Pin Markers with Name Label Above */
function createRedPinIcon(name: string, stopNumber?: number, isSelected?: boolean, isMandatory?: boolean) {
  const pinColor = isSelected ? "#ef4444" : "#475569";
  const badgeBg = isSelected ? "#061b2e" : "#ffffff";
  const badgeText = isSelected ? "#ffffff" : "#061b2e";
  const badgeBorder = isSelected ? "rgba(255,255,255,0.2)" : "#cbd5e1";

  const html = `
    <div style="
      display: flex;
      flex-direction: column;
      align-items: center;
      transform: translate(-50%, -100%);
      cursor: pointer;
    ">
      <!-- Location Name Label Above -->
      <div style="
        background: ${badgeBg};
        color: ${badgeText};
        font-weight: 700;
        font-size: 11px;
        padding: 4px 10px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.25);
        white-space: nowrap;
        margin-bottom: 3px;
        display: flex;
        align-items: center;
        gap: 5px;
        border: 1px solid ${badgeBorder};
        line-height: 1;
      ">
        ${stopNumber ? `<span style="background: #ef4444; color: #ffffff; width: 18px; height: 18px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 800;">${stopNumber}</span>` : '<span style="color: #ef4444; font-weight: 800; font-size: 12px;">+</span>'}
        <span>${name}</span>
        ${isMandatory ? '<span style="font-size: 9px;">🔒</span>' : ''}
      </div>

      <!-- Red Location Pin -->
      <div style="position: relative; width: 28px; height: 34px;">
        <svg viewBox="0 0 24 32" width="28" height="34" style="filter: drop-shadow(0px 3px 5px rgba(0,0,0,0.35));">
          <path d="M12 0 C5.37 0 0 5.37 0 12 C0 21 12 32 12 32 C12 32 24 21 24 12 C24 5.37 18.63 0 12 0 Z" fill="${pinColor}" />
          <circle cx="12" cy="11" r="4.5" fill="#ffffff" />
        </svg>
      </div>
    </div>
  `;

  return L.divIcon({
    html,
    className: "leaflet-red-pin-wrapper",
    iconSize: [0, 0],
    iconAnchor: [0, 0],
  });
}

export default function LeafletRouteMap({
  allDestinations,
  selectedDestinations,
  onSelectDestination,
  onRemoveDestination,
  isMandatory,
  atLimit,
}: LeafletRouteMapProps) {
  // Center of Sri Lanka
  const defaultCenter: [number, number] = [7.8731, 80.7718];

  const selectedIds = useMemo(
    () => new Set(selectedDestinations.map((d) => d.id)),
    [selectedDestinations]
  );

  // LatLng tuples for route polyline
  const routePolyline = useMemo(
    () => selectedDestinations.map((d) => [d.lat, d.lng] as [number, number]),
    [selectedDestinations]
  );

  return (
    <div className="relative h-full w-full overflow-hidden rounded-2xl shadow-inner">
      <MapContainer
        center={defaultCenter}
        zoom={7.5}
        scrollWheelZoom={true}
        className="h-full w-full z-0"
        style={{ background: "#e0eedb" }}
      >
        {/* CartoDB Voyager Tiles (Clean high-definition real map layer) */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          maxZoom={18}
        />

        {/* Dynamic Map bounds adjuster */}
        <MapBoundsController points={routePolyline} />

        {/* Route Polyline (Gold route line with dark outline) */}
        {routePolyline.length >= 2 && (
          <>
            <Polyline
              positions={routePolyline}
              pathOptions={{
                color: "#061b2e",
                weight: 6,
                opacity: 0.25,
                lineCap: "round",
                lineJoin: "round",
              }}
            />
            <Polyline
              positions={routePolyline}
              pathOptions={{
                color: "#f5a623",
                weight: 4,
                opacity: 0.95,
                dashArray: "8, 8",
                lineCap: "round",
                lineJoin: "round",
              }}
            />
          </>
        )}

        {/* Unselected Destination Markers (Available to add) */}
        {allDestinations
          .filter((d) => !selectedIds.has(d.id))
          .map((dest) => (
            <Marker
              key={dest.id}
              position={[dest.lat, dest.lng]}
              icon={createRedPinIcon(dest.name, undefined, false, false)}
              eventHandlers={{
                click: () => {
                  if (!atLimit) onSelectDestination(dest.id);
                },
              }}
            />
          ))}

        {/* Selected Destination Markers (Red Pins with Stop Numbers & Names Above) */}
        {selectedDestinations.map((dest, index) => {
          const mandatory = isMandatory(dest.id);
          return (
            <Marker
              key={dest.id}
              position={[dest.lat, dest.lng]}
              icon={createRedPinIcon(dest.name, index + 1, true, mandatory)}
              eventHandlers={{
                click: () => {
                  if (!mandatory) onRemoveDestination(dest.id);
                },
              }}
            />
          );
        })}
      </MapContainer>
    </div>
  );
}
