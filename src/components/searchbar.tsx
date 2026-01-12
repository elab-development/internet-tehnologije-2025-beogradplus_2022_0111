'use client'
import React, { useState, useEffect, useRef } from "react";
import StationItem from '../components/station'
import LineItem from '../components/line'

import {Stanica,Linija} from '../types/modeli'


export default function Searchbar() {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [limit, setLimit] = useState(5);

  const stanice: Stanica[] = [
    { stanica_id: 1, naziv: "Zemun gornji grad", lat: 44.8439, lng: 20.4014, aktivna: true },
    { stanica_id: 2, naziv: "Batajnica centar", lat: 44.8150, lng: 20.4144, aktivna: true },
    { stanica_id: 3, naziv: "Franse D'Eperea", lat: 44.8031, lng: 20.4769, aktivna: false },
  ];

  const linije: Linija[] = [
    { linija_id: 1, broj: "84", tip: "autobus", ime_linije: "Nova Galenika - Zeleni venac", aktivna: true },
    { linija_id: 2, broj: "706", tip: "autobus", ime_linije: "Batajnica - Zeleni venac", aktivna: true },
    { linija_id: 3, broj: "9", tip: "tramvaj", ime_linije: "Banjica - Blok 45", aktivna: true },
    { linija_id: 4, broj: "29", tip: "trolejbus", ime_linije: "Medakovic - Studentski trg", aktivna: false },
  ];

   const searchRef = useRef<HTMLDivElement>(null);

  function handleSearch() {
    setOpen(true);
    setLimit(5);
  }

  function handleKeyPress(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      handleSearch();
    }
  }

  const filteredStanice = stanice.filter(function (s) {
    return s.naziv.toLowerCase().includes(query.toLowerCase());
  });

  const filteredLinije = linije.filter(function (l) {
    return (
      l.broj.toLowerCase().includes(query.toLowerCase()) ||
      l.ime_linije.toLowerCase().includes(query.toLowerCase())
    );
  });

  const totalResults = filteredStanice.length + filteredLinije.length;

  useEffect(function () {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return function cleanup() {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div
      ref={searchRef}
      style={{
        position: "relative",
        width: 400,
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
          onChange={function (e: React.ChangeEvent<HTMLInputElement>) {
            setQuery(e.target.value);
          }}
          onKeyPress={handleKeyPress}
          style={{
            borderRadius: 0,
            backgroundColor: "white"
          }}
        />

        <button
          onClick={handleSearch}
          className="btn btn-light border-0"
          style={{
            width: 52,
            padding: "0.5rem 0",
            borderRadius: 0,
            backgroundColor: "white",
            color: "black"
          }}
        >
          🔍
        </button>
      </div>

      {open && (
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
              <div className="px-3 py-2 bg-light fw-bold" style={{ fontSize: "1rem" }}>
                Stanice
              </div>
              {filteredStanice.slice(0, limit).map(function (stanica) {
                return (
                  <StationItem
                    key={stanica.stanica_id}
                    stanica={stanica}
                    onClick={function () {
                      setOpen(false);
                      console.log("Selected station:", stanica);
                    }}
                  />
                );
              })}
            </>
          )}

          {filteredLinije.length > 0 && (
            <>
              <div className="px-3 py-2 bg-light fw-bold" style={{ fontSize: "1rem" }}>
                Linije
              </div>
              {filteredLinije.slice(0, limit).map(function (linija) {
                return (
                  <LineItem
                    key={linija.linija_id}
                    linija={linija}
                    onClick={function () {
                      setOpen(false);
                      console.log("Selected line:", linija);
                    }}
                  />
                );
              })}
            </>
          )}

          {limit < totalResults && (
            <div
              className="text-center py-2 fw-bold"
              style={{ cursor: "pointer" }}
              onClick={function () {
                setLimit(function (l) { return l + 5; });
              }}
            >
              Učitaj još
            </div>
          )}

          {totalResults === 0 && (
            <div className="p-3 text-muted">
              Nema rezultata
            </div>
          )}
        </div>
      )}
    </div>
  );
}