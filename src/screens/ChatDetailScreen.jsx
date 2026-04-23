import { useState, useRef, useEffect } from 'react'
import {
  collection, addDoc, query, orderBy, onSnapshot,
  doc, updateDoc, serverTimestamp,
} from 'firebase/firestore'
import { db } from '../firebase.js'

const fmtTime = (d) => {
  const dt = d?.toDate ? d.toDate() : (d instanceof Date ? d : new Date(d))
  return `${dt.getHours().toString().padStart(2,'0')}:${dt.getMinutes().toString().padStart(2,'0')}`
}
const fmt = (n) => Number(n).toLocaleString()

// ─── Price offer card ─────────────────────────────────────────────────────────
function PriceCard({ msg, isRenter, onAccept, onDecline, onNegotiate }) {
  const [expanded, setExpanded] = useState(false)
  const { breakdown, total, status } = msg
  const isPending  = status === 'pending'
  const isAccepted = status === 'accepted'
  const isDeclined = status === 'declined'
  const borderColor = isAccepted ? 'rgba(34,197,94,0.4)' : isDeclined ? 'rgba(239,68,68,0.3)' : 'rgba(249,115,22,0.25)'

  return (
    <div style={{ background: 'rgba(249,115,22,0.07)', border: `1px solid ${borderColor}`, borderRadius: 20, overflow: 'hidden', maxWidth: 280 }}>
      <div style={{ padding: '14px 16px 12px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ fontSize: '0.68rem', color: 'rgba(249,115,22,0.7)', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>Price Offer</div>
        <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.04em', lineHeight: 1 }}>
          ฿{fmt(total)}<span style={{ fontSize: '0.75rem', fontWeight: 400, color: 'var(--text-low)', marginLeft: 4 }}>/day</span>
        </div>
      </div>

      <button onClick={() => setExpanded(e => !e)} style={{ width: '100%', background: 'transparent', border: 'none', padding: '10px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: expanded ? '1px solid rgba(255,255,255,0.06)' : 'none' }}>
        <span style={{ fontSize: '0.78rem', color: 'var(--text-low)', fontWeight: 500 }}>{expanded ? 'Hide detail' : 'Show detail'}</span>
        <span style={{ fontSize: '0.6rem', color: 'var(--text-low)', transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform .2s', display: 'inline-block' }}>▼</span>
      </button>

      {expanded && (
        <div style={{ padding: '2px 16px 12px' }}>
          {[
            { label: 'Rental fee', val: breakdown?.rental },
            { label: 'Insurance',  val: breakdown?.insurance },
            { label: 'Deposit',    val: breakdown?.deposit },
          ].map(row => (
            <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-low)' }}>{row.label}</span>
              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text)' }}>฿{fmt(row.val)}</span>
            </div>
          ))}
        </div>
      )}

      {isAccepted && (
        <div style={{ padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#22c55e' }} />
          <span style={{ fontSize: '0.78rem', color: '#22c55e', fontWeight: 600 }}>Deal confirmed</span>
        </div>
      )}
      {isDeclined && (
        <div style={{ padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#ef4444' }} />
          <span style={{ fontSize: '0.78rem', color: '#ef4444', fontWeight: 600 }}>Offer declined</span>
        </div>
      )}

      {isPending && isRenter && !msg.me && (
        <div style={{ padding: '12px 12px 14px', display: 'flex', gap: 8 }}>
          <button onClick={onDecline} style={{ flex: 1, padding: '10px', borderRadius: 100, border: 'none', background: 'rgba(239,68,68,0.12)', color: '#ef4444', fontFamily: 'inherit', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer' }}>Decline</button>
          <button onClick={onNegotiate} style={{ flex: 1, padding: '10px', borderRadius: 100, border: 'none', background: 'rgba(249,115,22,0.15)', color: '#f97316', fontFamily: 'inherit', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer' }}>Counter</button>
          <button onClick={onAccept} style={{ flex: 1, padding: '10px', borderRadius: 100, border: 'none', background: '#22c55e', color: '#fff', fontFamily: 'inherit', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer' }}>Accept</button>
        </div>
      )}
      {isPending && msg.me && (
        <div style={{ padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#f97316', animation: 'pulse 1.5s infinite' }} />
          <span style={{ fontSize: '0.75rem', color: 'rgba(249,115,22,0.7)', fontWeight: 500 }}>Waiting for response…</span>
        </div>
      )}
    </div>
  )
}

// ─── Owner price input panel ──────────────────────────────────────────────────
function OwnerPricePanel({ onSend, onCancel }) {
  const [rental,    setRental]    = useState(1500)
  const [insurance, setInsurance] = useState(200)
  const [deposit,   setDeposit]   = useState(100)
  const total = rental + insurance + deposit

  const PRow = ({ label, value, onChange }) => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
      <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', minWidth: 90 }}>{label}</span>
      <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.06)', borderRadius: 100, overflow: 'hidden' }}>
        <button onClick={() => onChange(Math.max(0, value - 100))} style={{ width: 34, height: 34, background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.5)', fontSize: '1.1rem', cursor: 'pointer', fontFamily: 'inherit' }}>−</button>
        <span style={{ minWidth: 72, textAlign: 'center', fontSize: '0.88rem', fontWeight: 600, color: '#fff' }}>฿{fmt(value)}</span>
        <button onClick={() => onChange(value + 100)} style={{ width: 34, height: 34, background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.5)', fontSize: '1.1rem', cursor: 'pointer', fontFamily: 'inherit' }}>+</button>
      </div>
    </div>
  )

  return (
    <div style={{ background: '#161616', borderTop: '1px solid rgba(249,115,22,0.2)', padding: '16px 16px 22px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'rgba(249,115,22,0.9)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Set price offer</span>
        <button onClick={onCancel} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.35)', cursor: 'pointer', fontSize: '0.82rem', fontFamily: 'inherit' }}>Cancel</button>
      </div>
      <PRow label="Rental fee"  value={rental}    onChange={setRental} />
      <PRow label="Insurance"   value={insurance} onChange={setInsurance} />
      <PRow label="Deposit"     value={deposit}   onChange={setDeposit} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0 14px', borderTop: '1px solid rgba(255,255,255,0.06)', marginBottom: 4 }}>
        <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)' }}>Total / day</span>
        <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#f97316', letterSpacing: '-0.03em' }}>฿{fmt(total)}</span>
      </div>
      <button onClick={() => onSend({ rental, insurance, deposit, total })} style={{ width: '100%', padding: '13px', borderRadius: 100, background: '#f97316', border: 'none', color: '#fff', fontFamily: 'inherit', fontSize: '0.9rem', fontWeight: 700, cursor: 'pointer' }}>
        Send offer
      </button>
    </div>
  )
}

// ─── Message row ──────────────────────────────────────────────────────────────
function MessageRow({ msg, isRenter, otherInit, otherColor, colorBg, onAccept, onDecline, onNegotiate }) {
  if (msg.type === 'price_offer') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: msg.me ? 'flex-end' : 'flex-start', marginBottom: 8 }}>
        {!msg.me && (
          <div style={{ width: 24, height: 24, borderRadius: '50%', marginBottom: 4, background: colorBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem', fontWeight: 700, color: otherColor }}>
            {otherInit}
          </div>
        )}
        <PriceCard msg={msg} isRenter={isRenter} onAccept={onAccept} onDecline={onDecline} onNegotiate={onNegotiate} />
        <span style={{ fontSize: '0.6rem', color: 'var(--text-low)', marginTop: 3 }}>{fmtTime(msg.time)}</span>
      </div>
    )
  }
  return (
    <div style={{ marginBottom: 4 }}>
      <div style={{ display: 'flex', flexDirection: msg.me ? 'row-reverse' : 'row', alignItems: 'flex-end', gap: 6 }}>
        {!msg.me && (
          <div style={{ width: 24, height: 24, borderRadius: '50%', flexShrink: 0, background: colorBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem', fontWeight: 700, color: otherColor }}>
            {otherInit}
          </div>
        )}
        <div style={{
          maxWidth: '72%', padding: '9px 13px',
          borderRadius: msg.me ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
          background: msg.me ? '#f97316' : 'var(--surface-2)',
          border: msg.me ? 'none' : '1px solid var(--border)',
          color: msg.me ? '#fff' : 'var(--text)',
          fontSize: '0.85rem', lineHeight: 1.5,
        }}>
          {msg.text}
        </div>
      </div>
      <div style={{ fontSize: '0.6rem', color: 'var(--text-low)', textAlign: msg.me ? 'right' : 'left', marginTop: 3, paddingLeft: msg.me ? 0 : 30 }}>
        {fmtTime(msg.time)}
      </div>
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function ChatDetailScreen({ chat, user, onBack }) {
  const isReal   = !!chat.isReal
  const iAmOwner = isReal && chat.ownerUid === user?.uid
  const isRenter = !iAmOwner

  const otherName  = isReal ? (iAmOwner ? chat.renterName  : chat.ownerName)  : chat.otherName
  const otherInit  = isReal ? (iAmOwner ? chat.renterInit  : chat.ownerInit)  : (chat.otherInit || '?')
  const otherColor = chat.otherColor || '#f97316'
  const carData    = chat.car
  const colorBg    = carData?.colorBg || 'rgba(249,115,22,0.15)'

  const [messages,       setMessages]       = useState([])
  const [showPriceInput, setShowPriceInput] = useState(false)
  const [inputText,      setInputText]      = useState('')
  const bottomRef = useRef(null)
  const inputRef  = useRef(null)

  // ── Real-time messages ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!isReal) return
    const q = query(collection(db, 'chats', chat.id, 'messages'), orderBy('time', 'asc'))
    return onSnapshot(q, snap => {
      setMessages(snap.docs.map(d => ({
        ...d.data(), id: d.id,
        me: d.data().senderUid === user?.uid,
        time: d.data().time || new Date(),
      })))
    }, err => console.error('Messages error:', err))
  }, [chat.id, isReal, user?.uid])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const latestOffer  = [...messages].reverse().find(m => m.type === 'price_offer')
  const displayPrice = latestOffer ? latestOffer.total : chat.currentPrice

  // ── Send message ───────────────────────────────────────────────────────────
  async function sendText(text) {
    if (!text.trim() || !isReal) return
    setInputText('')
    inputRef.current?.blur()
    try {
      await addDoc(collection(db, 'chats', chat.id, 'messages'), {
        type: 'text', text: text.trim(),
        senderUid: user.uid, time: serverTimestamp(),
      })
      await updateDoc(doc(db, 'chats', chat.id), {
        lastMessage: text.trim(), lastMessageTime: serverTimestamp(),
      })
    } catch (e) { console.error('Send error:', e) }
  }

  async function sendPriceOffer({ rental, insurance, deposit, total }) {
    setShowPriceInput(false)
    if (!isReal) return
    try {
      await addDoc(collection(db, 'chats', chat.id, 'messages'), {
        type: 'price_offer', senderUid: user.uid,
        breakdown: { rental, insurance, deposit },
        total, status: 'pending', time: serverTimestamp(),
      })
      await updateDoc(doc(db, 'chats', chat.id), {
        lastMessage: `Price offer: ฿${total.toLocaleString()}/day`,
        lastMessageTime: serverTimestamp(),
        currentPrice: total,
      })
    } catch (e) { console.error('Offer error:', e) }
  }

  async function updateOfferStatus(msgId, status) {
    if (!isReal) return
    try {
      await updateDoc(doc(db, 'chats', chat.id, 'messages', msgId), { status })
    } catch (e) { console.error('Status error:', e) }
  }

  // ── Not a real chat (seed car) ─────────────────────────────────────────────
  if (!isReal) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', position: 'fixed', inset: 0, background: 'var(--bg)', alignItems: 'center', justifyContent: 'center', padding: 32, gap: 16 }}>
        <div style={{ fontSize: '3rem' }}>🔒</div>
        <h2 style={{ textAlign: 'center' }}>Owner not on Dash yet</h2>
        <p style={{ textAlign: 'center', fontSize: '0.88rem' }}>
          This is a demo listing. Only listings posted by registered users support real-time chat.
        </p>
        <button className="btn btn-secondary" onClick={onBack}>Go back</button>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', position: 'fixed', inset: 0, background: 'var(--bg)' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 16px', background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
        <button onClick={onBack} style={{ width: 34, height: 34, borderRadius: 10, border: 'none', background: 'var(--surface-2)', color: 'var(--text)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '0.95rem', flexShrink: 0 }}>←</button>

        <div style={{ width: 34, height: 34, borderRadius: 10, flexShrink: 0, background: colorBg, overflow: 'hidden', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}>
          {carData?.photo
            ? <img src={carData.photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }} />
            : carData?.emoji || '🚗'
          }
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--text)', lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {carData?.brand} {carData?.model}
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-low)' }}>{otherName}</div>
        </div>

        <div style={{ padding: '6px 14px', borderRadius: 100, background: 'var(--accent-dim)', border: '1px solid var(--accent-mid)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <span style={{ fontSize: '0.6rem', color: 'var(--accent)', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', lineHeight: 1.2 }}>Price</span>
          <span style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--accent)', letterSpacing: '-0.02em', lineHeight: 1.2 }}>฿{fmt(displayPrice)}</span>
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 14px', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {messages.length === 0 && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, opacity: 0.5 }}>
            <div style={{ fontSize: '2.5rem' }}>💬</div>
            <div style={{ fontSize: '0.88rem', color: 'var(--text-low)', textAlign: 'center' }}>Say hello to {otherName}!</div>
          </div>
        )}
        {messages.map(msg => (
          <MessageRow
            key={msg.id} msg={msg} isRenter={isRenter}
            otherInit={otherInit} otherColor={otherColor} colorBg={colorBg}
            onAccept={() => updateOfferStatus(msg.id, 'accepted')}
            onDecline={() => updateOfferStatus(msg.id, 'declined')}
            onNegotiate={() => updateOfferStatus(msg.id, 'negotiating')}
          />
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Owner price panel */}
      {showPriceInput && iAmOwner && (
        <OwnerPricePanel onSend={sendPriceOffer} onCancel={() => setShowPriceInput(false)} />
      )}

      {/* Input bar */}
      {!showPriceInput && (
        <div style={{ background: 'var(--surface)', borderTop: '1px solid var(--border)', padding: '10px 12px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input
              ref={inputRef}
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendText(inputText) } }}
              placeholder="Message…"
              style={{ flex: 1, padding: '11px 16px', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 100, color: 'var(--text)', fontFamily: 'inherit', fontSize: '0.88rem', outline: 'none', boxShadow: 'none' }}
              onFocus={e => e.target.style.borderColor = 'rgba(249,115,22,0.4)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
            <button
              onClick={() => sendText(inputText)}
              disabled={!inputText.trim()}
              style={{ width: 38, height: 38, borderRadius: '50%', border: 'none', background: inputText.trim() ? '#f97316' : 'var(--surface-2)', color: inputText.trim() ? '#fff' : 'var(--text-low)', cursor: inputText.trim() ? 'pointer' : 'default', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .15s', flexShrink: 0 }}
            >↑</button>
          </div>

          {iAmOwner && (
            <button onClick={() => setShowPriceInput(true)} style={{ width: '100%', padding: '10px', borderRadius: 100, background: 'var(--accent-dim)', border: '1px solid var(--accent-mid)', color: 'var(--accent)', fontFamily: 'inherit', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              ฿ Send price offer
            </button>
          )}

          {isRenter && (
            <div style={{ display: 'flex', gap: 6, overflowX: 'auto' }}>
              {[
                { label: '✅ Confirm deal', text: 'I accept the deal. Let us confirm!' },
                { label: 'Available?',     text: 'Is the car available for my dates?' },
                { label: '−฿100',          text: `Could we do ฿${fmt(Math.max(200, displayPrice - 100))}/day?` },
                { label: '−฿200',          text: `Could we do ฿${fmt(Math.max(200, displayPrice - 200))}/day?` },
                { label: '−10%',           text: `Could we do ฿${fmt(Math.round(displayPrice * 0.9 / 100) * 100)}/day?` },
              ].map(qr => (
                <button key={qr.label} onClick={() => sendText(qr.text)} style={{ padding: '7px 13px', borderRadius: 100, border: '1px solid var(--accent-mid)', background: 'var(--accent-dim)', color: 'var(--accent)', fontFamily: 'inherit', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0 }}>
                  {qr.label}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
