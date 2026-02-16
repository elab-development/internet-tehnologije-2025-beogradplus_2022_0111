"use client";

import dynamic from "next/dynamic";
import Link from "next/link";

import Bubble from "@/components/bubble";
import Sidebar from "@/components/sidebar";

const SwaggerUI = dynamic(() => import("swagger-ui-react"), { ssr: false });

const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
);

const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);

export default function DocsPage() {
  return (
    <div className="d-flex docs-root" style={{ minHeight: "100vh", width: "100vw" }}>
      <style jsx global>{`
        .docs-animate {
          animation: docsFadeIn 0.45s ease;
        }

        .docs-swagger-shell {
          border: 1px solid rgba(255, 255, 255, 0.7);
        }

        .docs-swagger-inner {
          border-radius: 16px;
          overflow: hidden;
          border: 1px solid rgba(19, 24, 29, 0.08);
          background: rgba(245, 248, 251, 0.88);
          backdrop-filter: blur(3px);
        }

        .docs-swagger-inner .swagger-ui {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
          color: #18212c;
        }

        .docs-swagger-inner .swagger-ui .topbar {
          display: none;
        }

        .docs-swagger-inner .swagger-ui .scheme-container {
          margin: 0;
          padding: 16px;
          background: rgba(255, 255, 255, 0.9);
          box-shadow: none;
          border-bottom: 1px solid rgba(24, 33, 44, 0.08);
        }

        .docs-swagger-inner .swagger-ui .info {
          margin: 0 0 8px;
          padding: 20px 20px 8px;
        }

        .docs-swagger-inner .swagger-ui .info .title {
          color: #121a22;
          font-size: 1.9rem;
          font-weight: 700;
        }

        .docs-swagger-inner .swagger-ui .opblock-tag {
          color: #121a22;
          font-weight: 700;
          border-bottom: 1px solid rgba(24, 33, 44, 0.08);
          padding: 12px 0;
        }

        .docs-swagger-inner .swagger-ui .opblock {
          margin: 0 0 12px;
          border-radius: 14px;
          overflow: hidden;
          box-shadow: none;
          border-width: 1px;
        }

        .docs-swagger-inner .swagger-ui .opblock .opblock-summary {
          border-color: transparent;
        }

        .docs-swagger-inner .swagger-ui .opblock-get {
          border-color: rgba(73, 145, 216, 0.36);
          background: linear-gradient(90deg, rgba(73, 145, 216, 0.16), rgba(73, 145, 216, 0.08));
        }

        .docs-swagger-inner .swagger-ui .opblock-post {
          border-color: rgba(73, 170, 79, 0.36);
          background: linear-gradient(90deg, rgba(73, 170, 79, 0.15), rgba(73, 170, 79, 0.07));
        }

        .docs-swagger-inner .swagger-ui .opblock-put {
          border-color: rgba(252, 161, 48, 0.38);
          background: linear-gradient(90deg, rgba(252, 161, 48, 0.16), rgba(252, 161, 48, 0.08));
        }

        .docs-swagger-inner .swagger-ui .opblock-delete {
          border-color: rgba(249, 62, 62, 0.34);
          background: linear-gradient(90deg, rgba(249, 62, 62, 0.15), rgba(249, 62, 62, 0.07));
        }

        .docs-swagger-inner .swagger-ui .opblock .opblock-summary-method {
          min-width: 74px;
          border-radius: 999px;
          margin-left: 10px;
          margin-right: 12px;
          font-weight: 700;
          letter-spacing: 0.2px;
        }

        .docs-swagger-inner .swagger-ui .btn.authorize,
        .docs-swagger-inner .swagger-ui .btn.execute {
          border-radius: 10px;
          border-color: #111827;
          background: #111827;
          color: #f9fafb;
        }

        .docs-swagger-inner .swagger-ui .btn.authorize:hover,
        .docs-swagger-inner .swagger-ui .btn.execute:hover {
          background: #0b1220;
          border-color: #0b1220;
        }

        .docs-swagger-inner .swagger-ui input[type="text"],
        .docs-swagger-inner .swagger-ui input[type="password"],
        .docs-swagger-inner .swagger-ui textarea,
        .docs-swagger-inner .swagger-ui select {
          border-radius: 10px;
          border: 1px solid rgba(17, 24, 39, 0.2);
          background: rgba(255, 255, 255, 0.95);
        }

        .docs-swagger-inner .swagger-ui .responses-inner {
          border-radius: 10px;
        }

        .docs-swagger-inner .swagger-ui .model-box {
          border-radius: 10px;
          border: 1px solid rgba(17, 24, 39, 0.12);
        }

        @keyframes docsFadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (max-width: 992px) {
          .docs-sidebar {
            display: none;
          }

          .docs-main {
            margin-left: 0 !important;
          }
        }
      `}</style>

      <div
        className="docs-sidebar"
        style={{
          width: "115px",
          height: "100vh",
          position: "fixed",
          top: 0,
          left: 0,
          zIndex: 1000,
        }}
      >
        <Sidebar onOpenFavorites={() => {}} />
      </div>

      <div className="docs-main flex-grow-1 position-relative" style={{ marginLeft: "115px" }}>
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 0,
            filter: "blur(6px)",
            pointerEvents: "none",
            height: "200vh",
          }}
        >
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

        <div
          className="position-relative z-1"
          style={{
            minHeight: "100vh",
            overflowY: "auto",
            paddingTop: "1.4rem",
            paddingBottom: "2.5rem",
          }}
        >
          <div className="container-fluid px-3 px-lg-4">
            <div className="row justify-content-center mb-3 docs-animate">
              <div className="col-12 col-xxl-11">
                <Bubble padding="lg" opacity={0.74}>
                  <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
                    <div>
                      <h1 className="h2 fw-bold mb-2 text-dark">API Dokumentacija</h1>
                      <p className="mb-0 text-secondary">
                        Interaktivni pregled svih endpointa, parametara i odgovora za BeogradPlus API.
                      </p>
                    </div>
                    <div className="d-flex gap-2">
                      <Link href="/api/docs" className="btn btn-outline-dark btn-sm">
                        OpenAPI JSON
                      </Link>
                      <Link href="/" className="btn btn-dark btn-sm">
                        Nazad na sajt
                      </Link>
                    </div>
                  </div>
                </Bubble>
              </div>
            </div>

            <div className="row g-3 justify-content-center mb-3 docs-animate">
              <div className="col-12 col-md-4 col-xxl-3">
                <Bubble padding="sm" opacity={0.74} className="h-100">
                  <h2 className="h6 fw-bold text-dark mb-1">Brzo testiranje</h2>
                  <p className="text-secondary mb-0" style={{ fontSize: "0.92rem" }}>
                    Koristi <strong>Try it out</strong> direktno u dokumentaciji.
                  </p>
                </Bubble>
              </div>
              <div className="col-12 col-md-4 col-xxl-3">
                <Bubble padding="sm" opacity={0.74} className="h-100">
                  <h2 className="h6 fw-bold text-dark mb-1">Autorizacija</h2>
                  <p className="text-secondary mb-0" style={{ fontSize: "0.92rem" }}>
                    Klikni <strong>Authorize</strong> i unesi JWT kao Bearer token.
                  </p>
                </Bubble>
              </div>
              <div className="col-12 col-md-4 col-xxl-3">
                <Bubble padding="sm" opacity={0.74} className="h-100">
                  <h2 className="h6 fw-bold text-dark mb-1">Integracija</h2>
                  <p className="text-secondary mb-0" style={{ fontSize: "0.92rem" }}>
                    Spec je dostupan i za Postman import preko <code>/api/docs</code>.
                  </p>
                </Bubble>
              </div>
            </div>

            <div className="row justify-content-center docs-animate">
              <div className="col-12 col-xxl-11">
                <Bubble padding="sm" opacity={0.76} className="docs-swagger-shell">
                  <div className="docs-swagger-inner">
                    <SwaggerUI
                      url="/api/docs"
                      docExpansion="list"
                      defaultModelsExpandDepth={1}
                      displayRequestDuration
                      tryItOutEnabled
                    />
                  </div>
                </Bubble>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
