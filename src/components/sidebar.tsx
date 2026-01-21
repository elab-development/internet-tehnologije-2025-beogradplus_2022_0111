'use client'
import { useState, useRef } from 'react';
import PopupKorisnik from './popupkorisnik';

export default function Sidebar() {
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const korisnikButtonRef = useRef<HTMLDivElement>(null);

    return (
        <aside style={{
            display: "flex",
            flexDirection: "column",
            backgroundColor: "#1a1a1a",
            color: "white",
            padding: "1.5rem 1rem",
            height: "100vh",
            gap: "1rem",
            width: "115px",
            minWidth: "115px",
            flexShrink: 0,
            overflowY: "auto"
        }}>
            <nav style={{
                display: "flex",
                flexDirection: "column",
                width: "100%",
                gap: "0.75rem"
            }}>
                <div
                    onClick={() => window.location.href = '/'}
                    style={{
                        color: "#fff",
                        padding: "0.5rem 0.75rem",
                        borderRadius: "8px",
                        transition: "all 0.2s ease",
                        backgroundColor: "transparent",
                        cursor: "pointer"
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = "#2c2c2c";
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "transparent";
                    }}
                >
                    Početna
                </div>
                <div
                    onClick={() => window.location.href = '/aboutus'}
                    style={{
                        color: "#fff",
                        padding: "0.5rem 0.75rem",
                        borderRadius: "8px",
                        transition: "all 0.2s ease",
                        backgroundColor: "transparent",
                        cursor: "pointer"
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = "#2c2c2c";
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "transparent";
                    }}
                >
                    O nama
                </div>
                
                <div
                    ref={korisnikButtonRef}
                    onClick={() => setIsPopupOpen(!isPopupOpen)}
                    style={{
                        color: "#fff",
                        padding: "0.5rem 0.75rem",
                        borderRadius: "8px",
                        transition: "all 0.2s ease",
                        backgroundColor: isPopupOpen ? "#4dabf7" : "transparent",
                        cursor: "pointer",
                        fontWeight: isPopupOpen ? "600" : "normal"
                    }}
                    onMouseEnter={(e) => {
                        if (!isPopupOpen) {
                            e.currentTarget.style.backgroundColor = "#2c2c2c";
                        }
                    }}
                    onMouseLeave={(e) => {
                        if (!isPopupOpen) {
                            e.currentTarget.style.backgroundColor = "transparent";
                        }
                    }}
                >
                    Korisnik
                </div>
                <PopupKorisnik
                    isOpen={isPopupOpen}
                    onClose={() => setIsPopupOpen(false)}
                    triggerRef={korisnikButtonRef}
                />
            </nav>
        </aside>
    );
}