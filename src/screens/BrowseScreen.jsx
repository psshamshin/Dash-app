import { useState } from 'react'
import { categories } from '../data/cars.js'

export default function BrowseScreen({ cars, onCarTap }) {
  const [cat, setCat]       = useState('All')
  const [search, setSearch] = useState('')
  const [pickup]            = useState('24.04.2025')
  const [ret]               = useState('28.04.2025')

  const filtered = cars.filter(c => {
    const matchCat = cat === 'All' || c.category === cat
    const q = search.toLowerCase()
    const matchQ = !q || c.brand.toLowerCase().includes(q) || c.model.toLowerCase().includes(q) || c.location.toLowerCase().includes(q)
    return matchCat && matchQ
  })

  const popular = cars.slice(0, 2)


  return (
    <div className="screen fade-up">
      {/* Header */}
      <div className="app-bar">
        <span className="logo">Dash<span>.</span></span>
        <div style={{ flex: 1 }} />
        <button className="icon-btn">🔔</button>
      </div>

      {/* Search form */}
      <div className="search-form">
        <div className="input-wrap" style={{ marginBottom: 10 }}>
          <span className="input-icon">🔍</span>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Pick-up and return location"
          />
        </div>
        <div className="date-row">
          <div className="date-field">
            <div className="date-field-label">Pick-up date</div>
            <div className="date-field-value">{pickup}</div>
          </div>
          <div className="date-field">
            <div className="date-field-label">Return date</div>
            <div className="date-field-value">{ret}</div>
          </div>
        </div>
        <button className="btn btn-primary btn-full" style={{ marginTop: 12, fontSize: '0.9rem' }}>
          Search
        </button>
      </div>

      {/* Filter chips */}
      <div className="h-scroll px-20 mb-20">
        {categories.map(c => (
          <button
            key={c}
            onClick={() => setCat(c)}
            style={{
              padding: '7px 16px',
              borderRadius: '100px',
              border: 'none',
              background: cat === c ? 'var(--accent)' : 'var(--surface)',
              color: cat === c ? '#fff' : 'var(--text-mid)',
              fontFamily: 'inherit',
              fontSize: '0.8rem',
              fontWeight: cat === c ? 600 : 400,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all .15s',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Most popular */}
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

      {/* All listings */}
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

function PopularCard({ car, onClick }) {
  return (
    <div className="car-card" style={{ minWidth: 180, maxWidth: 180 }} onClick={onClick}>
      <div className="car-card-image" style={{ background: car.colorBg }}>
        <span className="car-card-emoji">{car.emoji}</span>
        <span style={{
          position: 'absolute', top: 8, right: 8,
          background: 'rgba(0,0,0,0.25)', backdropFilter: 'blur(4px)',
          borderRadius: '100px', padding: '2px 8px',
          fontSize: '0.65rem', color: '#fff', fontWeight: 600,
        }}>
          {car.category}
        </span>
        {!car.isAvailable && (
          <span style={{
            position: 'absolute', top: 8, left: 8,
            background: 'var(--red)', borderRadius: '100px',
            padding: '2px 8px', fontSize: '0.62rem', color: '#fff', fontWeight: 600,
          }}>
            Rented
          </span>
        )}
      </div>
      <div className="car-card-body">
        <div className="car-card-price">
          ฿{car.price.toLocaleString()} <span>/ day</span>
        </div>
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
      <div className="car-list-thumb" style={{ background: car.colorBg }}>
        <span>{car.emoji}</span>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 600, color: 'var(--text)', fontSize: '0.9rem', marginBottom: 2 }}>
          {car.brand} {car.model}
        </div>
        <div style={{ fontSize: '0.78rem', color: 'var(--text-low)', marginBottom: 6 }}>
          {car.year} · {car.location}
        </div>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <span className="badge badge-accent">฿{car.price.toLocaleString()}/day</span>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-low)' }}>⭐ {car.rating}</span>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
        <span style={{
          width: 8, height: 8, borderRadius: '50%',
          background: car.isAvailable ? 'var(--green)' : 'var(--text-low)',
          display: 'block',
        }} />
        <span style={{ fontSize: '0.8rem', color: 'var(--text-low)' }}>›</span>
      </div>
    </div>
  )
}
