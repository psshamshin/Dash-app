import { useState } from 'react'

export default function CarDetailScreen({ car, role, user, onBack, onChat }) {
  const [liked, setLiked] = useState(false)

  const isOwnCar = user?.uid && car.ownerUid === user.uid

  function handleBook() {
    onChat(car)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100dvh', background: 'var(--bg)' }}>
      {/* App bar */}
      <div className="app-bar">
        <button className="icon-btn" onClick={onBack}>←</button>
        <span className="app-bar-title">{isOwnCar ? 'My listing' : 'Car detail'}</span>
        {!isOwnCar && (
          <button
            className="icon-btn"
            onClick={() => setLiked(l => !l)}
            style={{ color: liked ? '#ef4444' : undefined }}
          >
            {liked ? '❤️' : '🤍'}
          </button>
        )}
        {isOwnCar && <div style={{ width: 36 }} />}
      </div>

      {/* Scrollable body */}
      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 96 }}>
        {/* Hero */}
        <div className="car-detail-hero" style={{ background: car.colorBg, position: 'relative' }}>
          {car.photo ? (
            <img
              src={car.photo}
              alt={`${car.brand} ${car.model}`}
              style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }}
            />
          ) : (
            <span className="car-detail-emoji">{car.emoji}</span>
          )}
          {!car.isAvailable && (
            <span className="badge badge-surface" style={{
              position: 'absolute', bottom: 12, left: 12, zIndex: 2,
              background: 'rgba(239,68,68,.12)', color: 'var(--red)',
            }}>
              Currently rented
            </span>
          )}
          {isOwnCar && (
            <span style={{
              position: 'absolute', top: 12, right: 12, zIndex: 2,
              padding: '4px 12px', borderRadius: 100,
              background: 'rgba(249,115,22,0.2)', border: '1px solid rgba(249,115,22,0.4)',
              fontSize: '0.72rem', fontWeight: 700, color: '#f97316',
            }}>
              Your car
            </span>
          )}
        </div>

        {/* Info */}
        <div style={{ padding: '16px 16px 0' }}>
          {/* Title row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-low)', marginBottom: 3 }}>{car.year}</div>
              <h2 style={{ marginBottom: 0 }}>{car.brand} {car.model}</h2>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text)' }}>⭐ {car.rating}</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-low)' }}>{car.reviews} reviews</div>
            </div>
          </div>

          {/* Owner */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '12px', marginBottom: 16,
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)',
          }}>
            <div style={{
              width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
              background: car.colorBg,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.78rem', fontWeight: 700, color: car.color,
            }}>
              {car.ownerInit}
            </div>
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text)' }}>{car.owner}</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-low)' }}>📍 {car.location} · {car.eta} away</div>
            </div>
            <span className="badge badge-green" style={{ marginLeft: 'auto' }}>Verified</span>
          </div>

          {/* Specs */}
          <div style={{ marginBottom: 16 }}>
            <h3 style={{ marginBottom: 10 }}>Specifications</h3>
            <div className="spec-grid">
              {[
                { label: 'Seats',        value: car.seats },
                { label: 'Fuel type',    value: car.fuel },
                { label: 'Transmission', value: car.transmission },
                { label: 'Fuel usage',   value: car.fuelUsage },
              ].map(s => (
                <div key={s.label} className="spec-cell">
                  <div className="spec-label">{s.label}</div>
                  <div className="spec-value">{s.value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Description */}
          {car.description && (
            <div style={{ marginBottom: 16 }}>
              <h3 style={{ marginBottom: 10 }}>Description</h3>
              <p style={{ fontSize: '0.88rem', lineHeight: 1.6 }}>{car.description}</p>
            </div>
          )}

          {/* Last activity */}
          {car.activity?.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <h3 style={{ marginBottom: 10 }}>Last activity</h3>
              <div className="card" style={{ padding: '0 14px' }}>
                {car.activity.map((a, i) => (
                  <div key={i} className="activity-item">
                    <div className="activity-avatar">{a.emoji}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--text)' }}>{a.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-low)' }}>{a.dates}</div>
                    </div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-mid)' }}>{a.km}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Location */}
          <div style={{ marginBottom: 16 }}>
            <h3 style={{ marginBottom: 10 }}>Location</h3>
            <div className="card" style={{ overflow: 'hidden' }}>
              <div style={{
                height: 110, background: 'var(--surface-2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '2.2rem', borderBottom: '1px solid var(--border)',
              }}>
                🗺️
              </div>
              <div style={{ padding: '10px 14px' }}>
                <div style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--text)', marginBottom: 4 }}>
                  {car.location}
                </div>
                <div style={{ display: 'flex', gap: 10, fontSize: '0.78rem', color: 'var(--text-low)' }}>
                  <span>📍 {car.distance}</span>
                  <span>🕐 {car.eta}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky bottom bar */}
      <div className="detail-bottom-bar">
        <div className="detail-price-block">
          <div className="detail-price-main">฿{car.price.toLocaleString()}</div>
          <div className="detail-price-sub">per day · negotiate welcome</div>
        </div>

        {isOwnCar ? (
          <div style={{
            padding: '10px 20px', borderRadius: 100,
            background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border)',
            fontSize: '0.82rem', color: 'var(--text-low)', fontWeight: 500,
          }}>
            Your listing
          </div>
        ) : (
          <button
            className="btn btn-primary"
            style={{ fontSize: '0.9rem', padding: '13px 24px' }}
            onClick={handleBook}
          >
            Book now
          </button>
        )}
      </div>
    </div>
  )
}
