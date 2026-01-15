'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '../../components/sidebar'
import Bubble from '../../components/bubble'
import Map from '../../components/map'
import StationItem from '../../components/station'
import LineItem from '../../components/line'
import { Stanica, Linija, Korisnik } from '../../types/modeli'

export default function AdminPage() {
  const router = useRouter()
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
  const [openStanicaSearch, setOpenStanicaSearch] = useState(false)
  const [openLinijaSearch, setOpenLinijaSearch] = useState(false)
  const [promoteEmail, setPromoteEmail] = useState('')
  const [poruka, setPoruka] = useState('')

  const stanicaSearchRef = useRef<HTMLDivElement>(null)
  const linijaSearchRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const auth = sessionStorage.getItem('auth')
    if (auth !== 'admin') {
      router.push('/login')
      return
    }

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
  }, [router])

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
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 0,
          filter: 'blur(6px)',
          pointerEvents: 'none',
          height: '200vh'
        }}>
          <Map visina="200vh" sirina="100%" zoom={13} />
        </div>

        <div className="position-relative" style={{ 
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif',
          height: '100%',
          overflowY: 'auto',
          paddingTop: '3rem',
          paddingBottom: '5rem',
          zIndex: 1
        }}>
          <div className="container py-4">
            <div className="row justify-content-between align-items-center mb-4">
              <div className="col-auto">
                <h1 className="h3 fw-bold text-dark">Admin panel</h1>
                <p className="text-secondary mb-0">Upravljanje stanicama, linijama i korisnicima</p>
              </div>
              <div className="col-auto">
                <a href="/" className="btn btn-outline-dark">Nazad na sajt</a>
              </div>
            </div>

            {/* Dodavanje stanica */}
            <div className="row g-4 mb-4">
              <div className="col-12">
                <Bubble padding="lg" opacity={0.9}>
                  <h4 className="fw-bold mb-3">Dodaj stanicu</h4>
                  <div>
                    <div className="mb-2">
                      <input
                        value={stanicaForm.naziv}
                        onChange={e => setStanicaForm({ ...stanicaForm, naziv: e.target.value })}
                        className="form-control"
                        placeholder="Naziv stanice"
                      />
                    </div>
                    <div className="row g-2 mb-2">
                      <div className="col">
                        <input
                          value={stanicaForm.lat}
                          onChange={e => setStanicaForm({ ...stanicaForm, lat: e.target.value })}
                          className="form-control"
                          placeholder="Lat"
                        />
                      </div>
                      <div className="col">
                        <input
                          value={stanicaForm.lng}
                          onChange={e => setStanicaForm({ ...stanicaForm, lng: e.target.value })}
                          className="form-control"
                          placeholder="Lng"
                        />
                      </div>
                    </div>
                    <div className="form-check form-switch mb-3">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="aktivnaStanica"
                        checked={stanicaForm.aktivna}
                        onChange={e => setStanicaForm({ ...stanicaForm, aktivna: e.target.checked })}
                      />
                      <label className="form-check-label" htmlFor="aktivnaStanica">Aktivna</label>
                    </div>
                    <div className="d-flex gap-2">
                      <button onClick={addStanica} className="btn btn-primary">Dodaj stanicu</button>
                      <button
                        onClick={() => setStanicaForm({ naziv: '', lat: '', lng: '', aktivna: true })}
                        className="btn btn-outline-secondary"
                      >
                        Resetuj
                      </button>
                    </div>
                  </div>
                </Bubble>
              </div>
            </div>

            {/* Brisanje stanica */}
            <div className="row g-4 mb-4">
              <div className="col-12">
                <Bubble padding="lg" opacity={0.9}>
                  <h4 className="fw-bold mb-3">Obriši stanicu</h4>
                  <div className="row g-3">
                    <div className="col-md-9">
                      <div ref={stanicaSearchRef} style={{ position: 'relative' }}>
                        <div
                          className="input-group"
                          style={{
                            borderRadius: 50,
                            backgroundColor: 'white',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                            overflow: 'hidden'
                          }}
                        >
                          <input
                            type="text"
                            className="form-control border-0 px-4"
                            placeholder="Pretraži stanice..."
                            value={deleteStanicaSearch}
                            onChange={e => {
                              setDeleteStanicaSearch(e.target.value)
                              setOpenStanicaSearch(true)
                            }}
                            onFocus={() => setOpenStanicaSearch(true)}
                            style={{
                              borderRadius: 0,
                              backgroundColor: 'white'
                            }}
                          />
                          <button
                            onClick={() => setOpenStanicaSearch(true)}
                            className="btn btn-light border-0"
                            style={{
                              width: 52,
                              padding: '0.5rem 0',
                              borderRadius: 0,
                              backgroundColor: 'white',
                              color: 'black'
                            }}
                          >
                            🔍
                          </button>
                        </div>

                        {openStanicaSearch && deleteStanicaSearch && (
                          <div
                            style={{
                              position: 'absolute',
                              top: '60px',
                              left: 0,
                              width: '100%',
                              maxHeight: 300,
                              background: 'white',
                              borderRadius: 12,
                              boxShadow: '0 10px 30px rgba(0,0,0,0.35)',
                              overflowY: 'auto',
                              zIndex: 1000
                            }}
                          >
                            <div className="p-3 fw-bold border-bottom">
                              {filteredStanice.length} rezultata
                            </div>

                            {filteredStanice.length > 0 ? (
                              filteredStanice.map(stanica => (
                                <div key={stanica.stanica_id}>
                                  <StationItem
                                    stanica={stanica}
                                    onClick={() => deleteStanica(stanica)}
                                  />
                                </div>
                              ))
                            ) : (
                              <div className="p-3 text-muted">Nema rezultata</div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="col-md-3 d-flex align-items-start">
                      <button
                        onClick={() => {
                          if (filteredStanice.length === 1) {
                            deleteStanica(filteredStanice[0])
                          } else if (filteredStanice.length === 0) {
                            setPoruka('Nema stanice za brisanje')
                          } else {
                            setPoruka('Odaberite tačno jednu stanicu')
                          }
                        }}
                        className="btn btn-danger w-100"
                        disabled={!deleteStanicaSearch}
                      >
                        Obriši
                      </button>
                    </div>
                  </div>
                </Bubble>
              </div>
            </div>

            {/* Dodavanje linija */}
            <div className="row g-4 mb-4">
              <div className="col-12">
                <Bubble padding="lg" opacity={0.9}>
                  <h4 className="fw-bold mb-3">Dodaj liniju</h4>
                  <div>
                    <div className="mb-2">
                      <input
                        value={linijaForm.broj}
                        onChange={e => setLinijaForm({ ...linijaForm, broj: e.target.value })}
                        className="form-control"
                        placeholder="Broj linije"
                      />
                    </div>
                    <div className="mb-2">
                      <input
                        value={linijaForm.ime_linije}
                        onChange={e => setLinijaForm({ ...linijaForm, ime_linije: e.target.value })}
                        className="form-control"
                        placeholder="Ime linije"
                      />
                    </div>
                    <div className="mb-2">
                      <select
                        value={linijaForm.tip}
                        onChange={e => setLinijaForm({ ...linijaForm, tip: e.target.value })}
                        className="form-select"
                      >
                        <option value="autobus">Autobus</option>
                        <option value="tramvaj">Tramvaj</option>
                        <option value="trolejbus">Trolejbus</option>
                      </select>
                    </div>
                    <div className="form-check form-switch mb-3">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="aktivnaLinija"
                        checked={linijaForm.aktivna}
                        onChange={e => setLinijaForm({ ...linijaForm, aktivna: e.target.checked })}
                      />
                      <label className="form-check-label" htmlFor="aktivnaLinija">Aktivna</label>
                    </div>
                    <div className="d-flex gap-2">
                      <button onClick={addLinija} className="btn btn-primary">Dodaj liniju</button>
                      <button
                        onClick={() => setLinijaForm({ broj: '', tip: 'autobus', ime_linije: '', aktivna: true })}
                        className="btn btn-outline-secondary"
                      >
                        Resetuj
                      </button>
                    </div>
                  </div>
                </Bubble>
              </div>
            </div>

            {/* Brisanje linija */}
            <div className="row g-4 mb-4">
              <div className="col-12">
                <Bubble padding="lg" opacity={0.9}>
                  <h4 className="fw-bold mb-3">Obriši liniju</h4>
                  <div className="row g-3">
                    <div className="col-md-9">
                      <div ref={linijaSearchRef} style={{ position: 'relative' }}>
                        <div
                          className="input-group"
                          style={{
                            borderRadius: 50,
                            backgroundColor: 'white',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                            overflow: 'hidden'
                          }}
                        >
                          <input
                            type="text"
                            className="form-control border-0 px-4"
                            placeholder="Pretraži linije..."
                            value={deleteLinijaSearch}
                            onChange={e => {
                              setDeleteLinijaSearch(e.target.value)
                              setOpenLinijaSearch(true)
                            }}
                            onFocus={() => setOpenLinijaSearch(true)}
                            style={{
                              borderRadius: 0,
                              backgroundColor: 'white'
                            }}
                          />
                          <button
                            onClick={() => setOpenLinijaSearch(true)}
                            className="btn btn-light border-0"
                            style={{
                              width: 52,
                              padding: '0.5rem 0',
                              borderRadius: 0,
                              backgroundColor: 'white',
                              color: 'black'
                            }}
                          >
                            🔍
                          </button>
                        </div>

                        {openLinijaSearch && deleteLinijaSearch && (
                          <div
                            style={{
                              position: 'absolute',
                              top: '60px',
                              left: 0,
                              width: '100%',
                              maxHeight: 300,
                              background: 'white',
                              borderRadius: 12,
                              boxShadow: '0 10px 30px rgba(0,0,0,0.35)',
                              overflowY: 'auto',
                              zIndex: 1000
                            }}
                          >
                            <div className="p-3 fw-bold border-bottom">
                              {filteredLinije.length} rezultata
                            </div>

                            {filteredLinije.length > 0 ? (
                              filteredLinije.map(linija => (
                                <div key={linija.linija_id}>
                                  <LineItem
                                    linija={linija}
                                    onClick={() => deleteLinija(linija)}
                                  />
                                </div>
                              ))
                            ) : (
                              <div className="p-3 text-muted">Nema rezultata</div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="col-md-3 d-flex align-items-start">
                      <button
                        onClick={() => {
                          if (filteredLinije.length === 1) {
                            deleteLinija(filteredLinije[0])
                          } else if (filteredLinije.length === 0) {
                            setPoruka('Nema linije za brisanje')
                          } else {
                            setPoruka('Odaberite tačno jednu liniju')
                          }
                        }}
                        className="btn btn-danger w-100"
                        disabled={!deleteLinijaSearch}
                      >
                        Obriši
                      </button>
                    </div>
                  </div>
                </Bubble>
              </div>
            </div>

            {/* Upravljanje korisnicima */}
            <div className="row g-4 mb-4">
              <div className="col-lg-6">
                <Bubble padding="lg" opacity={0.9}>
                  <h5 className="fw-bold mb-3">Korisnici</h5>
                  <div className="list-group mb-3">
                    {korisnici.map(k => (
                      <div key={k.korisnik_id} className="list-group-item d-flex justify-content-between align-items-center">
                        <div>
                          <div className="fw-semibold">{k.ime} • {k.email}</div>
                          <div className="text-secondary small">
                            Uloga: {k.uloga_id === 1 ? 'Admin' : k.uloga_id === 2 ? 'Korisnik' : 'Gost'}
                          </div>
                        </div>
                        <div className="d-flex gap-2">
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
                            >
                              Napravi adminom
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="row g-2">
                    <div className="col">
                      <input
                        value={promoteEmail}
                        onChange={e => setPromoteEmail(e.target.value)}
                        className="form-control"
                        placeholder="Email korisnika"
                      />
                    </div>
                    <div className="col-auto">
                      <button onClick={promoteToAdmin} className="btn btn-primary">Promoviši</button>
                    </div>
                  </div>
                </Bubble>
              </div>

              <div className="col-lg-6">
                <Bubble padding="lg" opacity={0.9}>
                  <h5 className="fw-bold mb-3">Brze akcije</h5>
                  <div className="d-flex flex-column gap-2">
                    <button
                      onClick={() => {
                        setStanice([])
                        setPoruka('Sve stanice obrisane')
                      }}
                      className="btn btn-outline-danger"
                    >
                      Obriši sve stanice
                    </button>
                    <button
                      onClick={() => {
                        setLinije([])
                        setPoruka('Sve linije obrisane')
                      }}
                      className="btn btn-outline-danger"
                    >
                      Obriši sve linije
                    </button>
                    <button
                      onClick={() => {
                        setKorisnici(prev => prev.map(u => ({ ...u, uloga_id: 2 })))
                        setPoruka('Resetovane uloge korisnika')
                      }}
                      className="btn btn-outline-secondary"
                    >
                      Resetuj sve uloge na korisnik
                    </button>
                  </div>
                </Bubble>
              </div>
            </div>

            {/* Poruka */}
            {poruka && (
              <div className="row mt-4">
                <div className="col-12">
                  <div className="alert alert-info text-center">{poruka}</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}