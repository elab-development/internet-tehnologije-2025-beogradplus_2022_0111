'use client'
import React, { useState, useEffect, useRef } from "react";
import StationItem from '../components/station';
import LineItem from '../components/line';
import { Stanica, Linija } from '../types/modeli';

export default function Searchbar({
  onStationSelect,
  selectedStation,
  onClearSelectedStation
}: {
  onStationSelect?: (stanica: Stanica) => void,
  selectedStation?: Stanica | null,
  onClearSelectedStation?: () => void
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [limit, setLimit] = useState(5);
  const [stanice, setStanice] = useState<Stanica[]>([]);
  const [linije, setLinije] = useState<Linija[]>([]);

  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchStanice = async () => {
      const res = await fetch('/api/stations');
      const data = await res.json();
      setStanice(data);
    };
    fetchStanice();

    const fetchLinije = async () => {
      const res = await fetch('/api/lines');
      const data = await res.json();
      setLinije(data);
    };
    fetchLinije();
  }, []);

  function handleSearch() {
    setOpen(true);
    setLimit(5);
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

  const totalResults = filteredStanice.length + filteredLinije.length;

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
            {totalResults} rezultata
          </div>

          {filteredStanice.length > 0 && (
            <>
              <div className="px-3 py-2 bg-light fw-bold">Stanice</div>
              {filteredStanice.slice(0, limit).map(stanica => (
                <StationItem
                  key={stanica.stanica_id}
                  stanica={stanica}
                  onClick={() => handleStationClick(stanica)}
                />
              ))}
            </>
          )}

          {filteredLinije.length > 0 && (
            <>
              <div className="px-3 py-2 bg-light fw-bold">Linije</div>
              {filteredLinije.slice(0, limit).map(linija => (
                <LineItem
                  key={linija.linija_id}
                  linija={linija}
                  onClick={() => setOpen(false)}
                />
              ))}
            </>
          )}

          {limit < totalResults && (
            <div
              className="text-center py-2 fw-bold"
              style={{ cursor: "pointer" }}
              onClick={() => setLimit(l => l + 5)}
            >
              Učitaj još
            </div>
          )}

          {totalResults === 0 && (
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
            padding: "1rem"
          }}
        >
          <div className="d-flex justify-content-between mb-3">
            <h6>{selectedStation.naziv}</h6>
            <button
              className="btn-close"
              onClick={() => onClearSelectedStation && onClearSelectedStation()}
            />
          </div>

          <div><strong>ID:</strong> {selectedStation.stanica_id}</div>
          <div><strong>Lat:</strong> {selectedStation.lat}</div>
          <div><strong>Lng:</strong> {selectedStation.lng}</div>
          <div>
            <strong>Status:</strong>{" "}
            {selectedStation.aktivna ? "Aktivna" : "Neaktivna"}
          </div>
        </div>
      )}
    </div>
  );
}
