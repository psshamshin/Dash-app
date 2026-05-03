const ADMIN_EMAIL = 'psshamshin@gmail.com'

export default function ProfileScreen({ user, theme, onToggleTheme, onLogout, onLogin, onAdmin }) {
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

  const docs              = user.documents || {}
  const hasNationalId     = 'nationalId'     in docs ? docs.nationalId     : !!verified
  const hasDrivingLicense = 'drivingLicense' in docs ? docs.drivingLicense : !!verified
  const OPTIONAL_DOCS = [
    { key: 'drivingHistory',    label: 'Driving History' },
    { key: 'pastBookings',      label: 'Past Bookings' },
    { key: 'houseRegistration', label: 'House Registration' },
    { key: 'incomeStatement',   label: 'Income Statement' },
  ]
  const optionalUploaded = OPTIONAL_DOCS.filter(d => docs[d.key]).length
  const discountPct      = optionalUploaded * 5

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

      {/* ── Deposit discount card ── */}
      <div style={{ margin: '0 16px 12px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '14px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <span style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text)' }}>💰 Deposit Discount</span>
          <span style={{
            fontSize: '0.78rem', fontWeight: 700, padding: '3px 10px', borderRadius: 100,
            background: discountPct > 0 ? 'var(--green-dim)' : 'rgba(255,255,255,0.06)',
            color: discountPct > 0 ? 'var(--green)' : 'var(--text-low)',
          }}>
            {discountPct > 0 ? `−${discountPct}% on deposit` : 'No discount yet'}
          </span>
        </div>

        {[
          { done: hasNationalId,     label: 'National ID',       required: true },
          { done: hasDrivingLicense, label: 'Driving License',   required: true },
          ...OPTIONAL_DOCS.map(d => ({ done: !!docs[d.key], label: d.label, required: false })),
        ].map(({ done, label, required }, i, arr) => (
          <div key={label} style={{
            display: 'flex', alignItems: 'center', gap: 10, paddingTop: 8, paddingBottom: 8,
            borderBottom: i < arr.length - 1 ? '1px solid var(--border)' : 'none',
          }}>
            <span style={{ fontSize: '0.9rem', lineHeight: 1 }}>{done ? '✅' : '○'}</span>
            <span style={{ flex: 1, fontSize: '0.83rem', color: done ? 'var(--text)' : 'var(--text-low)' }}>{label}</span>
            {required
              ? <span style={{ fontSize: '0.68rem', fontWeight: 600, color: 'var(--text-low)', letterSpacing: '0.03em' }}>REQUIRED</span>
              : <span style={{ fontSize: '0.75rem', fontWeight: 700, color: done ? 'var(--green)' : 'var(--accent)' }}>+5%</span>
            }
          </div>
        ))}

        <div style={{ marginTop: 12, padding: '8px 12px', background: 'rgba(249,115,22,0.06)', borderRadius: 10 }}>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-low)', lineHeight: 1.6 }}>
            <span style={{ fontWeight: 700, color: 'var(--accent)' }}>Deposit tiers: </span>
            🟢 Low &lt;3,000฿ · 🟡 Standard 3–6K฿ · 🔴 High &gt;6K฿
          </div>
        </div>
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

      {user.email === ADMIN_EMAIL && (
        <div style={{ padding: '0 16px 10px' }}>
          <button
            onClick={onAdmin}
            style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '13px 16px', background: 'rgba(249,115,22,0.07)', border: '1px solid rgba(249,115,22,0.2)', borderRadius: 12, cursor: 'pointer', textAlign: 'left' }}
          >
            <span style={{ fontSize: '1rem' }}>🛠️</span>
            <span style={{ flex: 1, fontSize: '0.88rem', fontWeight: 600, color: 'var(--accent)' }}>Admin Panel</span>
            <span className="badge badge-accent" style={{ fontSize: '0.6rem' }}>dev</span>
          </button>
        </div>
      )}

      <div style={{ padding: '0 16px 28px' }}>
        <button className="btn btn-secondary btn-full" style={{ color: 'var(--red)', fontSize: '0.88rem' }} onClick={onLogout}>
          Sign out
        </button>
      </div>
    </div>
  )
}
