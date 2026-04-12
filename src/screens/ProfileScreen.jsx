export default function ProfileScreen() {
  const stats = [
    { val: '47', lbl: 'Trips' },
    { val: '4.8 ⭐', lbl: 'Rating' },
    { val: '2', lbl: 'Cars' },
  ]

  const settings = [
    { icon: '👤', label: 'Personal info' },
    { icon: '🪪', label: 'Identity verification' },
    { icon: '💳', label: 'Payment methods' },
    { icon: '🔔', label: 'Notifications' },
    { icon: '🌐', label: 'Language' },
    { icon: '🔒', label: 'Privacy & security' },
    { icon: '❓', label: 'Help center' },
    { icon: '📄', label: 'Terms & conditions' },
  ]

  return (
    <div className="screen fade-up">
      <div className="app-bar">
        <span style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text)' }}>Profile</span>
        <div style={{ flex: 1 }} />
        <button className="icon-btn">⚙️</button>
      </div>

      {/* Avatar + name */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '4px 16px 20px' }}>
        <div style={{
          width: 72, height: 72, borderRadius: '50%',
          background: 'var(--accent)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.5rem', fontWeight: 700, color: '#fff',
          marginBottom: 12,
        }}>
          PS
        </div>
        <div style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--text)', marginBottom: 3 }}>
          Pasha S.
        </div>
        <div style={{ fontSize: '0.78rem', color: 'var(--text-low)', marginBottom: 12 }}>
          Member since 2024
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 5,
          padding: '5px 14px', borderRadius: '100px',
          background: 'var(--green-dim)',
          fontSize: '0.76rem', fontWeight: 600, color: 'var(--green)',
        }}>
          ✓ Identity verified
        </div>
      </div>

      {/* Stats */}
      <div className="stats-row mb-16">
        {stats.map((s, i) => (
          <div key={s.lbl} className="stat-cell">
            <div className="stat-val">{s.val}</div>
            <div className="stat-lbl">{s.lbl}</div>
          </div>
        ))}
      </div>

      {/* Settings list */}
      <div className="menu-group">
        {settings.map((s, i) => (
          <div key={s.label} className="menu-item">
            <span className="menu-item-icon">{s.icon}</span>
            <span className="menu-item-label">{s.label}</span>
            <span className="menu-item-right">›</span>
          </div>
        ))}
      </div>

      {/* Sign out */}
      <div style={{ padding: '16px 16px 28px' }}>
        <button className="btn btn-secondary btn-full" style={{ color: 'var(--red)', fontSize: '0.88rem' }}>
          Sign out
        </button>
      </div>
    </div>
  )
}
