'use client';

import { MapContainer, TileLayer, ZoomControl } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

export default function Map({ visina = '400px', sirina = '100%', zoom = 13 }) {
  return (
    <div style={{ height: visina, width: sirina }}>
      <MapContainer scrollWheelZoom={true}
        center={[44.8264, 20.4318]}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
      >
         <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        <ZoomControl position="bottomright" />
      </MapContainer>
    </div>
  );
}
