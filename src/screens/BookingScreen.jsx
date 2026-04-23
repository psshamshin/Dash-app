import { useState } from 'react'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase.js'

const fmt = n => Number(n).toLocaleString()

export default function BookingScreen({ car, user, onBack, onDone }) {
  const todayStr = new Date().toISOString().split('T')[0]
  const plus3Str = new Date(Date.now() + 3 * 864e5).toISOString().split('T')[0]

  const [pickup,    setPickup]    = useState(todayStr)
  const [ret,       setRet]       = useState(plus3Str)
  const [loading,   setLoading]   = useState(false)
  const [confirmed, setConfirmed] = useState(false)

  const days      = Math.max(1, Math.ceil((new Date(ret) - new Date(pickup)) / 864e5))
  const rental    = car.price * days
  const insurance = 200 * days
  const deposit   = 2000
  const total     = rental + insurance + deposit

  async function handleConfirm() {
    setLoading(true)
    try {
      if (user?.uid && car.ownerUid) {
        await addDoc(collection(db, 'bookings'), {
          carId: car.id,
          carBrand: car.brand,
          carModel: car.model,
          carPhoto: car.photo || null,
          renterUid: user.uid,
          renterName: user.name,
          ownerUid: car.ownerUid || null,
          ownerName: car.owner,
          pickup, ret, days,
          rental, insurance, deposit, total,
          status: 'pending',
          createdAt: serverTimestamp(),
        })
      }
      setConfirmed(true)
    } catch (e) {
      console.error('Booking error:', e)
      setConfirmed(true)
    }
    setLoading(false)
  }

  if (confirmed) {
    return (
      <div style={{ minHeight: '100dvh', background: 'var(--bg)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 24px', gap: 20 }}>
        <div style={{ width: 88, height: 88, borderRadius: '50%', background: 'rgba(34,197,94,0.12)', border: '2px solid rgba(34,197,94,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem' }}>
          ✅
        </div>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ marginBottom: 8 }}>Booking confirmed!</h2>
          <p style={{ fontSize: '0.9rem' }}>
            Your request for <strong style={{ color: 'var(--text)' }}>{car.brand} {car.model}</strong> has been sent to the owner.
          </p>
          <p style={{ fontSize: '0.82rem', marginTop: 6 }}>
            {pickup} → {ret} · {days} day{days !== 1 ? 's' : ''}
          </p>
        </div>
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: '16px 20px', width: '100%', maxWidth: 340 }}>
          {[
            { label: 'Rental fee',  val: `฿${fmt(rental)}`    },
            { label: 'Insurance',   val: `฿${fmt(insurance)}`  },
            { label: 'Deposit',     val: `฿${fmt(deposit)}`    },
            { label: 'Total',       val: `฿${fmt(total)}`,    accent: true },
          ].map(row => (
            <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: row.label !== 'Total' ? '1px solid var(--border)' : 'none' }}>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-low)' }}>{row.label}</span>
              <span style={{ fontSize: '0.88rem', fontWeight: row.accent ? 800 : 600, color: row.accent ? 'var(--accent)' : 'var(--text)' }}>{row.val}</span>
            </div>
          ))}
        </div>
        <button className="btn btn-primary btn-full" style={{ maxWidth: 340 }} onClick={onDone}>
          Back to home
        </button>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '16px 16px 12px', background: 'var(--surface)', borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, zIndex: 10 }}>
        <button onClick={onBack} style={{ width: 36, height: 36, borderRadius: 10, border: 'none', background: 'var(--surface-2)', color: 'var(--text)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '1rem', flexShrink: 0 }}>←</button>
        <span style={{ flex: 1, fontSize: '1rem', fontWeight: 700, color: 'var(--text)' }}>Confirm Booking</span>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 16px 40px', display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* Car card */}
        <div style={{ display: 'flex', gap: 14, alignItems: 'center', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: '14px' }}>
          <div style={{ width: 72, height: 60, borderRadius: 12, background: car.colorBg, overflow: 'hidden', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', flexShrink: 0 }}>
            {car.photo
              ? <img src={car.photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }} />
              : car.emoji
            }
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text)', marginBottom: 2 }}>{car.brand} {car.model}</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-low)', marginBottom: 4 }}>{car.year} · {car.location}</div>
            <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--accent)' }}>฿{fmt(car.price)} / day</div>
          </div>
        </div>

        {/* Dates */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden' }}>
          <div style={{ padding: '12px 16px 0', fontSize: '0.74rem', color: 'var(--text-low)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Rental dates</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 }}>
            <div style={{ padding: '10px 16px 14px', borderRight: '1px solid var(--border)' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-low)', marginBottom: 6 }}>📅 Pick-up</div>
              <input
                type="date"
                value={pickup}
                min={todayStr}
                onChange={e => setPickup(e.target.value)}
                style={{ padding: 0, background: 'transparent', border: 'none', color: 'var(--text)', fontFamily: 'inherit', fontSize: '0.9rem', fontWeight: 700, outline: 'none', width: '100%' }}
              />
            </div>
            <div style={{ padding: '10px 16px 14px' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-low)', marginBottom: 6 }}>📅 Return</div>
              <input
                type="date"
                value={ret}
                min={pickup || todayStr}
                onChange={e => setRet(e.target.value)}
                style={{ padding: 0, background: 'transparent', border: 'none', color: 'var(--text)', fontFamily: 'inherit', fontSize: '0.9rem', fontWeight: 700, outline: 'none', width: '100%' }}
              />
            </div>
          </div>
          <div style={{ padding: '10px 16px 14px', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-low)' }}>Duration:</span>
            <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--accent)' }}>{days} day{days !== 1 ? 's' : ''}</span>
          </div>
        </div>

        {/* Price breakdown */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden' }}>
          <div style={{ padding: '14px 16px 0', fontSize: '0.74rem', color: 'var(--text-low)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Price breakdown</div>
          {[
            { label: `Rental (฿${fmt(car.price)} × ${days}d)`, val: rental },
            { label: `Insurance (฿200 × ${days}d)`,             val: insurance },
            { label: 'Refundable deposit',                       val: deposit },
          ].map(row => (
            <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 16px', borderTop: '1px solid var(--border)' }}>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-low)' }}>{row.label}</span>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text)' }}>฿{fmt(row.val)}</span>
            </div>
          ))}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', borderTop: '1px solid var(--border)', background: 'var(--accent-dim)' }}>
            <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text)' }}>Total</span>
            <span style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--accent)', letterSpacing: '-0.03em' }}>฿{fmt(total)}</span>
          </div>
        </div>

        {/* Owner */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: '14px 16px' }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', background: car.colorBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.82rem', fontWeight: 700, color: car.color, flexShrink: 0 }}>
            {car.ownerInit}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text)' }}>{car.owner}</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-low)' }}>Car owner · 📍 {car.location}</div>
          </div>
          <span className="badge badge-green">Verified</span>
        </div>

        {/* Confirm button */}
        <button
          onClick={handleConfirm}
          disabled={loading}
          className="btn btn-primary btn-full"
          style={{ fontSize: '0.95rem', padding: '16px', opacity: loading ? 0.6 : 1 }}
        >
          {loading ? 'Confirming…' : `Confirm Booking · ฿${fmt(total)}`}
        </button>

        <p style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-low)', lineHeight: 1.5 }}>
          By confirming you agree to the rental terms. The deposit is fully refundable on return.
        </p>
      </div>
    </div>
  )
}
