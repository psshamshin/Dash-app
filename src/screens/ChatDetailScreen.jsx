import { useState, useRef, useEffect } from 'react'

const fmtTime = (d) => {
  const dt = d instanceof Date ? d : new Date(d)
  return `${dt.getHours().toString().padStart(2,'0')}:${dt.getMinutes().toString().padStart(2,'0')}`
}

const fmt = (n) => Number(n).toLocaleString()

// ─── Price offer card ────────────────────────────────────────────────────────
function PriceCard({ msg, role, onAccept, onDecline, onNegotiate }) {
  const [expanded, setExpanded] = useState(false)
  const { breakdown, total, status } = msg
  const isPending = status === 'pending'
  const isAccepted = status === 'accepted'
  const isDeclined = status === 'declined'

  return (
    <div style={{
      background: 'rgba(249,115,22,0.07)',
      border: `1px solid ${isAccepted ? 'rgba(34,197,94,0.4)' : isDeclined ? 'rgba(239,68,68,0.3)' : 'rgba(249,115,22,0.25)'}`,
      borderRadius: 20,
      overflow: 'hidden',
      maxWidth: 280,
      alignSelf: msg.me ? 'flex-end' : 'flex-start',
    }}>
      {/* Header */}
      <div style={{
        padding: '14px 16px 12px',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        <div style={{ fontSize: '0.7rem', color: 'rgba(249,115,22,0.7)', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>
          Rental Price
        </div>
        <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.04em', lineHeight: 1 }}>
          ฿{fmt(total)}
          <span style={{ fontSize: '0.75rem', fontWeight: 400, color: 'rgba(255,255,255,0.4)', marginLeft: 4 }}>/day</span>
        </div>
      </div>

      {/* Show detail toggle */}
      <button
        onClick={() => setExpanded(e => !e)}
        style={{
          width: '100%', background: 'transparent', border: 'none',
          padding: '10px 16px', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          borderBottom: expanded ? '1px solid rgba(255,255,255,0.06)' : 'none',
        }}
      >
        <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)', fontWeight: 500 }}>
          {expanded ? 'Hide detail' : 'Show detail'}
        </span>
        <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.35)', transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }}>▼</span>
      </button>

      {/* Breakdown */}
      {expanded && (
        <div style={{ padding: '2px 16px 12px' }}>
          {[
            { label: 'Rental fee',     val: breakdown.rental },
            { label: 'Insurance',      val: breakdown.insurance },
            { label: 'Deposit',        val: breakdown.deposit },
          ].map(row => (
            <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
              <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.45)' }}>{row.label}</span>
              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'rgba(255,255,255,0.75)' }}>฿{fmt(row.val)}</span>
            </div>
          ))}
        </div>
      )}

      {/* Status badge or action buttons */}
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

      {/* Renter action buttons */}
      {isPending && role === 'renter' && !msg.me && (
        <div style={{ padding: '12px 12px 14px', display: 'flex', gap: 8 }}>
          <button
            onClick={onDecline}
            style={{
              flex: 1, padding: '10px', borderRadius: 100, border: 'none',
              background: 'rgba(239,68,68,0.12)', color: '#ef4444',
              fontFamily: 'inherit', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer',
            }}>
            Decline
          </button>
          <button
            onClick={onNegotiate}
            style={{
              flex: 1, padding: '10px', borderRadius: 100, border: 'none',
              background: 'rgba(249,115,22,0.15)', color: '#f97316',
              fontFamily: 'inherit', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer',
            }}>
            Negotiate
          </button>
          <button
            onClick={onAccept}
            style={{
              flex: 1, padding: '10px', borderRadius: 100, border: 'none',
              background: '#22c55e', color: '#fff',
              fontFamily: 'inherit', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer',
            }}>
            Accept
          </button>
        </div>
      )}

      {/* Owner: waiting indicator */}
      {isPending && role === 'owner' && msg.me && (
        <div style={{ padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#f97316', animation: 'pulse 1.5s infinite' }} />
          <span style={{ fontSize: '0.75rem', color: 'rgba(249,115,22,0.7)', fontWeight: 500 }}>Waiting for response…</span>
        </div>
      )}
    </div>
  )
}

// ─── Owner price input panel ─────────────────────────────────────────────────
function OwnerPricePanel({ onSend, onCancel }) {
  const [rental,    setRental]    = useState(1500)
  const [insurance, setInsurance] = useState(200)
  const [deposit,   setDeposit]   = useState(100)

  const total = rental + insurance + deposit

  const Row = ({ label, value, onChange }) => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
      <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', minWidth: 90 }}>{label}</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 0, background: 'rgba(255,255,255,0.06)', borderRadius: 100, overflow: 'hidden' }}>
        <button
          onClick={() => onChange(Math.max(0, value - 100))}
          style={{ width: 34, height: 34, background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.5)', fontSize: '1.1rem', cursor: 'pointer', fontFamily: 'inherit' }}>
          −
        </button>
        <span style={{ minWidth: 72, textAlign: 'center', fontSize: '0.88rem', fontWeight: 600, color: '#fff' }}>
          ฿{fmt(value)}
        </span>
        <button
          onClick={() => onChange(value + 100)}
          style={{ width: 34, height: 34, background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.5)', fontSize: '1.1rem', cursor: 'pointer', fontFamily: 'inherit' }}>
          +
        </button>
      </div>
    </div>
  )

  return (
    <div style={{
      background: '#161616',
      borderTop: '1px solid rgba(249,115,22,0.2)',
      padding: '16px 16px 22px',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'rgba(249,115,22,0.9)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
          Set price offer
        </span>
        <button onClick={onCancel} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.35)', cursor: 'pointer', fontSize: '0.82rem', fontFamily: 'inherit' }}>
          Cancel
        </button>
      </div>

      <Row label="Rental fee"  value={rental}    onChange={setRental} />
      <Row label="Insurance"   value={insurance} onChange={setInsurance} />
      <Row label="Deposit"     value={deposit}   onChange={setDeposit} />

      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '12px 0 14px',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        marginBottom: 4,
      }}>
        <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)' }}>Total / day</span>
        <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#f97316', letterSpacing: '-0.03em' }}>
          ฿{fmt(total)}
        </span>
      </div>

      <button
        onClick={() => onSend({ rental, insurance, deposit, total })}
        style={{
          width: '100%', padding: '13px', borderRadius: 100,
          background: '#f97316', border: 'none', color: '#fff',
          fontFamily: 'inherit', fontSize: '0.9rem', fontWeight: 700, cursor: 'pointer',
        }}>
        Send offer
      </button>
    </div>
  )
}

