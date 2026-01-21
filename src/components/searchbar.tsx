'use client'
import React, { useState, useEffect, useRef } from "react";
import StationItem from '../components/station';
import LineItem from '../components/line';
import { Stanica, Linija } from '../types/modeli';

export default function Searchbar({
  onStationSelect,
  selectedStation,
  onClearSelectedStation,
  onLineSelect
}: {
  onStationSelect?: (stanica: Stanica) => void,
  selectedStation?: Stanica | null,
  onClearSelectedStation?: () => void,
  onLineSelect?: (linija_id: number) => void
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const [limitStanice, setLimitStanice] = useState(5);
  const [limitLinije, setLimitLinije] = useState(5);

  const [stanice, setStanice] = useState<Stanica[]>([]);
  const [linije, setLinije] = useState<Linija[]>([]);
  const [linijeZaStanicu, setLinijeZaStanicu] = useState<Linija[]>([]);
  const [loadingLinije, setLoadingLinije] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchStanice = async () => {
      const res = await fetch('/api/stations');
      const data = await res.json();
      setStanice(data);
    };

    const fetchLinije = async () => {
      const res = await fetch('/api/lines');
      const data = await res.json();
      setLinije(data);
    };

    fetchStanice();
    fetchLinije();
  }, []);

  useEffect(() => {
    const fetchLinijeZaStanicu = async () => {
      if (!selectedStation) {
        setLinijeZaStanicu([]);
        return;
      }

      setLoadingLinije(true);
      try {
        const res = await fetch(`/api/lines?stanica_id=${selectedStation.stanica_id}`);
        const data = await res.json();
        setLinijeZaStanicu(data);
      } catch (error) {
        console.error('Greška pri učitavanju linija:', error);
        setLinijeZaStanicu([]);
      } finally {
        setLoadingLinije(false);
      }
    };

    fetchLinijeZaStanicu();
  }, [selectedStation]);

  function handleSearch() {
    setOpen(true);
    setLimitStanice(5);
    setLimitLinije(5);
  }

  function handleKeyPress(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      handleSearch();
    }
  }

  const filteredStanice = stanice.filter(s =>
    s.naziv.toLowerCase().includes(query.toLowerCase())
  );

  const filteredLinije = linije.filter(l =>
    l.broj.toLowerCase().includes(query.toLowerCase()) ||
    l.ime_linije.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleStationClick(stanica: Stanica) {
    setOpen(false);
    onStationSelect && onStationSelect(stanica);
  }

  function handleLineClick(linija: Linija) {
    setOpen(false);
    onLineSelect && onLineSelect(linija.linija_id);
  }

  function handleLineClickFromStation(linija: Linija) {
    onLineSelect && onLineSelect(linija.linija_id);
  }

  return (
    <div
      ref={searchRef}
      style={{
        position: "relative",
        width: 350,
        margin: "20px auto",
        zIndex: 9999
      }}
    >
      <div
        className="input-group"
        style={{
          borderRadius: 50,
          backgroundColor: "white",
          boxShadow: "0 8px 25px rgba(0,0,0,0.35)",
          overflow: "hidden"
        }}
      >
        <input
          type="text"
          className="form-control border-0 px-4"
          placeholder="Pretraži stanice i linije..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyPress={handleKeyPress}
        />

        <button
          onClick={handleSearch}
          className="btn btn-light border-0"
          style={{ width: 52 }}
        >
          🔍
        </button>
      </div>

      {open && !selectedStation && (
        <div
          style={{
            position: "absolute",
            top: "60px",
            left: 0,
            width: "100%",
            maxHeight: 400,
            background: "white",
            borderRadius: 12,
            boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
            overflowY: "auto"
          }}
        >
          <div className="p-3 fw-bold border-bottom">
            {filteredStanice.length + filteredLinije.length} rezultata
          </div>

          {filteredStanice.length > 0 && (
            <>
              <div className="px-3 py-2 bg-light fw-bold">Stanice</div>

              {filteredStanice.slice(0, limitStanice).map(stanica => (
                <StationItem
                  key={stanica.stanica_id}
                  stanica={stanica}
                  onClick={() => handleStationClick(stanica)}
                />
              ))}

              {limitStanice < filteredStanice.length && (
                <div
                  className="text-center py-2 fw-bold"
                  style={{ cursor: "pointer" }}
                  onClick={() => setLimitStanice(l => l + 5)}
                >
                  Učitaj još stanica
                </div>
              )}
            </>
          )}

          {filteredLinije.length > 0 && (
            <>
              <div className="px-3 py-2 bg-light fw-bold">Linije</div>

              {filteredLinije.slice(0, limitLinije).map(linija => (
                <LineItem
                  key={linija.linija_id}
                  linija={linija}
                  onClick={() => handleLineClick(linija)}
                />
              ))}

              {limitLinije < filteredLinije.length && (
                <div
                  className="text-center py-2 fw-bold"
                  style={{ cursor: "pointer" }}
                  onClick={() => setLimitLinije(l => l + 5)}
                >
                  Učitaj još linija
                </div>
              )}
            </>
          )}

          {filteredStanice.length + filteredLinije.length === 0 && (
            <div className="p-3 text-muted">Nema rezultata</div>
          )}
        </div>
      )}

      {selectedStation && (
        <div
          style={{
            position: "absolute",
            top: "60px",
            left: 0,
            width: "100%",
            background: "white",
            borderRadius: 12,
            boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
            padding: "1rem",
            maxHeight: 400,
            overflowY: "auto"
          }}
        >
          <div className="d-flex justify-content-between mb-3">
            <h6>{selectedStation.naziv}</h6>
            <button
              className="btn-close"
              onClick={() => onClearSelectedStation && onClearSelectedStation()}
            />
          </div>

          <div className="mb-2"><strong>ID:</strong> {selectedStation.stanica_id}</div>
          <div className="mb-2"><strong>Lat:</strong> {selectedStation.lat}</div>
          <div className="mb-2"><strong>Lng:</strong> {selectedStation.lng}</div>
          <div className="mb-3">
            <strong>Status:</strong>{" "}
            {selectedStation.aktivna ? "Aktivna" : "Neaktivna"}
          </div>

          <div className="border-top pt-3">
            <h6 className="mb-2">Linije koje prolaze:</h6>
            {loadingLinije ? (
              <div className="text-muted">Učitavanje...</div>
            ) : linijeZaStanicu.length > 0 ? (
              <div className="d-flex flex-wrap gap-2">
                {linijeZaStanicu.map(linija => (
                  <span
                    key={linija.linija_id}
                    className="fw-bold"
                    style={{
                      backgroundColor:
                        linija.tip === 1 ? "#0d6efd" : linija.tip === 2 ? "#dc3545" : "#ffa200",
                      color: "white",
                      padding: "4px 10px",
                      borderRadius: 4,
                      fontSize: "0.85rem",
                      cursor: "pointer"
                    }}
                    title={linija.ime_linije}
                    onClick={() => handleLineClickFromStation(linija)}
                  >
                    {linija.broj}
                  </span>
                ))}
              </div>
            ) : (
              <div className="text-muted">Nema linija</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}