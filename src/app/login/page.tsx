"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from 'next/dynamic'

const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
)
const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
)

const MOCK_USER = {
  username: "pera",
  password: "peric",
};

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isRegister, setIsRegister] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      username === MOCK_USER.username &&
      password === MOCK_USER.password
    ) {
      sessionStorage.setItem("auth", "admin");
      sessionStorage.setItem("username", "Pera Perić");
      router.push("/");
    } else {
      setError("Pogrešno korisničko ime ili lozinka");
    }
  };

  const handleGuest = () => {
    sessionStorage.setItem("auth", "guest");
    router.push("/");
  };

  return (
    <div className="d-flex align-items-center justify-content-center vh-100 position-relative" style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}>
      <div style={{
        position: "fixed",
        top: 0, left: 0, right: 0, bottom: 0,
        zIndex: 0,
        filter: "blur(8px) brightness(0.7)",
        pointerEvents: "none",
        height: "200vh"
      }}>
        <MapContainer
          center={[44.76621, 20.3678]}
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

      <div className="card shadow-lg border-0" style={{ width: "420px", zIndex: 1, borderRadius: "16px", overflow: "hidden" }}>
        <div className="card-body p-4">
          <div className="text-center mb-4">
            <h1 className="fw-bold mb-1" style={{ 
              fontSize: "2.5rem",
              lineHeight: "1.3", 
              background: "linear-gradient(135deg, #087aae 0%, #93cff8 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text"
            }}>
              BeogradPlus
            </h1>
            <p className="text-muted mb-0">Dobrodošli nazad</p>
          </div>

          {error && (
            <div className="alert alert-danger d-flex align-items-center" role="alert">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="me-2" viewBox="0 0 16 16">
                <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                <path d="M7.002 11a1 1 0 1 1 2 0 1 1 0 0 1-2 0zM7.1 4.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 4.995z"/>
              </svg>
              <div>{error}</div>
            </div>
          )}

          <div>
            <div className="mb-3">
              <label className="form-label fw-semibold">Korisničko ime</label>
              <input
                type="text"
                className="form-control form-control-lg"
                style={{ borderRadius: "8px" }}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                placeholder="Unesite korisničko ime"
              />
            </div>
            <div className="mb-4">
              <label className="form-label fw-semibold">Lozinka</label>
              <input
                type="password"
                className="form-control form-control-lg"
                style={{ borderRadius: "8px" }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Unesite lozinku"
              />
            </div>
            <button 
              className="btn btn-lg w-100 mb-3 text-white fw-semibold" 
              onClick={handleLogin}
              style={{ 
                background: "linear-gradient(135deg, #087aae 0%, #93cff8 100%)",
                border: "none",
                borderRadius: "8px",
                padding: "12px"
              }}
            >
              Uloguj se
            </button>
          </div>

          <button
            className="btn btn-outline-secondary w-100 mb-3"
            onClick={() => setIsRegister(!isRegister)}
            disabled
            style={{ borderRadius: "8px", padding: "10px" }}
          >
            Registracija
          </button>

          <div className="position-relative my-3">
            <hr className="m-0" />
            <span className="position-absolute top-50 start-50 translate-middle bg-white px-3 text-muted small">ili</span>
          </div>

          <button
            className="btn btn-outline-dark w-100"
            onClick={handleGuest}
            style={{ borderRadius: "8px", padding: "10px" }}
          >
            Nastavi kao gost
          </button>
        </div>
      </div>
    </div>
  );
}