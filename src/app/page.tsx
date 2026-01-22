'use client';
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import dynamic from 'next/dynamic';
import Sidebar from '../components/sidebar';
import Searchbar from '../components/searchbar';
import FavoritesPanel from '../components/favoritespanel';
import { Stanica, Linija, OmiljenaLinija, OmiljenaStanica } from '../types/modeli';

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
  
  const [korisnikId, setKorisnikId] = useState<number | undefined>(undefined);
  const [showFavorites, setShowFavorites] = useState(false);

  const [omiljeneLinije, setOmiljeneLinije] = useState<number[]>([]);
  const [omiljeneStanice, setOmiljeneStanice] = useState<number[]>([]); 
  
  const [loadingFavorite, setLoadingFavorite] = useState(false);

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
      return;
    }

    if (auth !== "guest" && token) {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          setKorisnikId(user.korisnik_id);
        } catch (error) { console.error(error); }
      }
    }
  }, [router]);

  const osveziOmiljene = useCallback(async () => {
    if (!korisnikId) return;
    const token = localStorage.getItem('token');
    
    try {
      const res = await fetch(`/api/favorites/lines?korisnik_id=${korisnikId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data: OmiljenaLinija[] = await res.json();
        const lineIds = data.map(item => item.linija_id);
        setOmiljeneLinije(lineIds);
      }
    } catch (error) { console.error(error); }

    try {
      const res = await fetch(`/api/favorites/stations?korisnik_id=${korisnikId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data: OmiljenaStanica[] = await res.json();
        const stIds = data.map(item => item.stanica_id); 
        setOmiljeneStanice(stIds);
      }
    } catch (error) { console.error('Greška stanice:', error); }
  }, [korisnikId]);

  useEffect(() => {
    osveziOmiljene();
  }, [osveziOmiljene]);

  useEffect(() => {
    if (showFavorites) {
      osveziOmiljene();
    }
  }, [showFavorites, osveziOmiljene]);

  useEffect(() => {
    if (selectedLineId) { fetchLineInfo(selectedLineId); } 
    else { setSelectedLine(null); }
  }, [selectedLineId]);

  async function fetchLineInfo(lineId: number) {
    try {
      const res = await fetch('/api/lines');
      const data = await res.json();
      const line = data.find((l: Linija) => l.linija_id === lineId);
      setSelectedLine(line || null);
    } catch (error) { console.error(error); setSelectedLine(null); }
  }


  function handleStationSelect(stanica: Stanica) {
    setSelectedStation(stanica);
    setMapCenter([stanica.lat, stanica.lng]);
    setMapZoom(17);
    setSelectedLineId(undefined); 
  }

  function handleClearSelectedStation() { setSelectedStation(null); }

  function handleLineSelect(lineId: number) {
    setSelectedLineId(lineId);
    setSelectedStation(null); 
  }

  function handleClearLine() { setSelectedLineId(undefined); }

  return (
    <div style={{ height: "100vh", width: "100vw", display: "flex" }}>
      <Sidebar onOpenFavorites={() => setShowFavorites(true)} />
      
      <FavoritesPanel 
        isOpen={showFavorites}
        onClose={() => setShowFavorites(false)}
        omiljeneId={omiljeneLinije}
        omiljeneStaniceId={omiljeneStanice}
        onLineSelect={handleLineSelect}
        onStationSelect={handleStationSelect}
        sveStanice={stanice}
      />

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
        
        <div style={{ position: "absolute", left: "1vw", top: "1%", zIndex: 9999 }}>
          <Searchbar
            onStationSelect={handleStationSelect}
            selectedStation={selectedStation}
            onClearSelectedStation={handleClearSelectedStation}
            onLineSelect={handleLineSelect}
            korisnikId={korisnikId} 
          />
        </div>
        

        
      </div>
    </div>
  );
}