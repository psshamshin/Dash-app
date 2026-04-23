export default function ProfileScreen({ user, theme, onToggleTheme, onLogout, onLogin }) {
  if (!user) {
    return (
      <div className="screen fade-up" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 24px' }}>
        <div style={{ fontSize: '3.5rem', marginBottom: 20 }}>👤</div>
        <h2 style={{ marginBottom: 8, textAlign: 'center' }}>Sign in to Dash</h2>
        <p style={{ textAlign: 'center', marginBottom: 32, fontSize: '0.9rem' }}>
          Create an account to book cars, chat with owners, and list your own vehicle.
        </p>
        <button className="btn btn-primary btn-full" style={{ maxWidth: 320 }} onClick={onLogin}>
          Sign in / Create account
        </button>
        <div style={{ marginTop: 24, display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-low)' }}>
            {theme === 'dark' ? '🌙 Dark mode' : '☀️ Light mode'}
          </span>
          <button
            onClick={onToggleTheme}
            className={`theme-toggle ${theme === 'light' ? 'light' : ''}`}
            aria-label="Toggle theme"
          />
        </div>
      </div>
    )
  }

  const displayName = user.name || 'User'
  const initials    = user.avatar || displayName.slice(0, 2).toUpperCase()
  const verified    = user.verified

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
        <span style={{ fontSize: '0.78rem', color: 'var(--text-low)', marginRight: 6 }}>
          {theme === 'dark' ? '🌙' : '☀️'}
        </span>
        <button
          onClick={onToggleTheme}
          className={`theme-toggle ${theme === 'light' ? 'light' : ''}`}
          aria-label="Toggle theme"
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '4px 16px 20px' }}>
        <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 700, color: '#fff', marginBottom: 12 }}>
          {initials}
        </div>
        <div style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--text)', marginBottom: 3 }}>{displayName}</div>
        <div style={{ fontSize: '0.78rem', color: 'var(--text-low)', marginBottom: 12 }}>{user.email}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 14px', borderRadius: '100px', background: verified ? 'var(--green-dim)' : 'rgba(255,255,255,0.06)', fontSize: '0.76rem', fontWeight: 600, color: verified ? 'var(--green)' : 'var(--text-low)' }}>
          {verified ? '✓ Identity verified' : '⚠ Not verified'}
        </div>
      </div>

      <div className="stats-row mb-16">
        {[{ val: '0', lbl: 'Trips' }, { val: '—', lbl: 'Rating' }, { val: '0', lbl: 'Cars' }].map(s => (
          <div key={s.lbl} className="stat-cell">
            <div className="stat-val">{s.val}</div>
            <div className="stat-lbl">{s.lbl}</div>
          </div>
        ))}
      </div>

      <div className="menu-group">
        {settings.map(s => (
          <div key={s.label} className="menu-item">
            <span className="menu-item-icon">{s.icon}</span>
            <span className="menu-item-label">{s.label}</span>
            <span className="menu-item-right">›</span>
          </div>
        ))}
      </div>

      <div style={{ padding: '16px 16px 28px' }}>
        <button className="btn btn-secondary btn-full" style={{ color: 'var(--red)', fontSize: '0.88rem' }} onClick={onLogout}>
          Sign out
        </button>
      </div>
    </div>
  )
}
