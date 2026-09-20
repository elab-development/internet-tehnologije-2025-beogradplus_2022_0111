'use client'
import { useState, useRef } from 'react';
import PopupKorisnik from './popupkorisnik';
import { Manrope } from 'next/font/google';

const poppins = Manrope({
  subsets: ['latin', 'latin-ext'], 
  weight: ['400', '500', '600', '700']
});

interface SidebarProps {
    onOpenFavorites: () => void;
}

const navItemStyle: React.CSSProperties = {
    color: "#1a1a1a",
    padding: "0.5rem 0.9rem",
    borderRadius: "8px",
    transition: "all 0.2s ease",
    cursor: "pointer",
    fontSize: "1.2rem",
    fontWeight: 500,
    fontFamily: poppins.style.fontFamily
};

export default function Sidebar({ onOpenFavorites }: SidebarProps) {
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const korisnikButtonRef = useRef<HTMLDivElement>(null);

    return (
        <header style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            backgroundColor: "#ffffff",
            color: "#1a1a1a",
            padding: "0 24px",
            height: "54px",
            width: "100%",
            flexShrink: 0,
            boxShadow: "0 2px 10px rgba(0,0,0,0.07)",
            zIndex: 1000,
            position: "relative"
        }}>
            <div style={{ display: "flex", alignItems: "center", gap: "32px" }}>
                <span
                    onClick={() => window.location.href = '/'}
                    style={{
                        fontWeight: 700,
                        fontSize: "1.3rem",
                        background: "linear-gradient(135deg, #087aae 0%, #93cff8 100%)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        backgroundClip: "text",
                        cursor: "pointer",
                        userSelect: "none"
                    }}
                >
                    BeogradBus
                </span>

                <nav style={{ display: "flex", gap: "6px" }}>
                    <div
                        onClick={() => window.location.href = '/'}
                        style={navItemStyle}
                        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#f1f3f5"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
                    >
                        Početna
                    </div>
                    <div
                        onClick={() => window.location.href = '/aboutus'}
                        style={navItemStyle}
                        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#f1f3f5"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
                    >
                        O nama
                    </div>
                </nav>
            </div>

            <div
                ref={korisnikButtonRef}
                onClick={() => setIsPopupOpen(!isPopupOpen)}
                style={{
                    ...navItemStyle,
                    backgroundColor: isPopupOpen ? "#e7f5ff" : "transparent",
                    color: isPopupOpen ? "#1971c2" : "#1a1a1a",
                    fontWeight: isPopupOpen ? 600 : 500
                }}
                onMouseEnter={(e) => { if (!isPopupOpen) e.currentTarget.style.backgroundColor = "#f1f3f5"; }}
                onMouseLeave={(e) => { if (!isPopupOpen) e.currentTarget.style.backgroundColor = "transparent"; }}
            >
                Korisnik
            </div>

            <PopupKorisnik
                isOpen={isPopupOpen}
                onClose={() => setIsPopupOpen(false)}
                triggerRef={korisnikButtonRef}
                onOpenFavorites={onOpenFavorites}
            />
        </header>
    );
}
