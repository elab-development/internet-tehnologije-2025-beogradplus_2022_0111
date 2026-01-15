'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { MapContainer, TileLayer } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import Sidebar from '../../components/sidebar'
import Bubble from '../../components/bubble'
import StationItem from '../../components/station'
import LineItem from '../../components/line'
import { Stanica, Linija, Korisnik } from '../../types/modeli'

export default function AdminPage() {
  const [stanice, setStanice] = useState<Stanica[]>([])
  const [linije, setLinije] = useState<Linija[]>([])
  const [korisnici, setKorisnici] = useState<Korisnik[]>([])
  
  const [stanicaForm, setStanicaForm] = useState({
    naziv: '',
    lat: '',
    lng: '',
    aktivna: true
  })
  
  const [linijaForm, setLinijaForm] = useState({
    broj: '',
    tip: 'autobus',
    ime_linije: '',
    aktivna: true
  })
  
  const [deleteStanicaSearch, setDeleteStanicaSearch] = useState('')
  const [deleteLinijaSearch, setDeleteLinijaSearch] = useState('')
  const [selectedStanica, setSelectedStanica] = useState<Stanica | null>(null)
  const [selectedLinija, setSelectedLinija] = useState<Linija | null>(null)
  const [openStanicaSearch, setOpenStanicaSearch] = useState(false)
  const [openLinijaSearch, setOpenLinijaSearch] = useState(false)
  const [promoteEmail, setPromoteEmail] = useState('')
  const [poruka, setPoruka] = useState('')

  const stanicaSearchRef = useRef<HTMLDivElement>(null)
  const linijaSearchRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const initialStanice: Stanica[] = [
      { stanica_id: 1, naziv: 'Savski Trg', lat: 44.816, lng: 20.458, aktivna: true },
      { stanica_id: 2, naziv: 'Trg Slavija', lat: 44.812, lng: 20.468, aktivna: true },
      { stanica_id: 3, naziv: 'Vukov Spomenik', lat: 44.8055, lng: 20.4646, aktivna: true },
      { stanica_id: 4, naziv: 'Zemun gornji grad', lat: 44.8439, lng: 20.4014, aktivna: true }
    ]

    const initialLinije: Linija[] = [
      { linija_id: 1, broj: '2', tip: 'tramvaj', ime_linije: 'Centar - Novi Beograd', aktivna: true },
      { linija_id: 2, broj: '95', tip: 'autobus', ime_linije: 'Voždovac - Zeleni Venac', aktivna: true },
      { linija_id: 3, broj: '7', tip: 'tramvaj', ime_linije: 'Blokovi - Ušće', aktivna: true },
      { linija_id: 4, broj: '29', tip: 'trolejbus', ime_linije: 'Medakovic - Studentski trg', aktivna: true }
    ]

    const initialKorisnici: Korisnik[] = [
      { korisnik_id: 1, email: 'pera@beogradplus.rs', password_hash: '', ime: 'Pera', datum_kreiranja: new Date('2024-01-15'), uloga_id: 2 },
      { korisnik_id: 2, email: 'mika@beogradplus.rs', password_hash: '', ime: 'Mika', datum_kreiranja: new Date('2024-01-16'), uloga_id: 2 }
    ]

    setStanice(initialStanice)
    setLinije(initialLinije)
    setKorisnici(initialKorisnici)
  }, [])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (stanicaSearchRef.current && !stanicaSearchRef.current.contains(event.target as Node)) {
        setOpenStanicaSearch(false)
      }
      if (linijaSearchRef.current && !linijaSearchRef.current.contains(event.target as Node)) {
        setOpenLinijaSearch(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const addStanica = () => {
    const id = stanice.length ? Math.max(...stanice.map(s => s.stanica_id)) + 1 : 1
    const nova: Stanica = {
      stanica_id: id,
      naziv: stanicaForm.naziv.trim(),
      lat: Number(stanicaForm.lat),
      lng: Number(stanicaForm.lng),
      aktivna: Boolean(stanicaForm.aktivna)
    }

    if (!nova.naziv || Number.isNaN(nova.lat) || Number.isNaN(nova.lng)) {
      setPoruka('Popunite validne podatke za stanicu')
      return
    }

    setStanice(prev => [...prev, nova])
    setStanicaForm({ naziv: '', lat: '', lng: '', aktivna: true })
    setPoruka('Stanica dodata')
  }

  const deleteStanica = (stanica: Stanica) => {
    setStanice(prev => prev.filter(s => s.stanica_id !== stanica.stanica_id))
    setPoruka(`Stanica "${stanica.naziv}" obrisana`)
    setDeleteStanicaSearch('')
    setSelectedStanica(null)
    setOpenStanicaSearch(false)
  }

  const addLinija = () => {
    const id = linije.length ? Math.max(...linije.map(l => l.linija_id)) + 1 : 1
    const nova: Linija = {
      linija_id: id,
      broj: linijaForm.broj.trim(),
      tip: linijaForm.tip.trim(),
      ime_linije: linijaForm.ime_linije.trim(),
      aktivna: Boolean(linijaForm.aktivna)
    }

    if (!nova.broj || !nova.ime_linije) {
      setPoruka('Popunite validne podatke za liniju')
      return
    }

    setLinije(prev => [...prev, nova])
    setLinijaForm({ broj: '', tip: 'autobus', ime_linije: '', aktivna: true })
    setPoruka('Linija dodata')
  }

  const deleteLinija = (linija: Linija) => {
    setLinije(prev => prev.filter(l => l.linija_id !== linija.linija_id))
    setPoruka(`Linija "${linija.broj} - ${linija.ime_linije}" obrisana`)
    setDeleteLinijaSearch('')
    setSelectedLinija(null)
    setOpenLinijaSearch(false)
  }

  const promoteToAdmin = () => {
    const email = promoteEmail.trim().toLowerCase()
    
    if (!email) {
      setPoruka('Unesite email korisnika')
      return
    }

    const idx = korisnici.findIndex(k => k.email.toLowerCase() === email)
    if (idx === -1) {
      setPoruka('Korisnik nije pronađen')
      return
    }

    const updated = [...korisnici]
    updated[idx] = { ...updated[idx], uloga_id: 1 }
    setKorisnici(updated)
    setPromoteEmail('')
    setPoruka('Korisnik postavljen za admina')
  }

  const filteredStanice = stanice.filter(s =>
    s.naziv.toLowerCase().includes(deleteStanicaSearch.toLowerCase())
  )

  const filteredLinije = linije.filter(l =>
    l.broj.toLowerCase().includes(deleteLinijaSearch.toLowerCase()) ||
    l.ime_linije.toLowerCase().includes(deleteLinijaSearch.toLowerCase())
  )

  return (
    <div className="d-flex" style={{ minHeight: '100vh', width: '100vw' }}>
      <div style={{ width: '7vw', height: '100vh', position: 'fixed', top: 0, left: 0, zIndex: 1000 }}>
        <Sidebar />
      </div>

      <div className="flex-grow-1 position-relative" style={{ marginLeft: '7vw' }}>
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

        <div className="position-relative" style={{ 
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif',
          height: '100%',
          overflowY: 'auto',
          paddingTop: '2rem',
          paddingBottom: '3rem',
          zIndex: 1
        }}>
          <div className="container py-3">
            <div className="row justify-content-between align-items-center mb-3">
              <div className="col-auto">
                <h1 className="h3 fw-bold text-dark">Admin panel</h1>
                <p className="text-secondary mb-0" style={{fontSize: '0.9rem'}}>Upravljanje stanicama, linijama i korisnicima</p>
              </div>
              <div className="col-auto">
                <button onClick={() => window.location.href = '/'} className="btn btn-outline-dark btn-sm">Nazad na sajt</button>
              </div>
            </div>

            <div className="row g-3 mb-3" style={{ position: 'relative', zIndex: 50 }}>
              <div className="col-md-6">
                <Bubble padding="sm" opacity={0.9}>
                  <h5 className="fw-bold mb-3" style={{fontSize: '1rem'}}>Dodaj stanicu</h5>
                  <div className="mb-2">
                    <input
                      value={stanicaForm.naziv}
                      onChange={e => setStanicaForm({ ...stanicaForm, naziv: e.target.value })}
                      className="form-control form-control-sm"
                      placeholder="Naziv stanice"
                    />
                  </div>
                  <div className="row g-2 mb-2">
                    <div className="col">
                      <input
                        value={stanicaForm.lat}
                        onChange={e => setStanicaForm({ ...stanicaForm, lat: e.target.value })}
                        className="form-control form-control-sm"
                        placeholder="Lat"
                      />
                    </div>
                    <div className="col">
                      <input
                        value={stanicaForm.lng}
                        onChange={e => setStanicaForm({ ...stanicaForm, lng: e.target.value })}
                        className="form-control form-control-sm"
                        placeholder="Lng"
                      />
                    </div>
                  </div>
                  <div className="form-check form-switch mb-2">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="aktivnaStanica"
                      checked={stanicaForm.aktivna}
                      onChange={e => setStanicaForm({ ...stanicaForm, aktivna: e.target.checked })}
                    />
                    <label className="form-check-label" htmlFor="aktivnaStanica" style={{fontSize: '0.9rem'}}>Aktivna</label>
                  </div>
                  <div className="d-flex gap-2">
                    <button onClick={addStanica} className="btn btn-primary btn-sm">Dodaj</button>
                    <button
                      onClick={() => setStanicaForm({ naziv: '', lat: '', lng: '', aktivna: true })}
                      className="btn btn-outline-secondary btn-sm"
                    >
                      Resetuj
                    </button>
                  </div>
                </Bubble>
              </div>

              <div className="col-md-6">
                <Bubble padding="sm" opacity={0.9}>
                  <h5 className="fw-bold mb-3" style={{fontSize: '1rem'}}>Dodaj liniju</h5>
                  <div className="mb-2">
                    <input
                      value={linijaForm.broj}
                      onChange={e => setLinijaForm({ ...linijaForm, broj: e.target.value })}
                      className="form-control form-control-sm"
                      placeholder="Broj linije"
                    />
                  </div>
                  <div className="mb-2">
                    <input
                      value={linijaForm.ime_linije}
                      onChange={e => setLinijaForm({ ...linijaForm, ime_linije: e.target.value })}
                      className="form-control form-control-sm"
                      placeholder="Ime linije"
                    />
                  </div>
                  <div className="mb-2">
                    <select
                      value={linijaForm.tip}
                      onChange={e => setLinijaForm({ ...linijaForm, tip: e.target.value })}
                      className="form-select form-select-sm"
                    >
                      <option value="autobus">Autobus</option>
                      <option value="tramvaj">Tramvaj</option>
                      <option value="trolejbus">Trolejbus</option>
                    </select>
                  </div>
                  <div className="form-check form-switch mb-2">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="aktivnaLinija"
                      checked={linijaForm.aktivna}
                      onChange={e => setLinijaForm({ ...linijaForm, aktivna: e.target.checked })}
                    />
                    <label className="form-check-label" htmlFor="aktivnaLinija" style={{fontSize: '0.9rem'}}>Aktivna</label>
                  </div>
                  <div className="d-flex gap-2">
                    <button onClick={addLinija} className="btn btn-primary btn-sm">Dodaj</button>
                    <button
                      onClick={() => setLinijaForm({ broj: '', tip: 'autobus', ime_linije: '', aktivna: true })}
                      className="btn btn-outline-secondary btn-sm"
                    >
                      Resetuj
                    </button>
                  </div>
                </Bubble>
              </div>
            </div>

            <div className="row g-3 mb-3">
              <div className="col-md-6" style={{ position: 'relative', zIndex: 100 }}>
                <Bubble padding="sm" opacity={0.9}>
                  <h5 className="fw-bold mb-3" style={{fontSize: '1rem'}}>Obriši stanicu</h5>
                  <div ref={stanicaSearchRef} style={{ position: 'relative', zIndex: 9999 }}>
                    <div className="input-group input-group-sm mb-2">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Pretraži stanice..."
                        value={deleteStanicaSearch}
                        onChange={e => setDeleteStanicaSearch(e.target.value)}
                      />
                      <button 
                        className="btn btn-outline-secondary" 
                        type="button"
                        onClick={() => setOpenStanicaSearch(true)}
                      >
                        🔍
                      </button>
                    </div>

                    {openStanicaSearch && deleteStanicaSearch && (
                      <div style={{
                        position: 'absolute',
                        top: '40px',
                        left: 0,
                        width: '100%',
                        maxHeight: 250,
                        background: 'white',
                        borderRadius: 8,
                        boxShadow: '0 10px 30px rgba(0,0,0,0.35)',
                        overflowY: 'auto',
                        zIndex: 9999
                      }}>
                        <div className="p-2 fw-bold border-bottom" style={{fontSize: '0.85rem'}}>
                          {filteredStanice.length} rezultata
                        </div>
                        {filteredStanice.length > 0 ? (
                          filteredStanice.map(stanica => (
                            <div key={stanica.stanica_id}>
                              <StationItem 
                                stanica={stanica} 
                                onClick={() => {
                                  setSelectedStanica(stanica)
                                  setOpenStanicaSearch(false)
                                }} 
                              />
                            </div>
                          ))
                        ) : (
                          <div className="p-2 text-muted" style={{fontSize: '0.85rem'}}>Nema rezultata</div>
                        )}
                      </div>
                    )}
                  </div>
                  {selectedStanica && (
                    <div className="alert alert-warning p-2 mb-2" style={{fontSize: '0.85rem'}}>
                      Selektovano: <strong>{selectedStanica.naziv}</strong>
                    </div>
                  )}
                  <button
                    onClick={() => {
                      if (selectedStanica) {
                        deleteStanica(selectedStanica)
                      } else {
                        setPoruka('Prvo pretražite i odaberite stanicu')
                      }
                    }}
                    className="btn btn-danger btn-sm w-100"
                    disabled={!selectedStanica}
                  >
                    Obriši
                  </button>
                </Bubble>
              </div>

              <div className="col-md-6" style={{ position: 'relative', zIndex: 100 }}>
                <Bubble padding="sm" opacity={0.9}>
                  <h5 className="fw-bold mb-3" style={{fontSize: '1rem'}}>Obriši liniju</h5>
                  <div ref={linijaSearchRef} style={{ position: 'relative', zIndex: 9999 }}>
                    <div className="input-group input-group-sm mb-2">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Pretraži linije..."
                        value={deleteLinijaSearch}
                        onChange={e => setDeleteLinijaSearch(e.target.value)}
                      />
                      <button 
                        className="btn btn-outline-secondary" 
                        type="button"
                        onClick={() => setOpenLinijaSearch(true)}
                      >
                        🔍
                      </button>
                    </div>

                    {openLinijaSearch && deleteLinijaSearch && (
                      <div style={{
                        position: 'absolute',
                        top: '40px',
                        left: 0,
                        width: '100%',
                        maxHeight: 250,
                        background: 'white',
                        borderRadius: 8,
                        boxShadow: '0 10px 30px rgba(0,0,0,0.35)',
                        overflowY: 'auto',
                        zIndex: 9999
                      }}>
                        <div className="p-2 fw-bold border-bottom" style={{fontSize: '0.85rem'}}>
                          {filteredLinije.length} rezultata
                        </div>
                        {filteredLinije.length > 0 ? (
                          filteredLinije.map(linija => (
                            <div key={linija.linija_id}>
                              <LineItem 
                                linija={linija} 
                                onClick={() => {
                                  setSelectedLinija(linija)
                                  setOpenLinijaSearch(false)
                                }} 
                              />
                            </div>
                          ))
                        ) : (
                          <div className="p-2 text-muted" style={{fontSize: '0.85rem'}}>Nema rezultata</div>
                        )}
                      </div>
                    )}
                  </div>
                  {selectedLinija && (
                    <div className="alert alert-warning p-2 mb-2" style={{fontSize: '0.85rem'}}>
                      Selektovano: <strong>{selectedLinija.broj} - {selectedLinija.ime_linije}</strong>
                    </div>
                  )}
                  <button
                    onClick={() => {
                      if (selectedLinija) {
                        deleteLinija(selectedLinija)
                      } else {
                        setPoruka('Prvo pretražite i odaberite liniju')
                      }
                    }}
                    className="btn btn-danger btn-sm w-100"
                    disabled={!selectedLinija}
                  >
                    Obriši
                  </button>
                </Bubble>
              </div>
            </div>

            <div className="row g-3 mb-3">
              <div className="col-lg-6">
                <Bubble padding="sm" opacity={0.9}>
                  <h5 className="fw-bold mb-3" style={{fontSize: '1rem'}}>Korisnici</h5>
                  <div className="list-group mb-3" style={{maxHeight: 200, overflowY: 'auto'}}>
                    {korisnici.map(k => (
                      <div key={k.korisnik_id} className="list-group-item d-flex justify-content-between align-items-center p-2">
                        <div>
                          <div className="fw-semibold" style={{fontSize: '0.85rem'}}>{k.ime} • {k.email}</div>
                          <div className="text-secondary" style={{fontSize: '0.75rem'}}>
                            Uloga: {k.uloga_id === 1 ? 'Admin' : k.uloga_id === 2 ? 'Korisnik' : 'Gost'}
                          </div>
                        </div>
                        {k.uloga_id !== 1 && (
                          <button
                            onClick={() => {
                              const updated = korisnici.map(u =>
                                u.korisnik_id === k.korisnik_id ? { ...u, uloga_id: 1 } : u
                              )
                              setKorisnici(updated)
                              setPoruka('Korisnik postavljen za admina')
                            }}
                            className="btn btn-sm btn-outline-warning"
                            style={{fontSize: '0.75rem'}}
                          >
                            Admin
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="row g-2">
                    <div className="col">
                      <input
                        value={promoteEmail}
                        onChange={e => setPromoteEmail(e.target.value)}
                        className="form-control form-control-sm"
                        placeholder="Email korisnika"
                      />
                    </div>
                    <div className="col-auto">
                      <button onClick={promoteToAdmin} className="btn btn-primary btn-sm">Promoviši</button>
                    </div>
                  </div>
                </Bubble>
              </div>

              <div className="col-lg-6">
                <Bubble padding="sm" opacity={0.9}>
                  <h5 className="fw-bold mb-3" style={{fontSize: '1rem'}}>Brze akcije</h5>
                  <div className="d-flex flex-column gap-2">
                    <button
                      onClick={() => {
                        setStanice([])
                        setPoruka('Sve stanice obrisane')
                      }}
                      className="btn btn-outline-danger btn-sm"
                    >
                      Obriši sve stanice
                    </button>
                    <button
                      onClick={() => {
                        setLinije([])
                        setPoruka('Sve linije obrisane')
                      }}
                      className="btn btn-outline-danger btn-sm"
                    >
                      Obriši sve linije
                    </button>
                    <button
                      onClick={() => {
                        setKorisnici(prev => prev.map(u => ({ ...u, uloga_id: 2 })))
                        setPoruka('Resetovane uloge korisnika')
                      }}
                      className="btn btn-outline-secondary btn-sm"
                    >
                      Resetuj sve uloge na korisnik
                    </button>
                  </div>
                </Bubble>
              </div>
            </div>

            {poruka && (
              <div className="row mt-3">
                <div className="col-12">
                  <div className="alert alert-info text-center" style={{fontSize: '0.9rem'}}>{poruka}</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet" />
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
    </div>
  )
}