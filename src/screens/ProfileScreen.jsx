import { useState, useRef } from 'react'
import { doc, updateDoc } from 'firebase/firestore'
import { db } from '../firebase.js'

const ADMIN_EMAIL = 'psshamshin@gmail.com'

// ─── Optional document upload modal ──────────────────────────────────────────
function DocUploadModal({ docLabel, docKey, user, onClose, onDone }) {
  const [step,    setStep]    = useState('upload')  // upload | verifying | done
  const [preview, setPreview] = useState(null)
  const fileRef = useRef(null)

  function handleFile(e) {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => setPreview(ev.target.result)
    reader.readAsDataURL(file)
  }

  async function submitDoc() {
    setStep('verifying')
    setTimeout(async () => {
      setStep('done')
      try {
        if (user?.uid) await updateDoc(doc(db, 'users', user.uid), {
          [`documents.${docKey}`]: true,
        })
      } catch (e) { console.error(e) }
      setTimeout(() => onDone(docKey), 1200)
    }, 2200)
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#0a0a0a', zIndex: 200, display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 20px' }}>
        {step === 'upload' && (
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', fontSize: '1.4rem', cursor: 'pointer', lineHeight: 1, padding: 0 }}>←</button>
        )}
        <span style={{ fontSize: '1rem', fontWeight: 700, color: '#fff', flex: 1 }}>Upload {docLabel}</span>
      </div>

      <div style={{ flex: 1, padding: '8px 20px 40px', display: 'flex', flexDirection: 'column' }}>

        {step === 'upload' && (
          <>
            <p style={{ marginBottom: 24, fontSize: '0.88rem', color: 'rgba(255,255,255,0.45)' }}>
              Upload a clear photo or scan of your {docLabel}.
            </p>

            <div
              onClick={() => fileRef.current?.click()}
              style={{
                flex: 1, minHeight: 200,
                border: `2px dashed ${preview ? 'rgba(249,115,22,0.4)' : 'rgba(255,255,255,0.12)'}`,
                borderRadius: 16, cursor: 'pointer',
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                background: preview ? 'transparent' : 'rgba(255,255,255,0.03)',
                transition: 'border-color .2s',
                overflow: 'hidden', marginBottom: 20, position: 'relative',
              }}
            >
              {preview ? (
                <>
                  <img src={preview} alt="doc" style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0, opacity: 0.85 }} />
                  <div style={{
                    position: 'absolute', bottom: 12, left: '50%', transform: 'translateX(-50%)',
                    background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)',
                    padding: '6px 14px', borderRadius: 100,
                    fontSize: '0.75rem', color: '#fff', fontWeight: 500, whiteSpace: 'nowrap',
                  }}>
                    Tap to replace
                  </div>
                </>
              ) : (
                <>
                  <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>📄</div>
                  <div style={{ fontSize: '0.88rem', color: 'rgba(255,255,255,0.5)', fontWeight: 500, marginBottom: 4 }}>
                    Tap to upload document
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.25)' }}>
                    JPG, PNG or PDF — max 10 MB
                  </div>
                </>
              )}
            </div>

            <input ref={fileRef} type="file" accept="image/*,application/pdf" onChange={handleFile} style={{ display: 'none' }} />

            <button
              onClick={submitDoc}
              disabled={!preview}
              style={{
                width: '100%', padding: '15px', borderRadius: 100, border: 'none',
                background: preview ? '#f97316' : 'rgba(255,255,255,0.08)',
                color: preview ? '#fff' : 'rgba(255,255,255,0.25)',
                fontFamily: 'inherit', fontSize: '0.95rem', fontWeight: 700,
                cursor: preview ? 'pointer' : 'default', transition: 'all .2s',
              }}
            >
              Submit for verification
            </button>
          </>
        )}

        {step === 'verifying' && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20 }}>
            <div style={{ position: 'relative', width: 80, height: 80 }}>
              <div style={{
                width: 80, height: 80, borderRadius: '50%',
                border: '3px solid rgba(249,115,22,0.2)',
                borderTopColor: '#f97316',
                animation: 'spin 0.9s linear infinite',
              }} />
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem' }}>
                🔍
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff', marginBottom: 6 }}>Verifying document…</div>
              <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.4)' }}>This takes just a second</div>
            </div>
          </div>
        )}

        {step === 'done' && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
            <div style={{
              width: 80, height: 80, borderRadius: '50%',
              background: 'rgba(34,197,94,0.12)', border: '2px solid rgba(34,197,94,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem',
            }}>
              ✅
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#fff', marginBottom: 6 }}>{docLabel} verified!</div>
              <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.4)' }}>Your document has been accepted</div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function ProfileScreen({ user, theme, onToggleTheme, onLogout, onLogin, onAdmin, onUserUpdate }) {
  const [uploadModal, setUploadModal] = useState(null)  // null | { docKey, docLabel }
  const [localDocs,   setLocalDocs]   = useState({})

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

  const docs              = { ...(user.documents || {}), ...localDocs }
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

  function handleDocDone(docKey) {
    const merged = { ...(user.documents || {}), ...localDocs, [docKey]: true }
    setLocalDocs(prev => ({ ...prev, [docKey]: true }))
    setUploadModal(null)
    if (onUserUpdate) onUserUpdate({ documents: merged })
  }

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
    <>
      {uploadModal && (
        <DocUploadModal
          docLabel={uploadModal.docLabel}
          docKey={uploadModal.docKey}
          user={user}
          onClose={() => setUploadModal(null)}
          onDone={handleDocDone}
        />
      )}

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

          {/* Required docs (read-only) */}
          {[
            { done: hasNationalId,     label: 'National ID' },
            { done: hasDrivingLicense, label: 'Driving License' },
          ].map(({ done, label }, i) => (
            <div key={label} style={{
              display: 'flex', alignItems: 'center', gap: 10, paddingTop: 8, paddingBottom: 8,
              borderBottom: '1px solid var(--border)',
            }}>
              <span style={{ fontSize: '0.9rem', lineHeight: 1 }}>{done ? '✅' : '○'}</span>
              <span style={{ flex: 1, fontSize: '0.83rem', color: done ? 'var(--text)' : 'var(--text-low)' }}>{label}</span>
              <span style={{ fontSize: '0.68rem', fontWeight: 600, color: 'var(--text-low)', letterSpacing: '0.03em' }}>REQUIRED</span>
            </div>
          ))}

          {/* Optional docs (clickable if not yet uploaded) */}
          {OPTIONAL_DOCS.map((d, i) => {
            const done = !!docs[d.key]
            return (
              <div
                key={d.key}
                onClick={done ? undefined : () => setUploadModal({ docKey: d.key, docLabel: d.label })}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10, paddingTop: 8, paddingBottom: 8,
                  borderBottom: i < OPTIONAL_DOCS.length - 1 ? '1px solid var(--border)' : 'none',
                  cursor: done ? 'default' : 'pointer',
                }}
              >
                <span style={{ fontSize: '0.9rem', lineHeight: 1 }}>{done ? '✅' : '○'}</span>
                <span style={{ flex: 1, fontSize: '0.83rem', color: done ? 'var(--text)' : 'var(--text-low)' }}>{d.label}</span>
                {done
                  ? <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--green)' }}>+5%</span>
                  : <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent)' }}>+ Upload</span>
                }
              </div>
            )
          })}

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
    </>
  )
}
