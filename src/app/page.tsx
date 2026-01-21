'use client';
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from 'next/dynamic';
import Sidebar from '../components/sidebar';
import Searchbar from '../components/searchbar';
import { Stanica, Linija } from '../types/modeli';

function donesiMapu() {
  return import('../components/map');
}

const Map = dynamic(donesiMapu, { ssr: false });

export default function Home() {
  const router = useRouter();
  const [mapCenter, setMapCenter] = useState<[number, number]>([44.7866, 20.4489]);
  const [mapZoom, setMapZoom] = useState(14);
  const [stanice, setStanice] = useState<Stanica[]>([]);
  const [selectedStation, setSelectedStation] = useState<Stanica | null>(null);
  const [selectedLineId, setSelectedLineId] = useState<number | undefined>(undefined);
  const [selectedLine, setSelectedLine] = useState<Linija | null>(null);

  useEffect(() => {
    const fetchStanice = async () => {
      const res = await fetch('/api/stations');
      const data = await res.json();
      setStanice(data);
    };
    fetchStanice();
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const auth = localStorage.getItem("auth");
    if (!token && auth !== "true" && auth !== "guest") {
      router.push("/login");
    }
  }, [router]);

  useEffect(() => {
    if (selectedLineId) {
      fetchLineInfo(selectedLineId);
    } else {
      setSelectedLine(null);
    }
  }, [selectedLineId]);

  async function fetchLineInfo(lineId: number) {
    try {
      const res = await fetch('/api/lines');
      const data = await res.json();
      const line = data.find((l: Linija) => l.linija_id === lineId);
      setSelectedLine(line || null);
    } catch (error) {
      console.error('Error fetching line info:', error);
      setSelectedLine(null);
    }
  }

  function handleStationSelect(stanica: Stanica) {
    setSelectedStation(stanica);
    setMapCenter([stanica.lat, stanica.lng]);
    setMapZoom(17);
    setSelectedLineId(undefined); 
  }

  function handleClearSelectedStation() {
    setSelectedStation(null);
  }

  function handleLineSelect(lineId: number) {
    setSelectedLineId(lineId);
    setSelectedStation(null); 
  }

  function handleClearLine() {
    setSelectedLineId(undefined);
  }

  return (
    <div style={{ height: "100vh", width: "100vw", display: "flex" }}>
      <Sidebar />
      <div style={{ flex: 1, position: "relative" }}>
        <div style={{ position: "relative", zIndex: 0, height: "100%", width: "100%" }}>
          <Map
            visina="100%"
            sirina="100%"
            center={mapCenter}
            zoom={mapZoom}
            stanice={stanice}
            onMarkerClick={(s: Stanica) => handleStationSelect(s)}
            linija_id={selectedLineId}
          />
        </div>
        <div
          style={{
            position: "absolute",
            left: "1vw",
            top: "1%",
            zIndex: 9999
          }}
        >
          <Searchbar
            onStationSelect={handleStationSelect}
            selectedStation={selectedStation}
            onClearSelectedStation={handleClearSelectedStation}
            onLineSelect={handleLineSelect}
          />
        </div>
        {selectedLineId && selectedLine && (
          <div
            style={{
              position: "absolute",
              left: "1vw",
              bottom: "2%",
              zIndex: 9999,
              background: 'white',
              padding: '12px 16px',
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}
          >
            <span>Prikazana ruta za liniju {selectedLine.broj}</span>
            <button 
              onClick={handleClearLine}
              className="btn btn-sm btn-outline-secondary"
              style={{ cursor: 'pointer' }}
            >
              Očisti
            </button>
          </div>
        )}
      </div>
    </div>
  );
}