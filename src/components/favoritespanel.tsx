'use client';
import { useEffect, useState } from 'react';
import { Linija, Stanica } from '../types/modeli';
import LineItem from './line';     
import StationItem from './station'; 

interface FavoritesPanelProps {
  isOpen: boolean;
  onClose: () => void;
  omiljeneId: number[];          
  omiljeneStaniceId: number[];   
  onLineSelect: (lineId: number) => void;
  onStationSelect: (stanica: Stanica) => void; 
  sveStanice: Stanica[];         
}

export default function FavoritesPanel({ 
  isOpen, 
  onClose, 
  omiljeneId, 
  omiljeneStaniceId,
  onLineSelect,
  onStationSelect,
  sveStanice
}: FavoritesPanelProps) {
  const asArray = <T,>(value: unknown): T[] => (Array.isArray(value) ? value : []);
  
  const [sveLinije, setSveLinije] = useState<Linija[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'linije' | 'stanice'>('linije');

  useEffect(() => {
    const fetchLines = async () => {
      try {
        const res = await fetch('/api/lines');
        const data = await res.json();
        setSveLinije(asArray<Linija>(data));
      } catch (error) {
        console.error(error);
        setSveLinije([]);
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) {
      fetchLines();
    }
  }, [isOpen]);

  const favoriteLinesData = asArray<Linija>(sveLinije).filter(l => omiljeneId.includes(l.linija_id));
  const favoriteStationsData = asArray<Stanica>(sveStanice).filter(s => omiljeneStaniceId.includes(s.stanica_id));


  const tabBaseStyle = {
    flex: 1,
    padding: '10px',
    borderRadius: '8px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    transition: 'all 0.2s ease',
    background: 'transparent',
    color: '#6c757d'
  };

  const activeTabStyle = {
    ...tabBaseStyle,
    background: 'white',
    color: '#1a1a1a',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
  };

  return (
    <>
  
      <div 
        onClick={onClose}
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.2)', zIndex: 9998,
          opacity: isOpen ? 1 : 0, pointerEvents: isOpen ? 'auto' : 'none',
          backdropFilter: 'blur(2px)',
          transition: 'opacity 0.3s ease'
        }}
      />


      <div style={{
        position: 'fixed', top: 0, right: 0, width: '360px', height: '100vh',
        background: '#ffffff', zIndex: 10001,
        boxShadow: '-10px 0 30px rgba(0,0,0,0.05)',
        transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        display: 'flex', flexDirection: 'column'
      }}>
        

        <div style={{ 
          padding: '32px 24px 20px 24px', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center' 
        }}>
          <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '800', letterSpacing: '-0.5px', color: '#111' }}>
            Omiljeno
          </h2>
          <button 
            onClick={onClose} 
            style={{ 
              border: 'none', background: '#f3f4f6', borderRadius: '50%', width: '32px', height: '32px', 
              display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#666', transition: 'background 0.2s' 
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#e5e7eb'}
            onMouseLeave={(e) => e.currentTarget.style.background = '#f3f4f6'}
          >
            ✕
          </button>
        </div>


        <div style={{ padding: '0 24px 20px 24px' }}>
          <div style={{ 
            background: '#f3f4f6', 
            padding: '4px', 
            borderRadius: '12px', 
            display: 'flex' 
          }}>
            <button 
              onClick={() => setActiveTab('linije')}
              style={activeTab === 'linije' ? activeTabStyle : tabBaseStyle}
            >
              Linije
            </button>
            <button 
              onClick={() => setActiveTab('stanice')}
              style={activeTab === 'stanice' ? activeTabStyle : tabBaseStyle}
            >
              Stanice
            </button>
          </div>
        </div>

 
        <div style={{ overflowY: 'auto', flex: 1, padding: '0 16px 20px 16px' }}>
          
          {activeTab === 'linije' && (
            loading ? <div style={{ textAlign: 'center', color: '#999', marginTop: '40px', fontSize: '14px' }}>Učitavanje...</div> :
            favoriteLinesData.length === 0 ? <div style={{ textAlign: 'center', color: '#999', marginTop: '40px', fontSize: '14px' }}>Nema omiljenih linija.</div> :
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {favoriteLinesData.map((linija) => (
                <LineItem 
                  key={linija.linija_id}
                  linija={linija}
                  onClick={() => { onLineSelect(linija.linija_id); onClose(); }}
                />
              ))}
            </div>
          )}

          {activeTab === 'stanice' && (
             favoriteStationsData.length === 0 ? <div style={{ textAlign: 'center', color: '#999', marginTop: '40px', fontSize: '14px' }}>Nema omiljenih stanica.</div> :
             <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
               {favoriteStationsData.map((stanica) => (
                <StationItem
                  key={stanica.stanica_id}
                  stanica={stanica}
                  onClick={() => { onStationSelect(stanica); onClose(); }}
                />
              ))}
             </div>
          )}

        </div>
      </div>
    </>
  );
}
