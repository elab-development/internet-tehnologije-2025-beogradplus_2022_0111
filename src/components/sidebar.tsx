'use client'
import Linkbtn from './linkbtn'

export default function Sidebar() {
    return (
        <aside style={{
            display: "flex",
            flexDirection: "column",
            backgroundColor: "#1a1a1a",
            color: "white",
            padding: "1.5rem 1rem",
            height: "100vh",
            gap: "1rem",
            width: "100%",
            overflowY: "auto"
        }}>
            <nav style={{
                display: "flex",
                flexDirection: "column",
                width: "100%",
                gap: "0.75rem"
            }}>
                <Linkbtn 
                    href="/" 
                    label="Početna" 
                    style={{
                        color: "#fff",
                        textDecoration: "none",
                        padding: "0.75rem 1rem",
                        borderRadius: "8px",
                        transition: "all 0.2s ease",
                        backgroundColor: "transparent"
                    }}
                    activeStyle={{
                        backgroundColor: "#4dabf7",
                        fontWeight: "600"
                    }}
                />
                <Linkbtn 
                    href="/aboutus" 
                    label="O nama" 
                    style={{
                        color: "#fff",
                        textDecoration: "none",
                        padding: "0.75rem 1rem",
                        borderRadius: "8px",
                        transition: "all 0.2s ease",
                        backgroundColor: "#4dabf7",
                        fontWeight: "600"
                    }}
                />
                <Linkbtn 
                    href="/user" 
                    label="Korisnik" 
                    style={{
                        color: "#fff",
                        textDecoration: "none",
                        padding: "0.75rem 1rem",
                        borderRadius: "8px",
                        transition: "all 0.2s ease",
                        backgroundColor: "transparent"
                    }}
                    activeStyle={{
                        backgroundColor: "#4dabf7",
                        fontWeight: "600"
                    }}
                />
            </nav>
        </aside>
    );
}