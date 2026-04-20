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

// ─── Auto-reply logic (for seed/demo cars only) ───────────────────────────────
function getAutoReply(text, role, currentPrice) {
  const t = text.toLowerCase()
  if (role === 'renter') {
    if (t.includes('hello') || t.includes('hi') || t.includes('привет'))
      return "Hi! The car is available. When do you need it?"
    if (t.includes('availab') || t.includes('free') || t.includes('date'))
      return "Yes, it is available for those dates! Shall I send you a price offer?"
    if (t.includes('price') || t.includes('cost') || t.includes('฿') || t.includes('how much'))
      return `Current price is ฿${fmt(currentPrice)}/day. I can send a formal offer with full breakdown.`
    if (t.includes('lower') || t.includes('cheaper') || t.includes('discount') || t.includes('less') || t.includes('reduce'))
      return `I can go down to ฿${fmt(Math.round(currentPrice * 0.9 / 100) * 100)}/day. That is my best offer.`
    if (t.includes('accept') || t.includes('deal') || t.includes('ok') || t.includes('agree') || t.includes('sure'))
      return "Deal confirmed! I will send pick-up details shortly."
    if (t.includes('cancel') || t.includes('no') || t.includes('decline'))
      return "No worries! Let me know if you change your mind."
    if (t.includes('insurance') || t.includes('deposit'))
      return "Insurance: ฿200/day, deposit: ฿2,000 (refundable). All included in the offer card."
    if (t.includes('pick') || t.includes('location') || t.includes('where') || t.includes('meet'))
      return "Pick-up at the location shown on the map. I can also arrange delivery for +฿200."
    if (t.includes('thank'))
      return "You are welcome! Looking forward to it 🚗"
    return "Got it! Is there anything else you would like to know?"
  } else {
    if (t.includes('hello') || t.includes('hi'))
      return "Hi! I am interested in renting. What is your best price?"
    if (t.includes('available') || t.includes('free'))
      return "Great, those are exactly my dates. Can you send me a price offer?"
    if (t.includes('offer') || t.includes('price') || t.includes('฿'))
      return "Let me check the breakdown. Can you send the offer card?"
    if (t.includes('confirm') || t.includes('deal') || t.includes('confirmed'))
      return "Perfect, see you then!"
    if (t.includes('delivery') || t.includes('pick'))
      return "I will come to the location. What time works?"
    return "Sounds good. I will get back to you shortly!"
  }
}

// ─── Typing indicator ─────────────────────────────────────────────────────────
function TypingIndicator({ otherInit, colorBg, otherColor }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, marginBottom: 8 }}>
      <div style={{ width: 24, height: 24, borderRadius: '50%', flexShrink: 0, background: colorBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem', fontWeight: 700, color: otherColor }}>
        {otherInit}
      </div>
      <div style={{ padding: '10px 14px', background: 'rgba(255,255,255,0.08)', borderRadius: '16px 16px 16px 4px', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', gap: 4, alignItems: 'center' }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: 'rgba(255,255,255,0.4)', animation: `typingDot 1.2s ${i * 0.2}s ease-in-out infinite` }} />
        ))}
      </div>
    </div>
  )
}

