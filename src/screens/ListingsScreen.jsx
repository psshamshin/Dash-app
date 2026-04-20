export default function ListingsScreen({ cars, onCarTap, onAddCar }) {
  const myListings = cars.filter(c => c.isOwn) .length > 0
    ? cars.filter(c => c.isOwn)
    : cars.slice(0, 2)
  return (
    <div className="screen fade-up">
      {/* Header */}
      <div className="app-bar">
        <span style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text)' }}>My Cars</span>
        <div style={{ flex: 1 }} />
        <button className="icon-btn">🔔</button>
      </div>

      {/* Earnings card */}
      <div className="earnings-card mb-20">
        <div className="earnings-label">Monthly earnings</div>
        <div className="earnings-amount">฿18,400</div>
        <div className="earnings-stats">
          <div className="earnings-stat">
            <div className="earnings-stat-val">2</div>
            <div className="earnings-stat-lbl">Active</div>
          </div>
          <div className="earnings-stat">
            <div className="earnings-stat-val">47</div>
            <div className="earnings-stat-lbl">Total trips</div>
          </div>
          <div className="earnings-stat">
            <div className="earnings-stat-val">4.8 ⭐</div>
            <div className="earnings-stat-lbl">Rating</div>
          </div>
        </div>
      </div>

      {/* Section header */}
      <div className="section-header px-20 mb-12">
        <h3>My listings</h3>
        <button className="btn btn-secondary" style={{ padding: '7px 14px', fontSize: '0.8rem' }} onClick={onAddCar}>
          + Add car
        </button>
      </div>

      {/* Listings */}
      <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {myListings.map((car, i) => {
          const isRented = i === 1
          return (
            <div key={car.id} className="listing-tile" onClick={() => onCarTap(car)}>
              <div className="listing-thumb" style={{ background: car.colorBg }}>
                <span>{car.emoji}</span>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text)', marginBottom: 3 }}>
                  {car.brand} {car.model}
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--accent)', fontWeight: 600, marginBottom: 6 }}>
                  ฿{car.price.toLocaleString()}/day
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span className={`badge ${isRented ? 'badge-green' : 'badge-surface'}`}>
                    {isRented ? '● Rented' : '○ Available'}
                  </span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-low)' }}>
                    {car.trips} trips
                  </span>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'flex-end' }}>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-low)', cursor: 'pointer' }}>⋯</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-low)' }}>›</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