// ─── Main screen ─────────────────────────────────────────────────────────────
export default function ChatDetailScreen({ chat, role = 'renter', onBack }) {
  const [messages, setMessages] = useState(chat.messages)
  const [showPriceInput, setShowPriceInput] = useState(false)
  const [inputText, setInputText] = useState('')
  const bottomRef = useRef(null)

  const negotiationEnabled = chat.negotiationEnabled !== false

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Resolve latest price from the most recent price_offer
  const latestOffer = [...messages].reverse().find(m => m.type === 'price_offer')
  const displayPrice = latestOffer ? latestOffer.total : chat.currentPrice

  function sendText(text) {
    if (!text.trim()) return
    setMessages(prev => [...prev, {
      id: Date.now().toString(), type: 'text', text, me: true, time: new Date(),
    }])
    setInputText('')
  }

  function sendPriceOffer({ rental, insurance, deposit, total }) {
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      type: 'price_offer',
      me: true,
      time: new Date(),
      breakdown: { rental, insurance, deposit },
      total,
      status: 'pending',
    }])
    setShowPriceInput(false)
  }

  function updateOfferStatus(msgId, status) {
    setMessages(prev => prev.map(m =>
      m.id === msgId ? { ...m, status } : m
    ))
  }

  function handleAccept(msgId) {
    updateOfferStatus(msgId, 'accepted')
    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: Date.now().toString(), type: 'text',
        text: '✅ Great! Deal confirmed. I\'ll prepare the car for you.',
        me: false, time: new Date(),
      }])
    }, 600)
  }

  function handleDecline(msgId) {
    updateOfferStatus(msgId, 'declined')
    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: Date.now().toString(), type: 'text',
        text: 'No worries — feel free to send a counter offer anytime.',
        me: false, time: new Date(),
      }])
    }, 600)
  }

  function handleNegotiate(msgId) {
    updateOfferStatus(msgId, 'negotiating')
    setMessages(prev => [...prev, {
      id: Date.now().toString(), type: 'text',
      text: "I'd like to negotiate the price.",
      me: true, time: new Date(),
    }])
    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: Date.now().toString(), type: 'text',
        text: "Sure! What price works for you? Tell me what you have in mind.",
        me: false, time: new Date(),
      }])
    }, 900)
  }

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', height: '100dvh',
      background: '#0D0D0D',
    }}>
      {/* App bar */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10, padding: '14px 16px',
        background: '#111', borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        <button
          onClick={onBack}
          style={{
            width: 34, height: 34, borderRadius: 10, border: 'none',
            background: 'rgba(255,255,255,0.07)', color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', fontSize: '0.95rem', flexShrink: 0,
          }}>
          ←
        </button>

        <div style={{
          width: 34, height: 34, borderRadius: 10, flexShrink: 0,
          background: chat.car.colorBg,
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem',
        }}>
          {chat.car.emoji}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 600, fontSize: '0.88rem', color: '#fff', lineHeight: 1.2 }}>
            {chat.car.brand} {chat.car.model}
          </div>
          <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)' }}>{chat.otherName}</div>
        </div>

        {/* Live price pill — like IG call banner */}
        <div style={{
          padding: '6px 14px', borderRadius: 100,
          background: 'rgba(249,115,22,0.12)',
          border: '1px solid rgba(249,115,22,0.25)',
          display: 'flex', flexDirection: 'column', alignItems: 'center',
        }}>
          <span style={{ fontSize: '0.62rem', color: 'rgba(249,115,22,0.6)', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', lineHeight: 1.2 }}>
            Rental Price
          </span>
          <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#f97316', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
            ฿{fmt(displayPrice)}
          </span>
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 14px', display: 'flex', flexDirection: 'column', gap: 4 }}>
        {messages.map(msg => (
          <MessageRow
            key={msg.id}
            msg={msg}
            role={role}
            chat={chat}
            onAccept={() => handleAccept(msg.id)}
            onDecline={() => handleDecline(msg.id)}
            onNegotiate={() => handleNegotiate(msg.id)}
          />
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Owner: price input panel */}
      {showPriceInput && role === 'owner' && (
        <OwnerPricePanel onSend={sendPriceOffer} onCancel={() => setShowPriceInput(false)} />
      )}

      {/* Bottom input bar */}
      {!showPriceInput && (
        <div style={{
          background: '#111',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          padding: '10px 12px 16px',
          display: 'flex', flexDirection: 'column', gap: 8,
        }}>
          {/* Text row */}
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendText(inputText)}
              placeholder="Message…"
              style={{
                flex: 1, padding: '11px 16px',
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.09)',
                borderRadius: 100, color: '#fff',
                fontFamily: 'inherit', fontSize: '0.88rem', outline: 'none',
                boxShadow: 'none',
              }}
            />
            <button
              onClick={() => sendText(inputText)}
              disabled={!inputText.trim()}
              style={{
                width: 38, height: 38, borderRadius: '50%', border: 'none',
                background: inputText.trim() ? '#f97316' : 'rgba(255,255,255,0.07)',
                color: inputText.trim() ? '#fff' : 'rgba(255,255,255,0.3)',
                cursor: inputText.trim() ? 'pointer' : 'default',
                fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all .15s', flexShrink: 0,
              }}>
              ↑
            </button>
          </div>

          {/* Owner: send price offer button */}
          {role === 'owner' && (
            <button
              onClick={() => setShowPriceInput(true)}
              style={{
                width: '100%', padding: '10px', borderRadius: 100,
                background: 'rgba(249,115,22,0.1)',
                border: '1px solid rgba(249,115,22,0.25)',
                color: '#f97316', fontFamily: 'inherit',
                fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              }}>
              ฿ Send price offer
            </button>
          )}

          {/* Renter: quick negotiate buttons */}
          {role === 'renter' && negotiationEnabled && (
            <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 2 }}>
              {[
                { label: '−฿100', delta: -100, color: '#f97316' },
                { label: '−฿200', delta: -200, color: '#f97316' },
                { label: '−10%',  pct: -0.1,   color: '#f97316' },
              ].map(qr => (
                <button
                  key={qr.label}
                  onClick={() => {
                    const delta = qr.delta ?? Math.round(displayPrice * qr.pct / 100) * 100
                    sendText(`Could we do ฿${fmt(Math.max(200, displayPrice + delta))}/day instead?`)
                  }}
                  style={{
                    padding: '7px 14px', borderRadius: 100, border: '1px solid rgba(249,115,22,0.2)',
                    background: 'rgba(249,115,22,0.08)', color: '#f97316',
                    fontFamily: 'inherit', fontSize: '0.78rem', fontWeight: 600,
                    cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0,
                  }}>
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

function MessageRow({ msg, role, chat, onAccept, onDecline, onNegotiate }) {
  if (msg.type === 'price_offer') {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: msg.me ? 'flex-end' : 'flex-start',
        marginBottom: 8,
      }}>
        {!msg.me && (
          <div style={{
            width: 24, height: 24, borderRadius: '50%', marginBottom: 4,
            background: chat.car.colorBg, flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.65rem', fontWeight: 700, color: chat.otherColor,
          }}>
            {chat.otherInit}
          </div>
        )}
        <PriceCard
          msg={msg}
          role={role}
          onAccept={onAccept}
          onDecline={onDecline}
          onNegotiate={onNegotiate}
        />
        <span style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.2)', marginTop: 3 }}>
          {fmtTime(msg.time)}
        </span>
      </div>
    )
  }

  return (
    <div style={{ marginBottom: 4 }}>
      <div style={{
        display: 'flex',
        flexDirection: msg.me ? 'row-reverse' : 'row',
        alignItems: 'flex-end', gap: 6,
      }}>
        {!msg.me && (
          <div style={{
            width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
            background: chat.car.colorBg,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.6rem', fontWeight: 700, color: chat.otherColor,
          }}>
            {chat.otherInit}
          </div>
        )}
        <div style={{
          maxWidth: '72%',
          padding: '9px 13px',
          borderRadius: msg.me ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
          background: msg.me ? '#f97316' : 'rgba(255,255,255,0.08)',
          color: msg.me ? '#fff' : 'rgba(255,255,255,0.88)',
          fontSize: '0.85rem', lineHeight: 1.5,
        }}>
          {msg.text}
        </div>
      </div>
      <div style={{
        fontSize: '0.6rem', color: 'rgba(255,255,255,0.2)',
        textAlign: msg.me ? 'right' : 'left',
        marginTop: 3, paddingLeft: msg.me ? 0 : 30,
      }}>
        {fmtTime(msg.time)}
      </div>
    </div>
  )
}
