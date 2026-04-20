export default function SplashScreen({ onStart }) {
  return (
    <div className="splash fade-up">
      {/* Hero — dark full-bleed */}
      <div className="splash-hero">
        <div className="splash-glow" />
        <span className="splash-car">🚗</span>
      </div>

      {/* Content */}
      <div className="splash-content">
        <div className="splash-tags">
          {['Search', 'Compare', 'Hire'].map(t => (
            <span key={t} className="splash-tag">{t}</span>
          ))}
        </div>

        <h1 style={{ marginBottom: 12, fontSize: 'clamp(1.75rem,7vw,2.2rem)', color: '#fff', lineHeight: 1.15 }}>
          Find the ideal car rental for your trip!
        </h1>

        <p style={{ marginBottom: 36, fontSize: '0.9rem', color: 'rgba(255,255,255,0.45)', lineHeight: 1.6 }}>
          Get access to the best deals from global car rental companies.
        </p>

        <button
          className="btn btn-primary btn-full"
          style={{ fontSize: '0.95rem', padding: '16px' }}
          onClick={onStart}
        >
          Get started
        </button>
      </div>
    </div>
  )
}
