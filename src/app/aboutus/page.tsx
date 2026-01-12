'use client'
import Sidebar from '../../components/sidebar'
import Linkbtn from '../../components/linkbtn'
import { MapContainer, TileLayer } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

export default function AboutUs() {
  return (
    <div style={{ display: "flex", minHeight: "100vh", width: "100vw" }}>
      
      {/* Sidebar - sada je pune visine */}
      <div style={{ 
        position: "sticky", 
        top: 0, 
        height: "100vh",
        alignSelf: "flex-start",
        flexShrink: 0
      }}>
        <Sidebar />
      </div>

      {/* Main Content */}
      <div style={{ 
        flex: 1, 
        position: "relative", 
        fontSize: "0.9rem",
        overflowX: "hidden"
      }}>
        
        {/* Background Map */}
        <div style={{
          position: "absolute",
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0,
          zIndex: 0,
          filter: "blur(6px) brightness(0.7)",
          pointerEvents: "none",
          minHeight: "200vh"
        }}>
          <MapContainer
            center={[44.8264, 20.4318]}
            zoom={13}
            scrollWheelZoom={false}
            style={{ height: "200vh", width: "100%" }}
            zoomControl={false}
            dragging={false}
            doubleClickZoom={false}
            attributionControl={false}
          >
            <TileLayer 
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
          </MapContainer>
        </div>

        {/* Foreground Content */}
        <div style={{ 
          position: "relative", 
          zIndex: 1, 
          fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
          color: "#fff",
          minHeight: "100vh"
        }}>
          <div className="container py-5">

            {/* Hero */}
            <div className="row justify-content-center mb-5">
              <div className="col-lg-8 text-center">
                <h1 className="display-4 fw-bold mb-4" style={{ 
                  textShadow: "2px 2px 8px rgba(0,0,0,0.7)",
                  color: "#fff"
                }}>
                  O <span style={{ color: "#4dabf7" }}>BeoGradPlus</span>
                </h1>
                <p className="lead mb-4 fs-5" style={{ 
                  textShadow: "1px 1px 4px rgba(0,0,0,0.6)",
                  fontWeight: 300
                }}>
                  Vaš pouzdan saputnik u navigaciji kroz Beograd. Pratite javni prevoz u realnom vremenu i planirajte putovanje bez stresa.
                </p>
              </div>
            </div>

            {/* Mission */}
            <div className="row justify-content-center mb-5">
              <div className="col-lg-10">
                <div className="rounded-4 p-4 shadow-lg" style={{ 
                  backgroundColor: 'rgba(0,0,0,0.4)',
                  backdropFilter: "blur(10px)",
                  border: "1px solid rgba(255,255,255,0.1)"
                }}>
                  <h2 className="h3 fw-bold mb-3 text-center" style={{ color: "#fff" }}>Naša Misija</h2>
                  <p className="mb-0 text-center fs-5" style={{ color: "rgba(255,255,255,0.9)" }}>
                    BeoGradPlus je kreiran da pojednostavi svakodnevno korišćenje gradskog prevoza. 
                    Sve linije, stanice i rute – jasno, brzo i pouzdano.
                  </p>
                </div>
              </div>
            </div>

            {/* Features */}
            <div className="row g-4 mb-5">
              {[
                { icon: '🚌', title: 'Sve Linije', text: 'Kompletan pregled svih gradskih linija sa ključnim informacijama.' },
                { icon: '📍', title: 'Precizne Lokacije', text: 'Tačne lokacije stanica za brzu orijentaciju u gradu.' },
                { icon: '⭐', title: 'Omiljene Stanice', text: 'Sačuvajte najčešće korišćene stanice i linije.' }
              ].map((f, i) => (
                <div className="col-md-4" key={i}>
                  <div className="text-center p-4 rounded-4 shadow-lg h-100" style={{ 
                    backgroundColor: '#fff',
                    border: "none",
                    transition: "transform 0.3s ease"
                  }}>
                    <div className="rounded-circle d-inline-flex align-items-center justify-content-center mb-3 shadow-sm"
                         style={{ 
                           width: 80, 
                           height: 80, 
                           backgroundColor: '#f8f9fa'
                         }}>
                      <span className="fs-1">{f.icon}</span>
                    </div>
                    <h4 className="fw-bold mb-3" style={{ color: '#212529' }}>{f.title}</h4>
                    <p style={{ 
                      color: '#495057', 
                      lineHeight: 1.6,
                      fontSize: "0.95rem"
                    }}>{f.text}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Stats */}
            <div className="row g-4 mb-5">
              {[
                { value: '1200+', label: 'Stanica' },
                { value: '150+', label: 'Linija' },
                { value: '24/7', label: 'Dostupnost' },
                { value: '100%', label: 'Besplatno' }
              ].map((s, i) => (
                <div className="col-md-3 col-6" key={i}>
                  <div className="text-center p-4 rounded-4 shadow-lg" style={{ 
                    backgroundColor: '#fff',
                    border: "none"
                  }}>
                    <h3 className="display-6 fw-bold mb-2" style={{ 
                      color: '#212529',
                      textShadow: "none"
                    }}>{s.value}</h3>
                    <p className="mb-0 fw-medium" style={{ 
                      color: '#495057',
                      fontSize: "1rem"
                    }}>{s.label}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* How it works */}
            <div className="row justify-content-center mb-5">
              <div className="col-lg-10">
                <h2 className="h3 fw-bold mb-4 text-center" style={{ color: "#fff" }}>Kako Funkcioniše</h2>
                <div className="row g-4">
                  {[
                    { n: 1, title: 'Pretražite', text: 'Pronađite stanicu ili liniju.' },
                    { n: 2, title: 'Sačuvajte', text: 'Dodajte omiljene za brzi pristup.' },
                    { n: 3, title: 'Planirajte', text: 'Organizujte putovanje lako.' }
                  ].map((s) => (
                    <div className="col-md-4" key={s.n}>
                      <div className="d-flex gap-3 align-items-start p-3 rounded-3" style={{ 
                        backgroundColor: 'rgba(255,255,255,0.1)',
                        backdropFilter: "blur(5px)"
                      }}>
                        <div className="rounded-circle d-flex align-items-center justify-content-center fw-bold flex-shrink-0"
                             style={{ 
                               width: 40, 
                               height: 40, 
                               backgroundColor: '#4dabf7', 
                               color: '#fff',
                               fontSize: "1.1rem"
                             }}>
                          {s.n}
                        </div>
                        <div>
                          <h5 className="fw-bold mb-1" style={{ color: "#fff" }}>{s.title}</h5>
                          <p className="mb-0" style={{ color: "rgba(255,255,255,0.8)" }}>{s.text}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="row justify-content-center">
              <div className="col-lg-8 text-center">
                <div className="rounded-4 p-5 shadow-lg" style={{ 
                  backgroundColor: 'rgba(0,0,0,0.4)',
                  backdropFilter: "blur(10px)",
                  border: "1px solid rgba(255,255,255,0.1)"
                }}>
                  <h3 className="fw-bold mb-3" style={{ color: "#fff" }}>Kreirano za Beograđane</h3>
                  <p className="mb-4 fs-5" style={{ color: "rgba(255,255,255,0.9)" }}>
                    Fokusirano na realne potrebe svakodnevnog kretanja kroz grad.
                  </p>
                  <Linkbtn 
                    href="/" 
                    label="Počnite da koristite" 
                    className="btn btn-lg px-5 py-3 fw-semibold"
                    style={{
                      backgroundColor: "#4dabf7",
                      color: "#fff",
                      border: "none",
                      borderRadius: "12px",
                      fontSize: "1.1rem",
                      transition: "all 0.3s ease"
                    }}
                  />
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  )
}