// ─── Price offer card ─────────────────────────────────────────────────────────
function PriceCard({ msg, role, onAccept, onDecline, onNegotiate }) {
  const [expanded, setExpanded] = useState(false)
  const { breakdown, total, status } = msg
  const isPending  = status === 'pending'
  const isAccepted = status === 'accepted'
  const isDeclined = status === 'declined'
  const borderColor = isAccepted ? 'rgba(34,197,94,0.4)' : isDeclined ? 'rgba(239,68,68,0.3)' : 'rgba(249,115,22,0.25)'

  return (
    <div style={{ background: 'rgba(249,115,22,0.07)', border: `1px solid ${borderColor}`, borderRadius: 20, overflow: 'hidden', maxWidth: 280 }}>
      <div style={{ padding: '14px 16px 12px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ fontSize: '0.68rem', color: 'rgba(249,115,22,0.7)', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>Rental Price</div>
        <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.04em', lineHeight: 1 }}>
          ฿{fmt(total)}<span style={{ fontSize: '0.75rem', fontWeight: 400, color: 'rgba(255,255,255,0.4)', marginLeft: 4 }}>/day</span>
        </div>
      </div>
      <button onClick={() => setExpanded(e => !e)} style={{ width: '100%', background: 'transparent', border: 'none', padding: '10px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: expanded ? '1px solid rgba(255,255,255,0.06)' : 'none' }}>
        <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.45)', fontWeight: 500 }}>{expanded ? 'Hide detail' : 'Show detail'}</span>
        <span style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.3)', transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform .2s', display: 'inline-block' }}>▼</span>
      </button>
      {expanded && (
        <div style={{ padding: '2px 16px 12px' }}>
          {[{ label: 'Rental fee', val: breakdown?.rental }, { label: 'Insurance', val: breakdown?.insurance }, { label: 'Deposit', val: breakdown?.deposit }].map(row => (
            <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
              <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)' }}>{row.label}</span>
              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'rgba(255,255,255,0.75)' }}>฿{fmt(row.val)}</span>
            </div>
          ))}
        </div>
      )}
      {isAccepted && <div style={{ padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 6 }}><div style={{ width: 7, height: 7, borderRadius: '50%', background: '#22c55e' }} /><span style={{ fontSize: '0.78rem', color: '#22c55e', fontWeight: 600 }}>Deal confirmed</span></div>}
      {isDeclined && <div style={{ padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 6 }}><div style={{ width: 7, height: 7, borderRadius: '50%', background: '#ef4444' }} /><span style={{ fontSize: '0.78rem', color: '#ef4444', fontWeight: 600 }}>Offer declined</span></div>}
      {isPending && role === 'renter' && !msg.me && (
        <div style={{ padding: '12px 12px 14px', display: 'flex', gap: 8 }}>
          <button onClick={onDecline} style={{ flex: 1, padding: '10px', borderRadius: 100, border: 'none', background: 'rgba(239,68,68,0.12)', color: '#ef4444', fontFamily: 'inherit', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer' }}>Decline</button>
          <button onClick={onNegotiate} style={{ flex: 1, padding: '10px', borderRadius: 100, border: 'none', background: 'rgba(249,115,22,0.15)', color: '#f97316', fontFamily: 'inherit', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer' }}>Negotiate</button>
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
function MessageRow({ msg, role, otherInit, otherColor, colorBg, onAccept, onDecline, onNegotiate }) {
  if (msg.type === 'price_offer') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: msg.me ? 'flex-end' : 'flex-start', marginBottom: 8 }}>
        {!msg.me && (
          <div style={{ width: 24, height: 24, borderRadius: '50%', marginBottom: 4, background: colorBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem', fontWeight: 700, color: otherColor }}>
            {otherInit}
          </div>
        )}
        <PriceCard msg={msg} role={role} onAccept={onAccept} onDecline={onDecline} onNegotiate={onNegotiate} />
        <span style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.2)', marginTop: 3 }}>{fmtTime(msg.time)}</span>
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
          background: msg.me ? '#f97316' : 'rgba(255,255,255,0.08)',
          border: msg.me ? 'none' : '1px solid rgba(255,255,255,0.06)',
          color: msg.me ? '#fff' : 'rgba(255,255,255,0.88)',
          fontSize: '0.85rem', lineHeight: 1.5,
        }}>
          {msg.text}
        </div>
      </div>
      <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.2)', textAlign: msg.me ? 'right' : 'left', marginTop: 3, paddingLeft: msg.me ? 0 : 30 }}>
        {fmtTime(msg.time)}
      </div>
    </div>
  )
}

// ─── Main screen ──────────────────────────────────────────────────────────────
export default function ChatDetailScreen({ chat, user, role = 'renter', onBack }) {
  const isReal = !!chat.isReal
  const iAmOwner = isReal && chat.ownerUid === user?.uid

  // Derive "other person" info
  const otherName  = isReal ? (iAmOwner ? chat.renterName  : chat.ownerName)  : chat.otherName
  const otherInit  = isReal ? (iAmOwner ? chat.renterInit  : chat.ownerInit)  : chat.otherInit
  const otherColor = chat.otherColor || '#f97316'
  const carData    = isReal ? chat.car : chat.car
  const colorBg    = carData?.colorBg || 'rgba(249,115,22,0.15)'

  const [messages,       setMessages]       = useState(chat.messages || [])
  const [showPriceInput, setShowPriceInput] = useState(false)
  const [inputText,      setInputText]      = useState('')
  const [isTyping,       setIsTyping]       = useState(false)
  const bottomRef = useRef(null)
  const inputRef  = useRef(null)

  // ── Real-time listener for Firestore chats ─────────────────────────────────
  useEffect(() => {
    if (!isReal) return
    const msgsRef = collection(db, 'chats', chat.id, 'messages')
    const q = query(msgsRef, orderBy('time', 'asc'))
    return onSnapshot(q, snap => {
      setMessages(snap.docs.map(d => ({
        ...d.data(),
        id: d.id,
        me: d.data().senderUid === user?.uid,
        time: d.data().time || new Date(),
      })))
    }, err => console.error('Messages load error:', err))
  }, [chat.id, isReal, user?.uid])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  const latestOffer  = [...messages].reverse().find(m => m.type === 'price_offer')
  const displayPrice = latestOffer ? latestOffer.total : chat.currentPrice

  // ── Send helpers ───────────────────────────────────────────────────────────
  async function sendText(text) {
    if (!text.trim()) return
    setInputText('')
    inputRef.current?.focus()

    if (isReal) {
      try {
        await addDoc(collection(db, 'chats', chat.id, 'messages'), {
          type: 'text',
          text: text.trim(),
          senderUid: user.uid,
          time: serverTimestamp(),
        })
        await updateDoc(doc(db, 'chats', chat.id), {
          lastMessage: text.trim(),
          lastMessageTime: serverTimestamp(),
        })
      } catch (e) { console.error('Send error:', e) }
    } else {
      const msg = { id: Date.now().toString(), type: 'text', text: text.trim(), me: true, time: new Date() }
      setMessages(prev => [...prev, msg])
      const reply = getAutoReply(text, role, displayPrice)
      simulateReply(reply, 900 + Math.random() * 600)
    }
  }

  function simulateReply(replyText, delay = 800) {
    setTimeout(() => setIsTyping(true), 300)
    setTimeout(() => {
      setIsTyping(false)
      setMessages(prev => [...prev, { id: Date.now().toString(), type: 'text', text: replyText, me: false, time: new Date() }])
    }, delay)
  }

  async function sendPriceOffer({ rental, insurance, deposit, total }) {
    setShowPriceInput(false)
    if (isReal) {
      try {
        await addDoc(collection(db, 'chats', chat.id, 'messages'), {
          type: 'price_offer',
          senderUid: user.uid,
          breakdown: { rental, insurance, deposit },
          total,
          status: 'pending',
          time: serverTimestamp(),
        })
        await updateDoc(doc(db, 'chats', chat.id), {
          lastMessage: `Price offer: ฿${total.toLocaleString()}/day`,
          lastMessageTime: serverTimestamp(),
          currentPrice: total,
        })
      } catch (e) { console.error('Offer send error:', e) }
    } else {
      setMessages(prev => [...prev, {
        id: Date.now().toString(), type: 'price_offer', me: true, time: new Date(),
        breakdown: { rental, insurance, deposit }, total, status: 'pending',
      }])
      simulateReply("I received your price offer. Let me review it.", 1200)
    }
  }

  async function updateOfferStatus(msgId, status) {
    if (isReal) {
      try {
        await updateDoc(doc(db, 'chats', chat.id, 'messages', msgId), { status })
      } catch (e) { console.error('Status update error:', e) }
    } else {
      setMessages(prev => prev.map(m => m.id === msgId ? { ...m, status } : m))
    }
  }

  function handleAccept(msgId) {
    updateOfferStatus(msgId, 'accepted')
    if (!isReal) simulateReply("Deal confirmed! I will prepare the car. See you soon 🚗", 700)
  }

  function handleDecline(msgId) {
    updateOfferStatus(msgId, 'declined')
    if (!isReal) simulateReply('No worries — feel free to send a counter offer anytime.', 600)
  }

  function handleNegotiate(msgId) {
    updateOfferStatus(msgId, 'negotiating')
    if (!isReal) {
      setMessages(prev => [...prev, { id: Date.now().toString(), type: 'text', text: "I would like to negotiate the price.", me: true, time: new Date() }])
      simulateReply("Sure! What price works for you?", 1000)
    }
  }

  const currentRole = iAmOwner ? 'owner' : role

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100dvh', background: '#0D0D0D' }}>
      {/* App bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 16px', background: '#111', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <button onClick={onBack} style={{ width: 34, height: 34, borderRadius: 10, border: 'none', background: 'rgba(255,255,255,0.07)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '0.95rem', flexShrink: 0 }}>←</button>

        <div style={{ width: 34, height: 34, borderRadius: 10, flexShrink: 0, background: colorBg, overflow: 'hidden', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}>
          {carData?.photo
            ? <img src={carData.photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }} />
            : carData?.emoji || '🚗'
          }
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 600, fontSize: '0.88rem', color: '#fff', lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {carData?.brand} {carData?.model}
          </div>
          <div style={{ fontSize: '0.7rem', color: isTyping ? '#f97316' : 'rgba(255,255,255,0.4)', transition: 'color .2s' }}>
            {isTyping ? `${otherName} is typing…` : otherName}
          </div>
        </div>

        <div style={{ padding: '6px 14px', borderRadius: 100, background: 'rgba(249,115,22,0.12)', border: '1px solid rgba(249,115,22,0.25)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <span style={{ fontSize: '0.6rem', color: 'rgba(249,115,22,0.6)', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', lineHeight: 1.2 }}>Price</span>
          <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#f97316', letterSpacing: '-0.02em', lineHeight: 1.2 }}>฿{fmt(displayPrice)}</span>
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 14px', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {messages.length === 0 && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, opacity: 0.6 }}>
            <div style={{ fontSize: '2.5rem' }}>💬</div>
            <div style={{ fontSize: '0.88rem', color: 'rgba(255,255,255,0.4)', textAlign: 'center' }}>
              Say hello to {otherName}!
            </div>
          </div>
        )}

        {messages.map(msg => (
          <MessageRow
            key={msg.id} msg={msg} role={currentRole}
            otherInit={otherInit} otherColor={otherColor} colorBg={colorBg}
            onAccept={() => handleAccept(msg.id)}
            onDecline={() => handleDecline(msg.id)}
            onNegotiate={() => handleNegotiate(msg.id)}
          />
        ))}

        {isTyping && <TypingIndicator otherInit={otherInit} colorBg={colorBg} otherColor={otherColor} />}
        <div ref={bottomRef} />
      </div>

      {/* Owner price panel */}
      {showPriceInput && currentRole === 'owner' && (
        <OwnerPricePanel onSend={sendPriceOffer} onCancel={() => setShowPriceInput(false)} />
      )}

      {/* Input bar */}
      {!showPriceInput && (
        <div style={{ background: '#111', borderTop: '1px solid rgba(255,255,255,0.06)', padding: '10px 12px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input
              ref={inputRef}
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendText(inputText) } }}
              placeholder="Message…"
              style={{ flex: 1, padding: '11px 16px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 100, color: '#fff', fontFamily: 'inherit', fontSize: '0.88rem', outline: 'none', boxShadow: 'none' }}
              onFocus={e => e.target.style.borderColor = 'rgba(249,115,22,0.4)'}
              onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.09)'}
            />
            <button
              onClick={() => sendText(inputText)}
              disabled={!inputText.trim()}
              style={{ width: 38, height: 38, borderRadius: '50%', border: 'none', background: inputText.trim() ? '#f97316' : 'rgba(255,255,255,0.07)', color: inputText.trim() ? '#fff' : 'rgba(255,255,255,0.25)', cursor: inputText.trim() ? 'pointer' : 'default', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .15s', flexShrink: 0 }}
            >↑</button>
          </div>

          {currentRole === 'owner' && (
            <button onClick={() => setShowPriceInput(true)} style={{ width: '100%', padding: '10px', borderRadius: 100, background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.25)', color: '#f97316', fontFamily: 'inherit', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              ฿ Send price offer
            </button>
          )}

          {currentRole === 'renter' && (
            <div style={{ display: 'flex', gap: 6, overflowX: 'auto' }}>
              {[
                { label: 'Available?',  text: 'Is the car available for my dates?' },
                { label: '−฿100',       text: `Could we do ฿${fmt(Math.max(200, displayPrice - 100))}/day?` },
                { label: '−฿200',       text: `Could we do ฿${fmt(Math.max(200, displayPrice - 200))}/day?` },
                { label: '−10%',        text: `Could we do ฿${fmt(Math.round(displayPrice * 0.9 / 100) * 100)}/day?` },
                { label: 'Accept deal', text: "I accept the price. Let us confirm!" },
              ].map(qr => (
                <button key={qr.label} onClick={() => sendText(qr.text)} style={{ padding: '7px 13px', borderRadius: 100, border: '1px solid rgba(249,115,22,0.2)', background: 'rgba(249,115,22,0.07)', color: '#f97316', fontFamily: 'inherit', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0 }}>
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
