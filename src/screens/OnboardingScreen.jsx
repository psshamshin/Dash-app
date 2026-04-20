import { useState, useRef } from 'react'

const STEPS = ['identity', 'verifying', 'done']

export default function OnboardingScreen({ user, onComplete }) {
  const [step, setStep]       = useState('identity')  // identity | verifying | done
  const [preview, setPreview] = useState(null)
  const [docType, setDocType] = useState('passport')
  const fileRef = useRef(null)

  function handleFile(e) {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => setPreview(ev.target.result)
    reader.readAsDataURL(file)
  }

  function submitDoc() {
    setStep('verifying')
    setTimeout(() => {
      setStep('done')
      const updated = { ...user, verified: true }
      localStorage.setItem('dash_user', JSON.stringify(updated))
      setTimeout(() => onComplete(updated), 1200)
    }, 2200)
  }

  return (
    <div style={{ minHeight: '100dvh', background: '#0a0a0a', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ padding: '20px 20px 0' }}>
        <span style={{ fontSize: '1.3rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.03em' }}>
          Dash<span style={{ color: '#f97316' }}>.</span>
        </span>
      </div>

      <div style={{ flex: 1, padding: '28px 20px 40px', display: 'flex', flexDirection: 'column' }}>
        {/* Progress dots */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 32 }}>
          {['identity','verifying','done'].map((s, i) => (
            <div key={s} style={{
              height: 3, flex: 1, borderRadius: 100,
              background: STEPS.indexOf(step) >= i ? '#f97316' : 'rgba(255,255,255,0.1)',
              transition: 'background .4s',
            }} />
          ))}
        </div>

        {step === 'identity' && (
          <>
            <h1 style={{ fontSize: '1.7rem', marginBottom: 8, lineHeight: 1.2 }}>Verify your identity</h1>
            <p style={{ marginBottom: 28, fontSize: '0.88rem' }}>
              Upload a government-issued ID or passport to unlock full access.
            </p>

            {/* Doc type selector */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
              {[
                { id: 'passport', label: '🛂 Passport' },
                { id: 'id',       label: '🪪 National ID' },
                { id: 'license',  label: '🚗 License' },
              ].map(d => (
                <button
                  key={d.id}
                  onClick={() => setDocType(d.id)}
                  style={{
                    flex: 1, padding: '9px 4px', borderRadius: 100, border: 'none',
                    background: docType === d.id ? 'rgba(249,115,22,0.15)' : 'rgba(255,255,255,0.06)',
                    color: docType === d.id ? '#f97316' : 'rgba(255,255,255,0.4)',
                    fontFamily: 'inherit', fontSize: '0.72rem', fontWeight: 600,
                    cursor: 'pointer', transition: 'all .15s',
                    border: docType === d.id ? '1px solid rgba(249,115,22,0.3)' : '1px solid transparent',
                  }}
                >
                  {d.label}
                </button>
              ))}
            </div>

            {/* Upload zone */}
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
                overflow: 'hidden', marginBottom: 20,
                position: 'relative',
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

            <button
              onClick={() => onComplete({ ...user, verified: false })}
              style={{
                marginTop: 12, width: '100%', padding: '13px', borderRadius: 100, border: 'none',
                background: 'transparent', color: 'rgba(255,255,255,0.25)',
                fontFamily: 'inherit', fontSize: '0.85rem', cursor: 'pointer',
              }}
            >
              Skip for now
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
              <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#fff', marginBottom: 6 }}>Identity verified!</div>
              <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.4)' }}>Welcome to Dash, {user.name.split(' ')[0]}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
