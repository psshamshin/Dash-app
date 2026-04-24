import { useState } from 'react'
import { collection, addDoc, doc, updateDoc, deleteField, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase.js'

const fmt = n => Number(n).toLocaleString()

function daysLeft(ret) {
  const diff = Math.ceil((new Date(ret) - Date.now()) / 864e5)
  return diff
}

export default function ActiveRentalScreen({ rental, onBack, onContactOwner }) {
  const [showReport,   setShowReport]   = useState(false)
  const [reportText,   setReportText]   = useState('')
  const [reportSent,   setReportSent]   = useState(false)
  const [reportLoading, setReportLoading] = useState(false)
  const [showComplete, setShowComplete] = useState(false)
  const [completing,   setCompleting]   = useState(false)
  const [completed,    setCompleted]    = useState(false)

  if (completed) {
    return (
      <div style={{ minHeight: '100dvh', background: 'var(--bg)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 24px', gap: 20 }}>
        <div style={{ width: 88, height: 88, borderRadius: '50%', background: 'rgba(34,197,94,0.12)', border: '2px solid rgba(34,197,94,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem' }}>
          🎉
        </div>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ marginBottom: 8 }}>Rental completed!</h2>
          <p style={{ fontSize: '0.9rem', marginBottom: 6 }}>
            Thank you for using <strong style={{ color: 'var(--accent)' }}>Dash.</strong>
          </p>
          <p style={{ fontSize: '0.85rem' }}>
            <strong style={{ color: 'var(--text)' }}>฿{fmt(rental.rental)}</strong> has been credited to {rental.ownerName}.
          </p>
          <p style={{ fontSize: '0.82rem', marginTop: 6, color: 'var(--text-low)' }}>
            Deposit ฿{fmt(rental.deposit)} will be refunded shortly.
          </p>
        </div>
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: '16px 20px', width: '100%', maxWidth: 340, display: 'flex', gap: 14, alignItems: 'center' }}>
          <div style={{ width: 46, height: 40, borderRadius: 10, background: rental.carColorBg, overflow: 'hidden', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', flexShrink: 0 }}>
            {rental.carPhoto ? <img src={rental.carPhoto} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }} /> : rental.carEmoji}
          </div>
          <div>
            <div style={{ fontWeight: 700, color: 'var(--text)', fontSize: '0.9rem' }}>{rental.carBrand} {rental.carModel}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-low)' }}>{rental.pickup} → {rental.ret}</div>
          </div>
        </div>
        <button className="btn btn-primary btn-full" style={{ maxWidth: 340 }} onClick={onBack}>
          Back to home
        </button>
      </div>
    )
  }

  const left = daysLeft(rental.ret)
  const isActive   = left >= 0
  const isUpcoming = new Date(rental.pickup) > new Date()

  async function completeRental() {
    setCompleting(true)
    try {
      if (rental.id && !rental.id.startsWith('local_')) {
        await updateDoc(doc(db, 'bookings', rental.id), {
          status: 'completed',
          completedAt: serverTimestamp(),
        })
      }
      if (rental.carId && rental.ownerUid) {
        await updateDoc(doc(db, 'cars', rental.carId), {
          isAvailable: true,
          activeBooking: deleteField(),
        })
      }
      setCompleted(true)
    } catch (e) {
      console.error('Complete rental error:', e)
      setCompleted(true)
    }
    setCompleting(false)
    setShowComplete(false)
  }

  async function submitReport() {
    if (!reportText.trim()) return
    setReportLoading(true)
    try {
      await addDoc(collection(db, 'incidents'), {
        bookingId: rental.id,
        carId: rental.carId,
        carBrand: rental.carBrand,
        carModel: rental.carModel,
        renterUid: rental.renterUid,
        renterName: rental.renterName,
        ownerUid: rental.ownerUid || null,
        description: reportText.trim(),
        createdAt: serverTimestamp(),
      })
    } catch (e) { console.error(e) }
    setReportSent(true)
    setReportLoading(false)
  }

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '16px 16px 12px', background: 'var(--surface)', borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, zIndex: 10 }}>
        <button onClick={onBack} style={{ width: 36, height: 36, borderRadius: 10, border: 'none', background: 'var(--surface-2)', color: 'var(--text)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '1rem', flexShrink: 0 }}>←</button>
        <span style={{ flex: 1, fontSize: '1rem', fontWeight: 700, color: 'var(--text)' }}>My Rental</span>
        <span className={`badge ${isActive && !isUpcoming ? 'badge-green' : 'badge-accent'}`}>
          {isUpcoming ? 'Upcoming' : isActive ? '● Active' : 'Ended'}
        </span>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 'calc(var(--nav-h) + 24px)' }}>
        {/* Car hero */}
        <div style={{ height: 200, background: rental.carColorBg, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
          {rental.carPhoto
            ? <img src={rental.carPhoto} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : <span style={{ fontSize: '7rem' }}>{rental.carEmoji}</span>
          }
          {isActive && !isUpcoming && (
            <div style={{ position: 'absolute', bottom: 12, left: 12, background: 'rgba(34,197,94,0.9)', backdropFilter: 'blur(6px)', borderRadius: 100, padding: '5px 14px', fontSize: '0.78rem', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: 5 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#fff', animation: 'pulse 1.5s infinite' }} />
              Active rental · {left} day{left !== 1 ? 's' : ''} left
            </div>
          )}
        </div>

        <div style={{ padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Car name + specs */}
          <div>
            <h2 style={{ marginBottom: 4 }}>{rental.carBrand} {rental.carModel}</h2>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {rental.carYear && <span className="badge badge-surface">{rental.carYear}</span>}
              {rental.carSeats && <span className="badge badge-surface">💺 {rental.carSeats} seats</span>}
              {rental.carFuel && <span className="badge badge-surface">{rental.carFuel}</span>}
              {rental.carTransmission && <span className="badge badge-surface">{rental.carTransmission}</span>}
            </div>
          </div>

          {/* Dates */}
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: '16px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ flex: 1, textAlign: 'center' }}>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-low)', marginBottom: 4 }}>PICK-UP</div>
              <div style={{ fontWeight: 700, color: 'var(--text)', fontSize: '0.95rem' }}>{rental.pickup}</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--accent)' }}>{rental.days}d</div>
              <div style={{ width: 52, height: 2, background: 'var(--accent)', borderRadius: 1 }} />
            </div>
            <div style={{ flex: 1, textAlign: 'center' }}>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-low)', marginBottom: 4 }}>RETURN</div>
              <div style={{ fontWeight: 700, color: 'var(--text)', fontSize: '0.95rem' }}>{rental.ret}</div>
            </div>
          </div>

          {/* Location */}
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden' }}>
            <div style={{ height: 100, background: 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem', borderBottom: '1px solid var(--border)' }}>🗺️</div>
            <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: '1rem' }}>📍</span>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text)' }}>{rental.carLocation}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-low)' }}>Pick-up location</div>
              </div>
            </div>
          </div>

          {/* Price summary */}
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: '14px 16px' }}>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-low)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>Payment</div>
            {[
              { label: `Rental (${rental.days}d)`, val: rental.rental },
              { label: 'Insurance',                 val: rental.insurance },
              { label: 'Deposit',                   val: rental.deposit },
            ].map(r => (
              <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 8, marginBottom: 8, borderBottom: '1px solid var(--border)' }}>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-low)' }}>{r.label}</span>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text)' }}>฿{fmt(r.val)}</span>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text)' }}>Total</span>
              <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--accent)', letterSpacing: '-0.03em' }}>฿{fmt(rental.total)}</span>
            </div>
          </div>

          {/* Owner */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: '14px 16px' }}>
            <div style={{ width: 42, height: 42, borderRadius: '50%', background: rental.carColorBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: 700, color: rental.carColor, flexShrink: 0 }}>
              {rental.ownerInit}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text)' }}>{rental.ownerName}</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-low)' }}>Car owner</div>
            </div>
            <span className="badge badge-green">Verified</span>
          </div>

          {/* Action buttons */}
          <button
            className="btn btn-primary btn-full"
            style={{ fontSize: '0.92rem', padding: '14px' }}
            onClick={onContactOwner}
          >
            💬 Contact Owner
          </button>

          <button
            onClick={() => setShowReport(true)}
            style={{ width: '100%', padding: '14px', borderRadius: 100, border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.08)', color: '#ef4444', fontFamily: 'inherit', fontSize: '0.92rem', fontWeight: 600, cursor: 'pointer' }}
          >
            ⚠️ Report Incident
          </button>

          {/* Complete rental */}
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: 14 }}>
            <button
              onClick={() => setShowComplete(true)}
              style={{ width: '100%', padding: '14px', borderRadius: 100, border: '1px solid rgba(34,197,94,0.3)', background: 'rgba(34,197,94,0.08)', color: '#22c55e', fontFamily: 'inherit', fontSize: '0.92rem', fontWeight: 700, cursor: 'pointer' }}
            >
              ✅ Complete Rental
            </button>
            <p style={{ textAlign: 'center', fontSize: '0.72rem', color: 'var(--text-low)', marginTop: 8, lineHeight: 1.5 }}>
              Confirm return of the car. Payment will be released to the owner.
            </p>
          </div>
        </div>
      </div>

      {/* Complete rental confirmation */}
      {showComplete && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)', zIndex: 2000, display: 'flex', alignItems: 'flex-end' }}
          onClick={e => { if (e.target === e.currentTarget) setShowComplete(false) }}>
          <div style={{ width: '100%', background: 'var(--surface)', borderRadius: '20px 20px 0 0', padding: '24px 20px 40px', display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: 10 }}>🔑</div>
              <h3 style={{ marginBottom: 6 }}>Return the car?</h3>
              <p style={{ fontSize: '0.85rem' }}>
                This will mark the rental as complete and release <strong style={{ color: 'var(--text)' }}>฿{fmt(rental.rental)}</strong> to {rental.ownerName}.
              </p>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-low)', marginTop: 6 }}>
                Your deposit of ฿{fmt(rental.deposit)} will be refunded.
              </p>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => setShowComplete(false)}
                style={{ flex: 1, padding: '13px', borderRadius: 100, border: '1px solid var(--border)', background: 'var(--surface-2)', color: 'var(--text)', fontFamily: 'inherit', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                onClick={completeRental}
                disabled={completing}
                style={{ flex: 1, padding: '13px', borderRadius: 100, border: 'none', background: completing ? 'rgba(34,197,94,0.5)' : '#22c55e', color: '#fff', fontFamily: 'inherit', fontSize: '0.9rem', fontWeight: 700, cursor: completing ? 'default' : 'pointer' }}
              >
                {completing ? 'Processing…' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Report incident modal */}
      {showReport && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)', zIndex: 2000, display: 'flex', alignItems: 'flex-end' }}
          onClick={e => { if (e.target === e.currentTarget) setShowReport(false) }}>
          <div style={{ width: '100%', background: 'var(--surface)', borderRadius: '20px 20px 0 0', padding: '24px 20px 40px', display: 'flex', flexDirection: 'column', gap: 16 }}>
            {reportSent ? (
              <>
                <div style={{ textAlign: 'center', padding: '16px 0' }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>✅</div>
                  <h3 style={{ marginBottom: 6 }}>Report submitted</h3>
                  <p style={{ fontSize: '0.85rem' }}>We will review your incident and contact you shortly.</p>
                </div>
                <button className="btn btn-secondary btn-full" onClick={() => { setShowReport(false); setReportSent(false); setReportText('') }}>Close</button>
              </>
            ) : (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3>Report Incident</h3>
                  <button onClick={() => setShowReport(false)} style={{ background: 'none', border: 'none', color: 'var(--text-low)', cursor: 'pointer', fontSize: '1.2rem', padding: 4 }}>✕</button>
                </div>
                <p style={{ fontSize: '0.85rem' }}>Describe what happened. We will contact both parties within 24 hours.</p>
                <textarea
                  value={reportText}
                  onChange={e => setReportText(e.target.value)}
                  placeholder="Describe the incident — damage, accident, dispute…"
                  rows={4}
                  style={{ width: '100%', padding: '12px 14px', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 12, color: 'var(--text)', fontFamily: 'inherit', fontSize: '0.88rem', outline: 'none', resize: 'none', lineHeight: 1.5 }}
                />
                <button
                  onClick={submitReport}
                  disabled={!reportText.trim() || reportLoading}
                  style={{ width: '100%', padding: '14px', borderRadius: 100, background: reportText.trim() ? '#ef4444' : 'var(--surface-3)', border: 'none', color: reportText.trim() ? '#fff' : 'var(--text-low)', fontFamily: 'inherit', fontSize: '0.92rem', fontWeight: 700, cursor: reportText.trim() ? 'pointer' : 'default', transition: 'all .2s' }}
                >
                  {reportLoading ? 'Submitting…' : 'Submit Report'}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
