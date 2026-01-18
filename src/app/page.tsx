'use client';
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from 'next/dynamic';
import Sidebar from '../components/sidebar';
import Searchbar from '../components/searchbar';
import { Stanica } from '../types/modeli';

function donesiMapu() {
  return import('../components/map');
}

const Map = dynamic(donesiMapu, { ssr: false });

export default function Home() {
  const router = useRouter();
  const [mapCenter, setMapCenter] = useState<[number, number]>([44.7866, 20.4489]);
  const [mapZoom, setMapZoom] = useState(14);
  const [stanice, setStanice] = useState<Stanica[]>([]);

  useEffect(() => {
    const fetchStanice = async () => {
      const res = await fetch('/api/stations');
      const data = await res.json();
      setStanice(data);  
    };
    fetchStanice();
  }, []);
  useEffect(() => {
    const auth = sessionStorage.getItem("auth");
    if (!auth) {
      router.push("/login");
    }
  }, [router]);

  function handleStationSelect(stanica: Stanica) {

    setMapCenter([stanica.lat, stanica.lng]);
    setMapZoom(17);
  }

  return (
    <div style={{ height: "100vh", width: "100vw", display: "flex" }}>
      <div
        style={{
          height: "100vh",
          width: "6vw",
          display: "flex",
          flexDirection: "column"
        }}
      >
        <Sidebar />
      </div>
      <div style={{ flex: 1, position: "relative" }}>
        <div style={{ position: "relative", zIndex: 0, height: "100%", width: "100%" }}>
          <Map
            visina="100%"
            sirina="100%"
            center={mapCenter}
            zoom={mapZoom}
            stanice = {stanice}
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
          <Searchbar onStationSelect={handleStationSelect} />
        </div>
      </div>
    </div>
  );
}