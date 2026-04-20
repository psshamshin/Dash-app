import { useState } from 'react'

export default function AuthScreen({ onAuth, onBack }) {
  const [mode, setMode]         = useState('login')   // login | register
  const [name, setName]         = useState('')
  const [email, setEmail]       = useState('')
  const [phone, setPhone]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)

  function submit(e) {
    e.preventDefault()
    setError('')
    if (!email || !password) { setError('Fill in all fields'); return }
    if (mode === 'register' && !name) { setError('Enter your name'); return }

    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      const existing = JSON.parse(localStorage.getItem('dash_user') || 'null')

      if (mode === 'login') {
        if (!existing || existing.email !== email) {
          setError('Account not found. Sign up first.'); return
        }
        onAuth(existing, false)
      } else {
        if (existing && existing.email === email) {
          setError('Email already registered.'); return
        }
        const user = { name, email, phone, avatar: name.slice(0,2).toUpperCase(), verified: false }
        localStorage.setItem('dash_user', JSON.stringify(user))
        onAuth(user, true)
      }
    }, 700)
  }

  return (
    <div style={{ minHeight: '100dvh', background: '#0a0a0a', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', padding: '16px 16px 8px', gap: 10 }}>
        <button
          onClick={onBack}
          style={{
            width: 36, height: 36, borderRadius: 10, border: 'none',
            background: 'rgba(255,255,255,0.07)', color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', fontSize: '1rem',
          }}
        >←</button>
        <span style={{ fontSize: '1.3rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.03em' }}>
          Dash<span style={{ color: '#f97316' }}>.</span>
        </span>
      </div>

      <div style={{ flex: 1, padding: '24px 20px 40px', display: 'flex', flexDirection: 'column' }}>
        <h1 style={{ fontSize: '1.8rem', marginBottom: 6, lineHeight: 1.15 }}>
          {mode === 'login' ? 'Welcome back' : 'Create account'}
        </h1>
        <p style={{ marginBottom: 28, fontSize: '0.9rem' }}>
          {mode === 'login' ? 'Sign in to continue' : 'Join Dash and start renting'}
        </p>

        {/* Toggle */}
        <div style={{
          display: 'flex', background: 'rgba(255,255,255,0.06)',
          borderRadius: 100, padding: 4, marginBottom: 28,
        }}>
          {['login','register'].map(m => (
            <button key={m} onClick={() => { setMode(m); setError('') }} style={{
              flex: 1, padding: '9px', borderRadius: 100, border: 'none',
              background: mode === m ? '#f97316' : 'transparent',
              color: mode === m ? '#fff' : 'rgba(255,255,255,0.4)',
              fontFamily: 'inherit', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer',
              transition: 'all .2s',
            }}>
              {m === 'login' ? 'Sign in' : 'Sign up'}
            </button>
          ))}
        </div>

        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {mode === 'register' && (
            <Field label="Full name" value={name} onChange={setName} placeholder="Pasha Shamshin" type="text" />
          )}
          <Field label="Email" value={email} onChange={setEmail} placeholder="you@email.com" type="email" />
          {mode === 'register' && (
            <Field label="Phone" value={phone} onChange={setPhone} placeholder="+66 81 234 5678" type="tel" />
          )}
          <Field label="Password" value={password} onChange={setPassword} placeholder="••••••••" type="password" />

          {error && (
            <div style={{
              padding: '10px 14px', borderRadius: 10,
              background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
              color: '#ef4444', fontSize: '0.82rem',
            }}>{error}</div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: 8, width: '100%', padding: '15px', borderRadius: 100,
              border: 'none', background: loading ? 'rgba(249,115,22,0.5)' : '#f97316',
              color: '#fff', fontFamily: 'inherit', fontSize: '0.95rem',
              fontWeight: 700, cursor: loading ? 'default' : 'pointer',
              transition: 'background .2s',
            }}
          >
            {loading ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'}
          </button>
        </form>

        <p style={{ marginTop: 24, textAlign: 'center', fontSize: '0.82rem', color: 'rgba(255,255,255,0.25)' }}>
          By continuing you agree to our Terms & Privacy Policy
        </p>
      </div>
    </div>
  )
}

function Field({ label, value, onChange, placeholder, type }) {
  return (
    <div>
      <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', marginBottom: 6, fontWeight: 500 }}>
        {label}
      </div>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: '100%', padding: '13px 16px',
          background: 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(255,255,255,0.09)',
          borderRadius: 12, color: '#fff',
          fontFamily: 'inherit', fontSize: '0.9rem', outline: 'none',
          transition: 'border-color .2s', boxShadow: 'none',
        }}
        onFocus={e => e.target.style.borderColor = 'rgba(249,115,22,0.6)'}
        onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.09)'}
      />
    </div>
  )
}
