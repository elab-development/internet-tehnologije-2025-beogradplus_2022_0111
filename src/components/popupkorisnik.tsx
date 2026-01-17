'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Korisnik } from '../types/modeli'

interface PopupKorisnikProps {
  isOpen: boolean;
  onClose: () => void;
  triggerRef: React.RefObject<HTMLElement | null>;
}

export default function PopupKorisnik({ isOpen, onClose, triggerRef }: PopupKorisnikProps) {
  const router = useRouter();
  const popupRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [korisnik, setKorisnik] = useState<Korisnik | null>(null);
  const [isGuest, setIsGuest] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');

    if (!token || !userStr) {
      setIsGuest(true);
      setKorisnik(null);
      return;
    }

    try {
      const userData = JSON.parse(userStr);
      setKorisnik(userData);
      setIsGuest(false);
    } catch (error) {
      console.error('Greška pri parsiranju korisnika:', error);
      setIsGuest(true);
      setKorisnik(null);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && triggerRef.current && popupRef.current) {
      const triggerRect = triggerRef.current.getBoundingClientRect();
      const popupRect = popupRef.current.getBoundingClientRect();

      const top = triggerRect.bottom + 8;
      let left = triggerRect.left;

      if (left + popupRect.width > window.innerWidth) {
        left = triggerRect.right - popupRect.width;
      }

      setPosition({ top, left });
    }
  }, [isOpen, triggerRef]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popupRef.current &&
        !popupRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose, triggerRef]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('auth');
    router.push('/login');
  };

  const handleLogin = () => {
    router.push('/login');
  };

  const handleAdminPanel = () => {
    router.push('/admin');
  };

  if (!isOpen) return null;

  const getUlogaColor = (ulogaId: number) => {
    switch (ulogaId) {
      case 2: return 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'; 
      case 1: return 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'; 
      default: return 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)';
    }
  };

  const getUlogaIcon = (ulogaId: number) => {
    switch (ulogaId) {
      case 2: return '👑'; 
      case 1: return '👤'; 
      default: return '🎭';
    }
  };

  const getUlogaNaziv = (ulogaId: number) => {
    switch (ulogaId) {
      case 2: return 'Administrator';
      case 1: return 'Ulogovani korisnik';
      default: return 'Gost';
    }
  };

  return (
    <div
      ref={popupRef}
      style={{
        position: 'fixed',
        top: `${position.top}px`,
        left: `${position.left}px`,
        zIndex: 10000,
        minWidth: '320px',
        maxWidth: '380px',
        background: 'white',
        borderRadius: '16px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3), 0 0 0 1px rgba(0,0,0,0.1)',
        animation: 'popupSlideIn 0.2s ease-out',
        overflow: 'hidden'
      }}
    >
      <style>{`
        @keyframes popupSlideIn {
          from {
            opacity: 0;
            transform: translateY(-10px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>

      <div
        style={{
          background: korisnik ? getUlogaColor(korisnik.uloga_id) : 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
          padding: '24px 20px',
          color: 'white',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div style={{
          position: 'absolute',
          top: '-50%',
          right: '-20%',
          width: '200px',
          height: '200px',
          background: 'rgba(255,255,255,0.1)',
          borderRadius: '50%',
          filter: 'blur(40px)'
        }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{
            fontSize: '48px',
            marginBottom: '8px',
            textAlign: 'center',
            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))'
          }}>
            {korisnik ? getUlogaIcon(korisnik.uloga_id) : '🎭'}
          </div>
          <h3 style={{
            margin: 0,
            fontSize: '20px',
            fontWeight: '600',
            textAlign: 'center',
            textShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            {isGuest ? 'Gost' : korisnik?.ime || 'Korisnik'}
          </h3>
          {!isGuest && korisnik && (
            <p style={{
              margin: '4px 0 0 0',
              fontSize: '14px',
              opacity: 0.9,
              textAlign: 'center'
            }}>
              {korisnik.email}
            </p>
          )}
        </div>
      </div>

      <div style={{ padding: '20px' }}>
        <div style={{
          background: korisnik ? getUlogaColor(korisnik.uloga_id) : 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
          color: 'white',
          padding: '8px 16px',
          borderRadius: '20px',
          fontSize: '13px',
          fontWeight: '600',
          textAlign: 'center',
          marginBottom: '16px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        }}>
          {korisnik ? getUlogaNaziv(korisnik.uloga_id) : 'Gost'}
        </div>

        {!isGuest && korisnik && (
          <div style={{ marginBottom: '16px' }}>
            <div style={{
              background: '#f8f9fa',
              borderRadius: '12px',
              padding: '12px 16px',
              marginBottom: '8px'
            }}>
              <div style={{
                fontSize: '12px',
                color: '#6c757d',
                marginBottom: '4px',
                fontWeight: '500'
              }}>
                Korisnički ID
              </div>
              <div style={{ fontSize: '15px', fontWeight: '600', color: '#212529' }}>
                #{korisnik.korisnik_id}
              </div>
            </div>

            <div style={{
              background: '#f8f9fa',
              borderRadius: '12px',
              padding: '12px 16px'
            }}>
              <div style={{
                fontSize: '12px',
                color: '#6c757d',
                marginBottom: '4px',
                fontWeight: '500'
              }}>
                Član od
              </div>
              <div style={{ fontSize: '15px', fontWeight: '600', color: '#212529' }}>
                {new Date(korisnik.datum_kreiranja).toLocaleDateString('sr-RS', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </div>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {isGuest ? (
            <button
              onClick={handleLogin}
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                border: 'none',
                padding: '12px',
                borderRadius: '10px',
                fontSize: '15px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.5)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.4)';
              }}
            >
              Prijavite se
            </button>
          ) : (
            <>
              {korisnik?.uloga_id === 2 && (
                <button
                  onClick={handleAdminPanel}
                  aria-label="Admin panel"
                  style={{
                    background: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
                    color: '#212529',
                    border: 'none',
                    padding: '10px',
                    borderRadius: '10px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
                  }}
                >
                  ⚙️ Admin panel
                </button>
              )}

              <button
                onClick={handleLogout}
                style={{
                  background: 'white',
                  color: '#dc3545',
                  border: '1px solid #dc3545',
                  padding: '10px',
                  borderRadius: '10px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#dc3545';
                  e.currentTarget.style.color = 'white';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'white';
                  e.currentTarget.style.color = '#dc3545';
                }}
              >
                🚪 Odjavi se
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}