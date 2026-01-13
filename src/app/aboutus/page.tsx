'use client'
import Sidebar from '../../components/sidebar'
import Linkbtn from '../../components/linkbtn'
import Bubble from '../../components/bubble'
import dynamic from 'next/dynamic'

const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
)

const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
)

export default function AboutUs() {
  return (
    <div className="d-flex" style={{ minHeight: "100vh", width: "100vw" }}>

      <div style={{
        width: "7vw",
        height: "100vh",
        position: "fixed",
        top: 0,
        left: 0,
        zIndex: 1000
      }}>
        <Sidebar />
      </div>

      <div className="flex-grow-1 position-relative" style={{ marginLeft: "7vw" }}>

        <div style={{
          position: "fixed",
          top: 0, left: 0, right: 0, bottom: 0,
          zIndex: 0,
          filter: "blur(6px)",
          pointerEvents: "none",
          height: "200vh"
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
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          </MapContainer>
        </div>

        <div className="position-relative z-1" style={{
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif',
          height: "100%",
          overflowY: "auto",
          paddingTop: "3rem",
          paddingBottom: "5rem"
        }}>
          <div className="container py-4">

            <div className="row justify-content-center mb-5">
              <div className="col-lg-8 text-center">
                <h1 className="display-4 fw-bold mb-4 text-dark">
                  O <span className="text-dark fw-bolder">Beograd-Plus</span>
                </h1>
                <p className="lead mb-4 text-dark fw-normal" style={{
                  maxWidth: "800px",
                  margin: "0 auto",
                  lineHeight: "1.6"
                }}>
                  Vaš pouzdan saputnik u navigaciji kroz Beograd. Pratite javni prevoz u svakom trenutku i planirajte putovanje bez stresa.
                </p>
              </div>
            </div>

            <div className="row justify-content-center mb-5">
              <div className="col-lg-10">
                <Bubble padding="md" opacity={0.7} className="text-center">
                  <h2 className="h3 fw-bold mb-3 text-dark">Naša Misija</h2>
                  <p className="mb-0 text-dark fs-5">
                    BeogradPlus je kreiran da pojednostavi svakodnevno korišćenje gradskog prevoza. Sve linije, stanice i rute – jasno, brzo i pouzdano.
                  </p>
                </Bubble>
              </div>
            </div>

            <div className="row g-4 mb-5">
              {[
                { icon: '🚌', title: 'Sve Linije', text: 'Kompletan pregled svih gradskih linija sa ključnim informacijama.' },
                { icon: '📍', title: 'Precizne Lokacije', text: 'Tačne lokacije stanica za brzu orijentaciju u gradu.' },
                { icon: '⭐', title: 'Omiljene Stanice', text: 'Sačuvajte najčešće korišćene stanice i linije.' }
              ].map((f, i) => (
                <div className="col-md-4" key={i}>
                  <Bubble padding="md" opacity={0.7} className="h-100">
                    <div className="text-center">
                      <div className="rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                        style={{
                          width: 80,
                          height: 80,
                          backgroundColor: '#f8f9fa',
                          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)"
                        }}>
                        <span className="fs-1">{f.icon}</span>
                      </div>
                      <h4 className="fw-bold mb-3 text-dark">{f.title}</h4>
                      <p className="text-secondary fs-6">{f.text}</p>
                    </div>
                  </Bubble>
                </div>
              ))}
            </div>

            <div className="row g-4 mb-5">
              {[
                { value: '1200+', label: 'Stanica' },
                { value: '150+', label: 'Linija' },
                { value: '24/7', label: 'Dostupnost' },
                { value: '100%', label: 'Besplatno' }
              ].map((s, i) => (
                <div className="col-md-3 col-6" key={i}>
                  <Bubble padding="md" opacity={0.7} className="text-center">
                    <h3 className="display-6 fw-bold mb-2 text-dark">{s.value}</h3>
                    <p className="mb-0 text-secondary fw-medium">{s.label}</p>
                  </Bubble>
                </div>
              ))}
            </div>

            <div className="row justify-content-center mb-5">
              <div className="col-lg-10">
                <Bubble padding="lg" opacity={0.7}>
                  <h2 className="h3 fw-bold mb-4 text-center text-dark">Kako funkcioniše</h2>
                  <div className="row g-4 justify-content-center">
                    {[
                      { n: 1, title: 'Pretražite', text: 'Pronađite stanicu ili liniju.' },
                      { n: 2, title: 'Sačuvajte', text: 'Dodajte omiljene za brzi pristup.' },
                      { n: 3, title: 'Planirajte', text: 'Organizujte putovanje lako.' }
                    ].map((s) => (
                      <div className="col-md-4 col-lg-3" key={s.n}>
                        <div className="text-center p-3">
                          <div className="rounded-circle d-inline-flex align-items-center justify-content-center fw-bold mb-3 mx-auto"
                            style={{
                              width: 50,
                              height: 50,
                              backgroundColor: 'rgba(0,0,0,0.8)',
                              color: '#fff',
                              fontSize: "1.2rem",
                              boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)"
                            }}>
                            {s.n}
                          </div>
                          <h5 className="fw-bold mb-2 text-dark">{s.title}</h5>
                          <p className="text-dark mb-0">{s.text}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </Bubble>
              </div>
            </div>

            <div className="row mb-5">
              <div className="col-12" style={{ height: "0px" }}></div>
            </div>

            <div className="row justify-content-center">
              <div className="col-lg-8 text-center">
                <Bubble padding="lg" opacity={0.7}>
                  <h3 className="fw-bold mb-3 text-dark">Kreirano za sve koji zive u Beogradu</h3>
                  <p className="mb-4 text-secondary fs-5">
                    Fokusirano na realne potrebe svakodnevnog kretanja kroz grad.
                  </p>
                  <Linkbtn
                    href="/"
                    label="Počnite da koristite"
                    className="btn btn-dark btn-lg px-5 py-3 rounded-3 fw-semibold shadow-lg"
                  />
                </Bubble>
              </div>
            </div>

            <div className="row mt-5">
              <div className="col-12" style={{ height: "150px" }}></div>
            </div>

          </div>
        </div>

      </div>
    </div>
  )
}