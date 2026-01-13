'use client';

import { MapContainer, TileLayer, ZoomControl } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

export default function Map({ visina = '400px', sirina = '100%', zoom = 14 }) {
  return (
    <div style={{ height: visina, width: sirina }}>
      <MapContainer scrollWheelZoom={true}
        center={[44.81621, 20.4178]}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        <ZoomControl position="bottomright" />
      </MapContainer>
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        width: '32px',
        height: '32px',
        transform: 'translate(-50%, -100%)',
        backgroundImage: "url('https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png')",
        backgroundSize: 'contain',
        backgroundRepeat: 'no-repeat',
        pointerEvents: 'none',
        zIndex: 1000
      }}
      />

    </div>
  );
}


