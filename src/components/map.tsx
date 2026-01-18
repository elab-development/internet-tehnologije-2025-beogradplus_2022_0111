'use client';
import { MapContainer, TileLayer, ZoomControl, Marker, useMapEvents, useMap } from 'react-leaflet';
import { useEffect, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

function createStationIcon(zoomLevel: number) {
  const baseSize = 18;
  const size = Math.max(baseSize, baseSize + (zoomLevel - 13) * 3);

  return L.divIcon({
    html: `
      <div style="
        background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
        border-radius: 50%;
        width: ${size}px;
        height: ${size}px;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2px 8px rgba(59, 130, 246, 0.5), 0 0 0 3px white;
      ">
        <svg width="${size * 0.65}" height="${size * 0.65}" viewBox="0 0 512 512" fill="white">
          <path d="M488 128h-8V80c0-44.8-99.2-80-224-80S32 35.2 32 80v48h-8c-13.25 0-24 10.74-24 24v80c0 13.25 10.75 24 24 24h8v160c0 17.67 14.33 32 32 32v32c0 17.67 14.33 32 32 32h32c17.67 0 32-14.33 32-32v-32h192v32c0 17.67 14.33 32 32 32h32c17.67 0 32-14.33 32-32v-32h6.4c16 0 25.6-14.4 25.6-32V256h8c13.25 0 24-10.75 24-24v-80c0-13.26-10.75-24-24-24zM160 72c0-4.42 3.58-8 8-8h176c4.42 0 8 3.58 8 8v16c0 4.42-3.58 8-8 8H168c-4.42 0-8-3.58-8-8V72zm-48 328c-17.67 0-32-14.33-32-32s14.33-32 32-32 32 14.33 32 32-14.33 32-32 32zm128-112H128c-17.67 0-32-14.33-32-32v-96c0-17.67 14.33-32 32-32h112v160zm128 112c-17.67 0-32-14.33-32-32s14.33-32 32-32 32 14.33 32 32-14.33 32-32 32zm48-112h-112V128h112c17.67 0 32 14.33 32 32v96c0 17.67-14.33 32-32 32z"/>
        </svg>
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
    className: ''
  });
}

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function MapCenterTracker({ onCenterChange, onZoomChange }: { onCenterChange: (center: [number, number]) => void, onZoomChange: (zoom: number) => void }) {
  useMapEvents({
    moveend: (e) => {
      const center = e.target.getCenter();
      onCenterChange([center.lat, center.lng]);
    },
    zoomend: (e) => {
      onZoomChange(e.target.getZoom());
    }
  });
  return null;
}

function MapUpdater({ center, zoom }: { center: [number, number], zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

export default function Map({
  visina = '400px',
  sirina = '100%',
  zoom = 14,
  center = [44.7866, 20.4489],
  stanice = [],
  onMarkerClick
}: {
  visina?: string,
  sirina?: string,
  zoom?: number,
  center?: [number, number],
  stanice?: any[],
  onMarkerClick?: (stanica: any) => void
}) {
  const [currentCenter, setCurrentCenter] = useState<[number, number]>(center);
  const [currentZoom, setCurrentZoom] = useState<number>(zoom);
  const [nearbyStations, setNearbyStations] = useState<any[]>([]);

  useEffect(() => {
    setCurrentCenter(center);
  }, [center]);

  useEffect(() => {
    setCurrentZoom(zoom);
  }, [zoom]);

  useEffect(() => {
    if (stanice.length === 0) return;

    const stationsWithDistance = stanice.map(stanica => ({
      ...stanica,
      distance: calculateDistance(
        currentCenter[0],
        currentCenter[1],
        stanica.lat,
        stanica.lng
      )
    }));

    const nearest = stationsWithDistance
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 10);

    setNearbyStations(nearest);
  }, [currentCenter, stanice]);

  return (
    <div style={{ position: 'relative', height: visina, width: sirina }}>
      <MapContainer
        center={center}
        zoom={zoom}
        zoomControl={false}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ZoomControl position="topright" />
        <MapUpdater center={center} zoom={zoom} />
        <MapCenterTracker onCenterChange={setCurrentCenter} onZoomChange={setCurrentZoom} />

        {nearbyStations.map((stanica) => (
          <Marker
            key={stanica.stanica_id}
            position={[stanica.lat, stanica.lng]}
            icon={createStationIcon(currentZoom)}
            eventHandlers={{
              click: () => onMarkerClick && onMarkerClick(stanica)
            }}
          />
        ))}
      </MapContainer>

      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -100%)',
          zIndex: 1000,
          pointerEvents: 'none'
        }}
      >
        <svg width="30" height="40" viewBox="0 0 30 40">
          <path
            d="M15 0C8.373 0 3 5.373 3 12c0 8.25 12 28 12 28s12-19.75 12-28c0-6.627-5.373-12-12-12z"
            fill="#ef4444"
            stroke="white"
            strokeWidth="2"
          />
          <circle cx="15" cy="12" r="4" fill="white" />
        </svg>
      </div>
    </div>
  );
}