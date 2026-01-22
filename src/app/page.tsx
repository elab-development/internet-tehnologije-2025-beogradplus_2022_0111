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
    } catch (error) { console.error(error); }
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

  const handleToggleFavoriteLine = async () => {
    if (!korisnikId || !selectedLineId) return;
    const token = localStorage.getItem('token');
    const isFavorite = omiljeneLinije.includes(selectedLineId);
    
    try {
      let url = '/api/favorites/lines';
      const options: RequestInit = {
        method: isFavorite ? 'DELETE' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      };

      if (isFavorite) {
        url = `/api/favorites/lines?korisnik_id=${korisnikId}&linija_id=${selectedLineId}`;
      } else {
        options.body = JSON.stringify({ 
          korisnik_id: korisnikId, 
          linija_id: selectedLineId 
        });
      }

      const res = await fetch(url, options);

      if (res.ok) {
        osveziOmiljene();
      }
    } catch (error) {
      console.error(error);
    }
  };

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

        {selectedLine && (
          <div style={{
            position: 'absolute',
            bottom: '32px',
            left: '32px',
            zIndex: 9999,
            background: 'white',
            borderRadius: '16px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.15), 0 0 1px rgba(0,0,0,0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 24px',
            minWidth: '320px',
            maxWidth: '400px',
            animation: 'slideUp 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
          }}>
            <style>{`
              @keyframes slideUp {
                from { opacity: 0; transform: translateY(20px) scale(0.98); }
                to { opacity: 1; transform: translateY(0) scale(1); }
              }
            `}</style>

            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '12px', 
              flex: 1,
              marginRight: '16px'
            }}>
              <span style={{ 
                fontSize: '26px', 
                fontWeight: '500', 
                color: '#212529',
                lineHeight: '1',
                flexShrink: 0,
                textShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}>
                {selectedLine.broj}
              </span>
              
              <span style={{ 
                fontSize: '16px', 
                color: '#495057', 
                fontWeight: '400',
                textShadow: '0 1px 2px rgba(0,0,0,0.05)',
                lineHeight: '1.25',
                wordBreak: 'break-word'
              }}>
                {selectedLine.ime_linije}
              </span>
            </div>

            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '12px',
              flexShrink: 0
            }}>
              {korisnikId && (
                <button
                  onClick={handleToggleFavoriteLine}
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '10px',
                    border: 'none',
                    background: omiljeneLinije.includes(selectedLine.linija_id) ? '#fff9db' : '#f1f3f5',
                    color: omiljeneLinije.includes(selectedLine.linija_id) ? '#fab005' : '#9ca3af',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '24px',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {omiljeneLinije.includes(selectedLine.linija_id) ? '★' : '☆'}
                </button>
              )}

              <button
                onClick={handleClearLine}
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '10px',
                  border: 'none',
                  background: 'transparent',
                  color: '#adb5bd',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '22px',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#495057'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#adb5bd'}
              >
                ✕
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}