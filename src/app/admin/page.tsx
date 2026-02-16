'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import 'leaflet/dist/leaflet.css'
import Sidebar from '../../components/sidebar'
import Bubble from '../../components/bubble'
import StationItem from '../../components/station'
import LineItem from '../../components/line'

import { Stanica, Linija } from '../../types/modeli'

const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
)

const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
)

export default function AdminPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [stanice, setStanice] = useState<Stanica[]>([])
  const [linije, setLinije] = useState<Linija[]>([])
  const [stanicaForm, setStanicaForm] = useState({
    naziv: '',
    lat: '',
    lng: '',
    aktivna: true
  })
  const [linijaForm, setLinijaForm] = useState({
    broj: '',
    tip: 1,
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

  const [linijaStations, setLinijaStations] = useState<Stanica[]>([])
  const [stationIdInput, setStationIdInput] = useState('')

  const [updateLinijaSearch, setUpdateLinijaSearch] = useState('')
  const [selectedUpdateLinija, setSelectedUpdateLinija] = useState<Linija | null>(null)
  const [openUpdateLinijaSearch, setOpenUpdateLinijaSearch] = useState(false)
  const [updateLinijaStations, setUpdateLinijaStations] = useState<Stanica[]>([])
  const [updateStationIdInput, setUpdateStationIdInput] = useState('')
  const [updateEditForm, setUpdateEditForm] = useState({
    broj: '',
    tip: 1,
    ime_linije: '',
    aktivna: true
  })
  const [isLoadingUpdate, setIsLoadingUpdate] = useState(false)
  const updateLinijaSearchRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!poruka) return
    const el = document.createElement('div')
    el.textContent = poruka

    el.style.position = 'fixed'
    el.style.top = '24px'
    el.style.left = '50%'
    el.style.transform = 'translateX(-50%)'
    el.style.zIndex = '9999'

    el.style.background = '#3a3a3a'
    el.style.color = '#f0f0f0'
    el.style.padding = '12px 18px'
    el.style.borderRadius = '0px'
    el.style.fontSize = '14px'
    el.style.fontWeight = '500'

    el.style.boxShadow = '0 12px 28px rgba(0,0,0,0.35)'

    document.body.appendChild(el)

    const t = setTimeout(() => {
      el.remove()
      setPoruka('')
    }, 2000)

    return () => {
      clearTimeout(t)
      el.remove()
    }
  }, [poruka])

  useEffect(() => {
    const verifyAccess = async () => {
      const token = localStorage.getItem('token')
      if (!token) {
        setPoruka('⛔ Niste ulogovani!')
        setTimeout(() => {
          router.push('/login')
        }, 2000)
        return
      }
      try {
        const res = await fetch('/api/admin/verify', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
        if (!res.ok) {
          const data = await res.json()
          setPoruka(data.error || '⛔ Nemate pristup admin panelu!')
          setTimeout(() => {
            router.push('/')
          }, 2000)
          return
        }
        const data = await res.json()
        if (data.korisnik.uloga_id != 2) {
          setPoruka('⛔ Nemate pristup admin panelu!')
          setTimeout(() => {
            router.push('/')
          }, 2000)
          return
        }
        setLoading(false)
      } catch (error) {
        setPoruka('⛔ Greška pri verifikaciji pristupa')
        setTimeout(() => {
          router.push('/login')
        }, 2000)
      }
    }
    verifyAccess()
  }, [router])

  useEffect(() => {
    if (!loading) {
      const token = localStorage.getItem('token')
      const headers: Record<string, string> = {}
      if (token) headers.Authorization = `Bearer ${token}`

      const fetchStanice = async () => {
        try {
          const res = await fetch('/api/stations', { headers })
          if (res.ok) {
            const data = await res.json()
            setStanice(data)
          }
        } catch { }
      }

      const fetchLinije = async () => {
        try {
          const res = await fetch('/api/lines', { headers })
          if (res.ok) {
            const data = await res.json()
            const normalized = Array.isArray(data) ? data.map((l: any) => ({ ...l, tip: l.tip })) : data
            setLinije(normalized)
          }
        } catch { }
      }

      fetchStanice()
      fetchLinije()
    }
  }, [loading])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (stanicaSearchRef.current && !stanicaSearchRef.current.contains(event.target as Node)) {
        setOpenStanicaSearch(false)
      }
      if (linijaSearchRef.current && !linijaSearchRef.current.contains(event.target as Node)) {
        setOpenLinijaSearch(false)
      }
      if (updateLinijaSearchRef.current && !updateLinijaSearchRef.current.contains(event.target as Node)) {
        setOpenUpdateLinijaSearch(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const addStanica = async () => {
    if (!stanicaForm.naziv || !stanicaForm.lat || !stanicaForm.lng) {
      setPoruka('Popunite validne podatke za stanicu')
      return
    }
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        setPoruka('Niste ulogovani')
        return
      }
      const res = await fetch('/api/stations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          naziv: stanicaForm.naziv,
          lat: Number(stanicaForm.lat),
          lng: Number(stanicaForm.lng),
          aktivna: stanicaForm.aktivna
        })
      })
      const data = await res.json()
      if (res.ok) {
        setPoruka('Stanica dodata')
        setStanicaForm({ naziv: '', lat: '', lng: '', aktivna: true })
        const refresh = await fetch('/api/stations', { headers: { Authorization: `Bearer ${token}` } })
        if (refresh.ok) setStanice(await refresh.json())
      } else {
        setPoruka(data.error || 'Greška pri dodavanju stanice')
      }
    } catch {
      setPoruka('Greška pri dodavanju stanice')
    }
  }

  const deleteStanica = async (stanica: Stanica) => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        setPoruka('Niste ulogovani')
        return
      }
      const res = await fetch(`/api/stations?id=${stanica.stanica_id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      if (res.ok) {
        setPoruka(`Stanica "${stanica.naziv}" obrisana`)
        setDeleteStanicaSearch('')
        setSelectedStanica(null)
        setOpenStanicaSearch(false)
        const refresh = await fetch('/api/stations', { headers: { Authorization: `Bearer ${token}` } })
        if (refresh.ok) setStanice(await refresh.json())
      } else {
        setPoruka('Greška pri brisanju stanice')
      }
    } catch {
      setPoruka('Greška pri brisanju stanice')
    }
  }

  const handleAddStationById = async (idStr: string) => {
    const id = Number((idStr || '').toString().trim())
    if (!id) {
      setPoruka('Unesite validan ID stanice')
      return
    }
    if (linijaStations.some(s => s.stanica_id === id)) {
      setPoruka('Stanica je već u listi')
      setStationIdInput('')
      return
    }
    const local = stanice.find(s => s.stanica_id === id)
    if (local) {
      setLinijaStations(prev => [...prev, local])
      setStationIdInput('')
      setPoruka(`Dodato: ${local.naziv || `ID ${id}`}`)
      return
    }
    try {
      const token = localStorage.getItem('token')
      const headers: Record<string, string> = {}
      if (token) headers.Authorization = `Bearer ${token}`
      const res = await fetch(`/api/stations?id=${id}`, { headers })
      if (!res.ok) {
        setPoruka('Stanica ne postoji')
        return
      }
      const data = await res.json()
      let stanicaObj: Stanica | undefined
      if (Array.isArray(data)) stanicaObj = data.find((d: any) => d.stanica_id === id) ?? data[0]
      else stanicaObj = data
      if (!stanicaObj || stanicaObj.stanica_id !== id) {
        setPoruka('Stanica ne postoji')
        return
      }
      setLinijaStations(prev => [...prev, stanicaObj])
      setStationIdInput('')
      setPoruka(`Dodato: ${stanicaObj.naziv || `ID ${id}`}`)
    } catch {
      setPoruka('Greška pri proveri stanice')
    }
  }

  const handleStationKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddStationById(stationIdInput)
    }
  }

  const removeStationFromList = (id: number) => {
    setLinijaStations(prev => prev.filter(s => s.stanica_id !== id))
  }

  const addLinija = async () => {
    if (!linijaForm.broj || !linijaForm.ime_linije) {
      setPoruka('Popunite validne podatke za liniju')
      return
    }
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        setPoruka('Niste ulogovani')
        return
      }
      const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
      const checkRes = await fetch(`/api/lines?broj=${encodeURIComponent(linijaForm.broj)}`, { headers })
      if (checkRes.ok) {
        const existing = await checkRes.json()
        if (Array.isArray(existing) ? existing.length > 0 : (existing && Object.keys(existing).length > 0)) {
          setPoruka('Linija sa tim brojem već postoji')
          return
        }
      }

      const res = await fetch('/api/lines', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          broj: linijaForm.broj,
          tip: linijaForm.tip,
          ime_linije: linijaForm.ime_linije,
          aktivna: linijaForm.aktivna,
          stanice: linijaStations.map(s => s.stanica_id)
        })
      })
      const data = await res.json()
      if (res.ok) {
        setPoruka('Linija dodata')
        setLinijaForm({ broj: '', tip: 1, ime_linije: '', aktivna: true })
        setLinijaStations([])
        setStationIdInput('')
        const refresh = await fetch('/api/lines', { headers })
        if (refresh.ok) {
          const refreshed = await refresh.json()
          const normalized = Array.isArray(refreshed) ? refreshed.map((l: any) => ({ ...l, tip: l.tip })) : refreshed
          setLinije(normalized)
        }
      } else {
        setPoruka(data.error || 'Greška pri dodavanju linije')
      }
    } catch {
      setPoruka('Greška pri dodavanju linije')
    }
  }

  const deleteLinija = async (linija: Linija) => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        setPoruka('Niste ulogovani')
        return
      }
      const res = await fetch(`/api/lines?id=${linija.linija_id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      if (res.ok) {
        setPoruka(`Linija "${linija.broj} - ${linija.ime_linije}" obrisana`)
        setDeleteLinijaSearch('')
        setSelectedLinija(null)
        setOpenLinijaSearch(false)
        const refresh = await fetch('/api/lines', { headers: { Authorization: `Bearer ${token}` } })
        if (refresh.ok) {
          const refreshed = await refresh.json()
          const normalized = Array.isArray(refreshed) ? refreshed.map((l: any) => ({ ...l, tip: l.tip })) : refreshed
          setLinije(normalized)
        }
      } else {
        setPoruka('Greška pri brisanju linije')
      }
    } catch {
      setPoruka('Greška pri brisanju linije')
    }
  }

  const promoteToAdmin = async () => {
    const email = promoteEmail.trim().toLowerCase()
    if (!email) {
      setPoruka('Unesite email korisnika')
      return
    }
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        setPoruka('Niste ulogovani')
        return
      }
      const res = await fetch('/api/korisnici/promote', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ email, uloga_id: 2 })
      })
      const data = await res.json()
      if (res.ok) {
        setPoruka('Korisnik postavljen za admina')
        setPromoteEmail('')
      } else {
        setPoruka(data.error || 'Greška pri promovanju korisnika')
      }
    } catch {
      setPoruka('Greška pri promovanju korisnika')
    }
  }

  const demoteFromAdmin = async () => {
    const email = promoteEmail.trim().toLowerCase()
    if (!email) {
      setPoruka('Unesite email korisnika')
      return
    }
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        setPoruka('Niste ulogovani')
        return
      }
      const res = await fetch('/api/korisnici/promote', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ email, uloga_id: 1 })
      })
      const data = await res.json()
      if (res.ok) {
        setPoruka('Admin prava uklonjena')
        setPromoteEmail('')
      } else {
        setPoruka(data.error || 'Greška pri uklanjanju admin prava')
      }
    } catch {
      setPoruka('Greška pri uklanjanju admin prava')
    }
  }

  const loadLinijaDataForUpdate = async (linija: Linija) => {
    setIsLoadingUpdate(true)
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        setPoruka('Niste ulogovani')
        return
      }

      setUpdateEditForm({
        broj: linija.broj,
        tip: linija.tip,
        ime_linije: linija.ime_linije,
        aktivna: linija.aktivna
      })

      const res = await fetch(`/api/lines?linija_id=${linija.linija_id}&stanice=true`, {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (res.ok) {
        const data = await res.json()
        setUpdateLinijaStations(data)
      } else {
        setUpdateLinijaStations([])
      }
    } catch (error) {
      setPoruka('Greška pri učitavanju podataka linije')
      setUpdateLinijaStations([])
    } finally {
      setIsLoadingUpdate(false)
    }
  }

  const handleSelectUpdateLinija = (linija: Linija) => {
    setSelectedUpdateLinija(linija)
    setOpenUpdateLinijaSearch(false)
    loadLinijaDataForUpdate(linija)
  }

  const handleAddUpdateStationById = async (idStr: string) => {
    const id = Number((idStr || '').toString().trim())
    if (!id) {
      setPoruka('Unesite validan ID stanice')
      return
    }
    if (updateLinijaStations.some(s => s.stanica_id === id)) {
      setPoruka('Stanica je već u listi')
      setUpdateStationIdInput('')
      return
    }

    const local = stanice.find(s => s.stanica_id === id)
    if (local) {
      setUpdateLinijaStations(prev => [...prev, local])
      setUpdateStationIdInput('')
      setPoruka(`Dodato: ${local.naziv || `ID ${id}`}`)
      return
    }

    try {
      const token = localStorage.getItem('token')
      const headers: Record<string, string> = {}
      if (token) headers.Authorization = `Bearer ${token}`

      const res = await fetch(`/api/stations?id=${id}`, { headers })
      if (!res.ok) {
        setPoruka('Stanica ne postoji')
        return
      }

      const data = await res.json()
      let stanicaObj: Stanica | undefined
      if (Array.isArray(data)) stanicaObj = data.find((d: any) => d.stanica_id === id) ?? data[0]
      else stanicaObj = data

      if (!stanicaObj || stanicaObj.stanica_id !== id) {
        setPoruka('Stanica ne postoji')
        return
      }

      setUpdateLinijaStations(prev => [...prev, stanicaObj])
      setUpdateStationIdInput('')
      setPoruka(`Dodato: ${stanicaObj.naziv || `ID ${id}`}`)
    } catch {
      setPoruka('Greška pri proveri stanice')
    }
  }

  const handleUpdateStationKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddUpdateStationById(updateStationIdInput)
    }
  }

  const removeUpdateStationFromList = (id: number) => {
    setUpdateLinijaStations(prev => prev.filter(s => s.stanica_id !== id))
  }

  const moveUpdateStationUp = (index: number) => {
    if (index === 0) return
    const newStations = [...updateLinijaStations]
    const temp = newStations[index]
    newStations[index] = newStations[index - 1]
    newStations[index - 1] = temp
    setUpdateLinijaStations(newStations)
  }

  const moveUpdateStationDown = (index: number) => {
    if (index === updateLinijaStations.length - 1) return
    const newStations = [...updateLinijaStations]
    const temp = newStations[index]
    newStations[index] = newStations[index + 1]
    newStations[index + 1] = temp
    setUpdateLinijaStations(newStations)
  }

  const updateLinija = async () => {
    if (!selectedUpdateLinija) {
      setPoruka('Prvo odaberite liniju')
      return
    }

    if (!updateEditForm.broj || !updateEditForm.ime_linije) {
      setPoruka('Popunite validne podatke za liniju')
      return
    }

    try {
      const token = localStorage.getItem('token')
      if (!token) {
        setPoruka('Niste ulogovani')
        return
      }

      const tipCode = updateEditForm.tip

      const res = await fetch(`/api/lines`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          linija_id: selectedUpdateLinija.linija_id,
          broj: updateEditForm.broj,
          tip: tipCode,
          ime_linije: updateEditForm.ime_linije,
          aktivna: updateEditForm.aktivna,
          stanice: updateLinijaStations.map(s => s.stanica_id)
        })
      })

      const data = await res.json()

      if (res.ok) {
        setPoruka('Linija uspešno ažurirana')

        const refreshRes = await fetch('/api/lines', {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (refreshRes.ok) {
          const refreshed = await refreshRes.json()
          const normalized = Array.isArray(refreshed)
            ? refreshed.map((l: any) => ({ ...l, tip: l.tip }))
            : refreshed
          setLinije(normalized)

          const updatedLinija = normalized.find((l: Linija) => l.linija_id === selectedUpdateLinija.linija_id)
          if (updatedLinija) {
            setSelectedUpdateLinija(updatedLinija)
          }
        }
      } else {
        setPoruka(data.error || 'Greška pri ažuriranju linije')
      }
    } catch (error) {
      setPoruka('Greška pri ažuriranju linije')
    }
  }

  const resetUpdateForm = () => {
    setSelectedUpdateLinija(null)
    setUpdateLinijaSearch('')
    setUpdateLinijaStations([])
    setUpdateStationIdInput('')
    setUpdateEditForm({
      broj: '',
      tip: 1,
      ime_linije: '',
      aktivna: true
    })
  }

  const filteredStanice = stanice.filter(s =>
    s.naziv.toLowerCase().includes(deleteStanicaSearch.toLowerCase())
  )

  const filteredLinije = linije.filter(l =>
    l.broj.toLowerCase().includes(deleteLinijaSearch.toLowerCase()) ||
    l.ime_linije.toLowerCase().includes(deleteLinijaSearch.toLowerCase())
  )

  const filteredUpdateLinije = linije.filter(l =>
    l.broj.toLowerCase().includes(updateLinijaSearch.toLowerCase()) ||
    l.ime_linije.toLowerCase().includes(updateLinijaSearch.toLowerCase())
  )

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh', background: '#f8f9fa' }}>
        <div className="text-center">
          {poruka ? (
            <>
              <div className="display-1 mb-3">⛔</div>
              <h4 className="text-danger mb-3">{poruka}</h4>
              <p className="text-muted">Preusmeravanje...</p>
            </>
          ) : (
            <>
              <div className="spinner-border text-primary mb-3" role="status" style={{ width: '3rem', height: '3rem' }}>
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="text-secondary">Proveravamo pristup...</p>
            </>
          )}
        </div>
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet" />
      </div>
    )
  }

  return (
    <div className="d-flex" style={{ minHeight: '100vh', width: '100vw' }}>
      <style>{`
        .hover-bg:hover {
          background-color: #f8f9fa;
        }
      `}</style>

      <div style={{ width: '7vw', height: '100vh', position: 'fixed', top: 0, left: 0, zIndex: 1000 }}>
        <Sidebar onOpenFavorites={() => {}} />
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
          paddingTop: '0.5rem',
          paddingBottom: '3rem',
          zIndex: 1
        }}>
          <div className="container py-2">
            <div className="row justify-content-between align-items-center mb-2">
              <div className="col-auto">
                <h1 className="h3 fw-bold text-dark">Admin panel</h1>
                <p className="text-secondary mb-0" style={{ fontSize: '0.9rem' }}>Upravljanje stanicama, linijama i korisnicima</p>
              </div>
              <div className="col-auto">
                <button onClick={() => window.location.href = '/'} className="btn btn-outline-dark btn-sm">Nazad na sajt</button>
              </div>
            </div>

            <div className="row g-3 mb-2" style={{ position: 'relative', zIndex: 50 }}>
              <div className="col-md-6 d-flex">
                <Bubble padding="sm" opacity={0.9} className="w-100 h-100">
                  <h5 className="fw-bold mb-3" style={{ fontSize: '1rem' }}>Dodaj stanicu</h5>
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
                    <label className="form-check-label" htmlFor="aktivnaStanica" style={{ fontSize: '0.9rem' }}>Aktivna</label>
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

              <div className="col-md-6 d-flex">
                <Bubble padding="sm" opacity={0.9} className="w-100">
                  <h5 className="fw-bold mb-3" style={{ fontSize: '1rem' }}>Dodaj liniju</h5>
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
                      value={linijaForm.tip || 1} 
                      onChange={e => setLinijaForm({ ...linijaForm, tip: Number(e.target.value) })}
                      className="form-select form-select-sm"
                    >
                      <option value={1}>Autobus</option>
                      <option value={2}>Tramvaj</option>
                      <option value={3}>Trolejbus</option>
                    </select>
                  </div>

                  <div className="input-group input-group-sm mb-2">
                    <input
                      value={stationIdInput}
                      onChange={e => setStationIdInput(e.target.value)}
                      onKeyDown={handleStationKeyDown}
                      className="form-control"
                      placeholder="Unesite ID stanice i pritisnite Enter"
                    />
                    <button
                      className="btn btn-outline-secondary"
                      type="button"
                      onClick={() => handleAddStationById(stationIdInput)}
                    >
                      Dodaj
                    </button>
                  </div>

                  <div className="mb-2" style={{ maxHeight: 120, overflowY: 'auto' }}>
                    {linijaStations.length === 0 ? (
                      <div className="text-muted" style={{ fontSize: '0.85rem' }}>Nema dodatih stanica</div>
                    ) : (
                      <ul className="list-group list-group-flush">
                        {linijaStations.map(s => (
                          <li key={s.stanica_id} className="list-group-item d-flex justify-content-between align-items-center p-2">
                            <div style={{ fontSize: '0.85rem' }}>{s.naziv || `ID ${s.stanica_id}`}</div>
                            <button className="btn btn-sm btn-outline-danger" onClick={() => removeStationFromList(s.stanica_id)}>Ukloni</button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <div className="form-check form-switch mb-2">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="aktivnaLinija"
                      checked={linijaForm.aktivna}
                      onChange={e => setLinijaForm({ ...linijaForm, aktivna: e.target.checked })}
                    />
                    <label className="form-check-label" htmlFor="aktivnaLinija" style={{ fontSize: '0.9rem' }}>Aktivna</label>
                  </div>
                  <div className="d-flex gap-2">
                    <button onClick={addLinija} className="btn btn-primary btn-sm">Dodaj</button>
                    <button
                      onClick={() => {
                        setLinijaForm({ broj: '', tip: 1, ime_linije: '', aktivna: true })
                        setLinijaStations([])
                        setStationIdInput('')
                      }}
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
                  <h5 className="fw-bold mb-3" style={{ fontSize: '1rem' }}>Obriši stanicu</h5>
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
                        <div className="p-2 fw-bold border-bottom" style={{ fontSize: '0.85rem' }}>
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
                          <div className="p-2 text-muted" style={{ fontSize: '0.85rem' }}>Nema rezultata</div>
                        )}
                      </div>
                    )}
                  </div>
                  {selectedStanica && (
                    <div className="alert alert-warning p-2 mb-2" style={{ fontSize: '0.85rem' }}>
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
                  <h5 className="fw-bold mb-3" style={{ fontSize: '1rem' }}>Obriši liniju</h5>
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
                        <div className="p-2 fw-bold border-bottom" style={{ fontSize: '0.85rem' }}>
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
                          <div className="p-2 text-muted" style={{ fontSize: '0.85rem' }}>Nema rezultata</div>
                        )}
                      </div>
                    )}
                  </div>
                  {selectedLinija && (
                    <div className="alert alert-warning p-2 mb-2" style={{ fontSize: '0.85rem' }}>
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
              <div className="col-12" style={{ position: 'relative', zIndex: 50 }}>
                <Bubble padding="sm" opacity={0.9}>
                  <h5 className="fw-bold mb-3" style={{ fontSize: '1rem' }}>Ažuriraj liniju</h5>

                  <div ref={updateLinijaSearchRef} style={{ position: 'relative', zIndex: 9999 }}>
                    <div className="input-group input-group-sm mb-2">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Pretraži linije..."
                        value={updateLinijaSearch}
                        onChange={e => setUpdateLinijaSearch(e.target.value)}
                      />
                      <button
                        className="btn btn-outline-secondary"
                        type="button"
                        onClick={() => setOpenUpdateLinijaSearch(true)}
                      >
                        🔍
                      </button>
                    </div>
                    {openUpdateLinijaSearch && updateLinijaSearch && (
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
                        <div className="p-2 fw-bold border-bottom" style={{ fontSize: '0.85rem' }}>
                          {filteredUpdateLinije.length} rezultata
                        </div>
                        {filteredUpdateLinije.length > 0 ? (
                          filteredUpdateLinije.map(linija => (
                            <div key={linija.linija_id}>
                              <LineItem
                                linija={linija}
                                onClick={() => handleSelectUpdateLinija(linija)}
                              />
                            </div>
                          ))
                        ) : (
                          <div className="p-2 text-muted" style={{ fontSize: '0.85rem' }}>Nema rezultata</div>
                        )}
                      </div>
                    )}
                  </div>

                  {selectedUpdateLinija && (
                    <div className="alert alert-info p-2 mb-2" style={{ fontSize: '0.85rem' }}>
                      Uređujete: <strong>{selectedUpdateLinija.broj} - {selectedUpdateLinija.ime_linije}</strong>
                    </div>
                  )}

                  {selectedUpdateLinija && (
                    <>
                      {isLoadingUpdate ? (
                        <div className="text-center py-4">
                          <div className="spinner-border spinner-border-sm text-primary" role="status">
                            <span className="visually-hidden">Učitavanje...</span>
                          </div>
                        </div>
                      ) : (
                        <div className="row g-3">
                          <div className="col-md-6">
                            <div className="mb-2">
                              <label className="form-label" style={{ fontSize: '0.85rem' }}>Broj linije</label>
                              <input
                                value={updateEditForm.broj}
                                onChange={e => setUpdateEditForm({ ...updateEditForm, broj: e.target.value })}
                                className="form-control form-control-sm"
                                placeholder="Broj linije"
                              />
                            </div>

                            <div className="mb-2">
                              <label className="form-label" style={{ fontSize: '0.85rem' }}>Ime linije</label>
                              <input
                                value={updateEditForm.ime_linije}
                                onChange={e => setUpdateEditForm({ ...updateEditForm, ime_linije: e.target.value })}
                                className="form-control form-control-sm"
                                placeholder="Ime linije"
                              />
                            </div>

                            <div className="mb-3">
                              <label className="form-label" style={{ fontSize: '0.85rem' }}>Tip</label>
                              <select
                                value={updateEditForm.tip}
                                onChange={e => setUpdateEditForm({ ...updateEditForm, tip: Number(e.target.value) })}
                                className="form-select form-select-sm"
                              >
                                <option value={1}>Autobus</option>
                                <option value={2}>Tramvaj</option>
                                <option value={3}>Trolejbus</option>
                              </select>
                            </div>

                            <div className="form-check form-switch mb-3">
                              <input
                                className="form-check-input"
                                type="checkbox"
                                id="aktivnaLinijaUpdate"
                                checked={updateEditForm.aktivna}
                                onChange={e => setUpdateEditForm({ ...updateEditForm, aktivna: e.target.checked })}
                              />
                              <label className="form-check-label" htmlFor="aktivnaLinijaUpdate" style={{ fontSize: '0.9rem' }}>
                                Aktivna
                              </label>
                            </div>
                          </div>

                          <div className="col-md-6">
                            <div className="mb-3">
                              <label className="form-label" style={{ fontSize: '0.85rem' }}>Stanice na liniji</label>

                              <div className="input-group input-group-sm mb-2">
                                <input
                                  value={updateStationIdInput}
                                  onChange={e => setUpdateStationIdInput(e.target.value)}
                                  onKeyDown={handleUpdateStationKeyDown}
                                  className="form-control"
                                  placeholder="Unesite ID stanice"
                                />
                                <button
                                  className="btn btn-outline-secondary"
                                  type="button"
                                  onClick={() => handleAddUpdateStationById(updateStationIdInput)}
                                >
                                  Dodaj
                                </button>
                              </div>

                              <div style={{ maxHeight: 300, overflowY: 'auto', border: '1px solid #dee2e6', borderRadius: 4 }}>
                                {updateLinijaStations.length === 0 ? (
                                  <div className="text-muted text-center p-3" style={{ fontSize: '0.85rem' }}>
                                    Nema stanica na liniji
                                  </div>
                                ) : (
                                  <ul className="list-group list-group-flush">
                                    {updateLinijaStations.map((s, index) => (
                                      <li key={s.stanica_id} className="list-group-item d-flex justify-content-between align-items-center p-2">
                                        <div className="d-flex align-items-center gap-2">
                                          <span className="badge bg-secondary" style={{ fontSize: '0.7rem' }}>
                                            {index + 1}
                                          </span>
                                          <div style={{ fontSize: '0.85rem' }}>
                                            {s.naziv || `ID ${s.stanica_id}`}
                                          </div>
                                        </div>
                                        <div className="d-flex gap-1">
                                          <button
                                            className="btn btn-sm btn-outline-secondary p-1"
                                            style={{ fontSize: '0.7rem', lineHeight: 1 }}
                                            onClick={() => moveUpdateStationUp(index)}
                                            disabled={index === 0}
                                          >
                                            ↑
                                          </button>
                                          <button
                                            className="btn btn-sm btn-outline-secondary p-1"
                                            style={{ fontSize: '0.7rem', lineHeight: 1 }}
                                            onClick={() => moveUpdateStationDown(index)}
                                            disabled={index === updateLinijaStations.length - 1}
                                          >
                                            ↓
                                          </button>
                                          <button
                                            className="btn btn-sm btn-outline-danger p-1"
                                            style={{ fontSize: '0.7rem', lineHeight: 1 }}
                                            onClick={() => removeUpdateStationFromList(s.stanica_id)}
                                          >
                                            ✕
                                          </button>
                                        </div>
                                      </li>
                                    ))}
                                  </ul>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="col-12">
                            <div className="d-flex gap-2">
                              <button onClick={updateLinija} className="btn btn-primary btn-sm">
                                Sačuvaj izmene
                              </button>
                              <button onClick={resetUpdateForm} className="btn btn-outline-secondary btn-sm">
                                Otkaži
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </Bubble>
              </div>
            </div>

            <div className="row g-3 mb-2" style={{ position: 'relative', zIndex: 49 }}>
              <div className="col-md-6" style={{ position: 'relative', zIndex: 49 }}>
                <Bubble padding="sm" opacity={0.9}>
                  <h5 className="fw-bold mb-3" style={{ fontSize: '1rem' }}>Upravljanje ulogama</h5>
                  <div className="row g-2">
                    <div className="col-12">
                      <input
                        value={promoteEmail}
                        onChange={e => setPromoteEmail(e.target.value)}
                        className="form-control form-control-sm"
                        placeholder="Email korisnika"
                      />
                    </div>
                    <div className="col-12">
                      <div className="d-flex gap-2 w-100">
                        <button onClick={promoteToAdmin} className="btn btn-danger btn-sm flex-fill">
                          Postavi za admina
                        </button>
                        <button onClick={demoteFromAdmin} className="btn btn-danger btn-sm flex-fill">
                          Ukloni admina
                        </button>
                      </div>
                    </div>
                  </div>
                </Bubble>
              </div>
            </div>
          </div>
        </div>
      </div>

      <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet" />
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
    </div>
  )
}
