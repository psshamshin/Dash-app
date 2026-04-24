import { useState, useEffect } from 'react'
import { collection, query, where, onSnapshot } from 'firebase/firestore'
import { db } from '../firebase.js'
import { cars as seedCars, categories } from '../data/cars.js'
import { APP_VERSION } from '../version.js'

export default function BrowseScreen({ user, onCarTap, onRentalTap }) {
  const [cat, setCat]         = useState('All')
  const [search, setSearch]   = useState('')
  const [firestoreCars, setFirestoreCars] = useState([])
  const [myRentals, setMyRentals] = useState([])
  const today = new Date().toISOString().split('T')[0]
  const plus4  = new Date(Date.now() + 4 * 864e5).toISOString().split('T')[0]
  const [pickup, setPickup] = useState(today)
  const [ret,    setRet]    = useState(plus4)

  useEffect(() => {
    const q = query(collection(db, 'cars'))
    return onSnapshot(q, snap => {
      const all = snap.docs.map(d => d.data())
      all.sort((a, b) => {
        const ta = a.createdAt?.toDate?.() || new Date(0)
        const tb = b.createdAt?.toDate?.() || new Date(0)
        return tb - ta
      })
      setFirestoreCars(all)
    }, _err => {})
  }, [])

  useEffect(() => {
    if (!user?.uid) return
    const q = query(
      collection(db, 'bookings'),
      where('renterUid', '==', user.uid),
      where('status', '==', 'confirmed')
    )
    return onSnapshot(q, snap => {
      const all = snap.docs.map(d => ({ ...d.data(), id: d.id }))
      all.sort((a, b) => {
        const ta = a.createdAt?.toDate?.() || new Date(0)
        const tb = b.createdAt?.toDate?.() || new Date(0)
        return tb - ta
      })
      setMyRentals(all)
    }, _err => {})
  }, [user?.uid])

  const allCars = [...firestoreCars, ...seedCars]

  const filtered = allCars.filter(c => {
    const matchCat = cat === 'All' || c.category === cat
    const q = search.toLowerCase()
    const matchQ = !q ||
      c.brand.toLowerCase().includes(q) ||
      c.model.toLowerCase().includes(q) ||
      c.location.toLowerCase().includes(q)
    return matchCat && matchQ
  })

  const popular = allCars.slice(0, 4)

  return (
    <div className="screen fade-up">
      <div className="app-bar">
        <span className="logo">Dash<span>.</span></span>
        <span style={{ fontSize: '0.6rem', fontWeight: 600, color: 'var(--accent)', background: 'var(--accent-dim)', border: '1px solid var(--accent-mid)', borderRadius: 100, padding: '2px 7px', letterSpacing: '0.04em', marginLeft: 2 }}>{APP_VERSION}</span>
        <div style={{ flex: 1 }} />
        <button className="icon-btn">🔔</button>
      </div>

      {myRentals.length > 0 && (
        <div style={{ padding: '0 16px 4px' }}>
          {myRentals.map(rental => <RentalCard key={rental.id} rental={rental} onTap={() => onRentalTap(rental)} />)}
        </div>
      )}

      <div className="search-form">
        <div className="input-wrap" style={{ marginBottom: 10 }}>
          <span className="input-icon">🔍</span>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by car, brand or location"
          />
        </div>
        <div className="date-row">
          <div className="date-field">
            <div className="date-field-label">📅 Pick-up date</div>
            <input type="date" value={pickup} min={today} onChange={e => setPickup(e.target.value)}
              style={{ marginTop: 4, padding: 0, background: 'transparent', border: 'none', color: 'var(--text)', fontFamily: 'inherit', fontSize: '0.85rem', fontWeight: 600, outline: 'none', width: '100%' }} />
          </div>
          <div className="date-field">
            <div className="date-field-label">📅 Return date</div>
            <input type="date" value={ret} min={pickup || today} onChange={e => setRet(e.target.value)}
              style={{ marginTop: 4, padding: 0, background: 'transparent', border: 'none', color: 'var(--text)', fontFamily: 'inherit', fontSize: '0.85rem', fontWeight: 600, outline: 'none', width: '100%' }} />
          </div>
        </div>
        <button className="btn btn-primary btn-full" style={{ marginTop: 12, fontSize: '0.9rem' }}>
          Search
        </button>
      </div>

      <div className="h-scroll px-20 mb-20">
        {categories.map(c => (
          <button
            key={c}
            onClick={() => setCat(c)}
            style={{
              padding: '7px 16px', borderRadius: '100px', border: 'none',
              background: cat === c ? 'var(--accent)' : 'var(--surface)',
              color: cat === c ? '#fff' : 'var(--text-mid)',
              fontFamily: 'inherit', fontSize: '0.8rem',
              fontWeight: cat === c ? 600 : 400,
              cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all .15s',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="px-20 mb-20">
        <div className="section-header">
          <h3>Most popular</h3>
          <button className="see-all">See all →</button>
        </div>
        <div className="h-scroll">
          {popular.map(car => (
            <PopularCard key={car.id} car={car} onClick={() => onCarTap(car)} />
          ))}
        </div>
      </div>

      <div className="px-20 mb-8">
        <div className="section-header">
          <h3>{cat === 'All' ? 'All cars' : cat}</h3>
          <span className="badge badge-surface">{filtered.length}</span>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-low)' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: 10 }}>🔍</div>
          <p>No cars found.</p>
        </div>
      ) : (
        <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column' }}>
          {filtered.map(car => (
            <ListItem key={car.id} car={car} onClick={() => onCarTap(car)} />
          ))}
        </div>
      )}
    </div>
  )
}

function RentalCard({ rental, onTap }) {
  const now      = Date.now()
  const pickupMs = new Date(rental.pickup).getTime()
  const retMs    = new Date(rental.ret).getTime()
  const isActive   = now >= pickupMs && now <= retMs
  const isUpcoming = now < pickupMs
  const daysLeft   = Math.ceil((retMs - now) / 864e5)
  const daysUntil  = Math.ceil((pickupMs - now) / 864e5)
  const fmt = n => Number(n).toLocaleString()

  return (
    <div
      onClick={onTap}
      style={{
        display: 'flex', alignItems: 'center', gap: 12,
        background: 'var(--surface)',
        border: `1px solid ${isActive ? 'rgba(34,197,94,0.35)' : 'var(--accent-mid)'}`,
        borderRadius: 16, padding: '12px 14px', cursor: 'pointer',
        marginBottom: 8,
        boxShadow: isActive ? '0 0 0 1px rgba(34,197,94,0.15)' : '0 0 0 1px rgba(249,115,22,0.08)',
      }}
    >
      {/* Car thumb */}
      <div style={{ width: 54, height: 46, borderRadius: 10, background: rental.carColorBg || 'rgba(249,115,22,0.15)', overflow: 'hidden', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.6rem', flexShrink: 0 }}>
        {rental.carPhoto
          ? <img src={rental.carPhoto} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }} />
          : rental.carEmoji || '🚗'
        }
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
          <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {rental.carBrand} {rental.carModel}
          </span>
          <span className={`badge ${isActive ? 'badge-green' : 'badge-accent'}`} style={{ fontSize: '0.6rem', flexShrink: 0 }}>
            {isActive ? '● Active' : 'Upcoming'}
          </span>
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-low)', marginBottom: 3 }}>
          📅 {rental.pickup} → {rental.ret} · {rental.days} day{rental.days !== 1 ? 's' : ''}
        </div>
        <div style={{ fontSize: '0.75rem', fontWeight: 600, color: isActive ? 'var(--green)' : 'var(--accent)' }}>
          {isActive
            ? `${daysLeft} day${daysLeft !== 1 ? 's' : ''} remaining`
            : `Starts in ${daysUntil} day${daysUntil !== 1 ? 's' : ''}`
          }
          {' · '}฿{fmt(rental.total)}
        </div>
      </div>

      <span style={{ fontSize: '1rem', color: 'var(--text-low)', flexShrink: 0 }}>›</span>
    </div>
  )
}

function PopularCard({ car, onClick }) {
  return (
    <div className="car-card" style={{ minWidth: 180, maxWidth: 180 }} onClick={onClick}>
      <div className="car-card-image" style={{ background: car.colorBg }}>
        {car.photo
          ? <img src={car.photo} alt={car.model} style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }} />
          : <span className="car-card-emoji">{car.emoji}</span>
        }
        <span style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(0,0,0,0.25)', backdropFilter: 'blur(4px)', borderRadius: '100px', padding: '2px 8px', fontSize: '0.65rem', color: '#fff', fontWeight: 600 }}>
          {car.category}
        </span>
        {!car.isAvailable && (
          <span style={{ position: 'absolute', top: 8, left: 8, background: 'var(--red)', borderRadius: '100px', padding: '2px 8px', fontSize: '0.62rem', color: '#fff', fontWeight: 600 }}>
            Rented
          </span>
        )}
      </div>
      <div className="car-card-body">
        <div className="car-card-price">฿{car.price.toLocaleString()} <span>/ day</span></div>
        <div className="car-card-name">{car.brand} {car.model}</div>
        <div className="car-card-meta">
          <span style={{ fontSize: '0.72rem', color: 'var(--text-low)' }}>📍 {car.location}</span>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-mid)' }}>⭐ {car.rating}</span>
        </div>
      </div>
    </div>
  )
}

function ListItem({ car, onClick }) {
  return (
    <div className="car-list-item" onClick={onClick}>
      <div className="car-list-thumb" style={{ background: car.colorBg, overflow: 'hidden', position: 'relative' }}>
        {car.photo
          ? <img src={car.photo} alt={car.model} style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }} />
          : <span>{car.emoji}</span>
        }
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 600, color: 'var(--text)', fontSize: '0.9rem', marginBottom: 2 }}>{car.brand} {car.model}</div>
        <div style={{ fontSize: '0.78rem', color: 'var(--text-low)', marginBottom: 6 }}>{car.year} · {car.location}</div>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <span className="badge badge-accent">฿{car.price.toLocaleString()}/day</span>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-low)' }}>⭐ {car.rating}</span>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
        <span style={{ width: 8, height: 8, borderRadius: '50%', background: car.isAvailable ? 'var(--green)' : 'var(--text-low)', display: 'block' }} />
        <span style={{ fontSize: '0.8rem', color: 'var(--text-low)' }}>›</span>
      </div>
    </div>
  )
}
