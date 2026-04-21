import { useState, useEffect } from 'react'
import { collection, query, where, onSnapshot } from 'firebase/firestore'
import { db } from '../firebase.js'

export default function ListingsScreen({ user, onCarTap, onAddCar }) {
  const [listings, setListings] = useState([])

  useEffect(() => {
    if (!user?.uid) return
    const q = query(
      collection(db, 'cars'),
      where('ownerUid', '==', user.uid)
    )
    return onSnapshot(q, snap => {
      const all = snap.docs.map(d => d.data())
      all.sort((a, b) => {
        const ta = a.createdAt?.toDate?.() || new Date(0)
        const tb = b.createdAt?.toDate?.() || new Date(0)
        return tb - ta
      })
      setListings(all)
    }, err => console.error('Listings load error:', err))
  }, [user?.uid])

  const totalEarnings = listings.reduce((sum, c) => sum + c.price * c.trips, 0)
  const totalTrips    = listings.reduce((sum, c) => sum + c.trips, 0)
  const avgRating     = listings.length
    ? (listings.reduce((sum, c) => sum + c.rating, 0) / listings.length).toFixed(1)
    : '—'

  return (
    <div className="screen fade-up">
      <div className="app-bar">
        <span style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text)' }}>My Cars</span>
        <div style={{ flex: 1 }} />
        <button className="icon-btn">🔔</button>
      </div>

      <div className="earnings-card mb-20">
        <div className="earnings-label">Total earnings</div>
        <div className="earnings-amount">฿{totalEarnings.toLocaleString()}</div>
        <div className="earnings-stats">
          <div className="earnings-stat">
            <div className="earnings-stat-val">{listings.filter(c => c.isAvailable).length}</div>
            <div className="earnings-stat-lbl">Active</div>
          </div>
          <div className="earnings-stat">
            <div className="earnings-stat-val">{totalTrips}</div>
            <div className="earnings-stat-lbl">Total trips</div>
          </div>
          <div className="earnings-stat">
            <div className="earnings-stat-val">{avgRating} ⭐</div>
            <div className="earnings-stat-lbl">Rating</div>
          </div>
        </div>
      </div>

      <div className="section-header px-20 mb-12">
        <h3>My listings</h3>
        <button className="btn btn-secondary" style={{ padding: '7px 14px', fontSize: '0.8rem' }} onClick={onAddCar}>
          + Add car
        </button>
      </div>

      {listings.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-low)' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: 10 }}>🚗</div>
          <p>No listings yet.<br />Tap "+ Add car" to post your first car.</p>
        </div>
      ) : (
        <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {listings.map(car => (
            <div key={car.id} className="listing-tile" onClick={() => onCarTap(car)}>
              <div className="listing-thumb" style={{ background: car.colorBg, overflow: 'hidden', position: 'relative' }}>
                {car.photo
                  ? <img src={car.photo} alt={car.model} style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }} />
                  : <span>{car.emoji}</span>
                }
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text)', marginBottom: 3 }}>
                  {car.brand} {car.model}
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--accent)', fontWeight: 600, marginBottom: 6 }}>
                  ฿{car.price.toLocaleString()}/day
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span className={`badge ${car.isAvailable ? 'badge-surface' : 'badge-green'}`}>
                    {car.isAvailable ? '○ Available' : '● Rented'}
                  </span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-low)' }}>{car.trips} trips</span>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'flex-end' }}>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-low)', cursor: 'pointer' }}>⋯</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-low)' }}>›</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
