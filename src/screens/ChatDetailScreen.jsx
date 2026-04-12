import { useState, useRef, useEffect } from 'react'
import { quickReplies } from '../data/chats.js'

const fmtTime = (d) => {
  const h = d.getHours().toString().padStart(2, '0')
  const m = d.getMinutes().toString().padStart(2, '0')
  return `${h}:${m}`
}

const autoReplies = {
  book:     "Great! I'll prepare the car. See you soon! 🚗",
  discount: "I can offer 5% off. Does that work for you?",
  accept:   "Perfect — deal confirmed! I'll send pick-up details shortly.",
  decline:  "No problem. Feel free to reach out if you change your mind.",
  avail:    "Yes, the car is available for your dates! Want to go ahead?",
  lower:    "That's a bit low, but let's talk. What dates are you looking at?",
  raise:    "Thanks! I appreciate that — deal! 🤝",
}

export default function ChatDetailScreen({ chat, onBack }) {
  const [messages, setMessages] = useState(chat.messages)
  const [price, setPrice]       = useState(chat.currentPrice)
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  function send(qr) {
    const newMsg = {
      id: Date.now().toString(),
      text: qr.text,
      me: true,
      time: new Date(),
    }
    let nextPrice = price
    if (qr.delta !== 0) nextPrice = Math.max(100, price + qr.delta)
    setPrice(nextPrice)
    setMessages(prev => [...prev, newMsg])

    const reply = autoReplies[qr.id]
    if (reply) {
      setTimeout(() => {
        setMessages(prev => [...prev, {
          id: (Date.now() + 1).toString(),
          text: reply,
          me: false,
          time: new Date(),
        }])
      }, 1000)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100dvh', background: 'var(--bg)' }}>
      {/* App bar */}
      <div className="app-bar" style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
        <button className="icon-btn" onClick={onBack}>←</button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 10, flexShrink: 0,
            background: chat.car.colorBg,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.1rem',
          }}>
            {chat.car.emoji}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {chat.car.brand} {chat.car.model}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-mid)' }}>{chat.otherName}</div>
          </div>
        </div>
        {/* Live price chip */}
        <div style={{
          padding: '5px 12px', borderRadius: '100px',
          background: 'var(--accent-dim)',
          fontSize: '0.82rem', fontWeight: 700, color: 'var(--accent)',
          flexShrink: 0,
        }}>
          ฿{price.toLocaleString()}/day
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px' }}>
        {messages.length === 0 ? (
          <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
            <div style={{
              width: 56, height: 56, borderRadius: '50%',
              background: 'var(--accent-dim)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.6rem',
            }}>💬</div>
            <div style={{ fontWeight: 600, color: 'var(--text)' }}>Start the conversation</div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-low)', textAlign: 'center' }}>
              Use quick replies below to chat with {chat.otherName}
            </div>
          </div>
        ) : (
          <>
            {messages.map(msg => (
              <div key={msg.id}>
                <div className={`bubble-row ${msg.me ? 'me' : ''}`} style={{ marginBottom: 2 }}>
                  {!msg.me && (
                    <div className="avatar-sm" style={{
                      background: chat.car.colorBg,
                      color: chat.car.color,
                    }}>
                      {chat.otherInit}
                    </div>
                  )}
                  <div className={`bubble ${msg.me ? 'me' : 'them'}`}>{msg.text}</div>
                  {msg.me && (
                    <span style={{ fontSize: '0.7rem', color: 'var(--accent)' }}>✓✓</span>
                  )}
                </div>
                <div className={`bubble-time ${msg.me ? '' : 'them'}`}>
                  {fmtTime(msg.time instanceof Date ? msg.time : new Date(msg.time))}
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </>
        )}
      </div>

      {/* Quick replies */}
      <div className="quick-replies-bar">
        <div className="quick-replies-label">Quick replies</div>
        <div className="quick-replies-grid">
          {quickReplies.map(qr => (
            <button
              key={qr.id}
              className={`qr-btn ${qr.type || ''}`}
              onClick={() => send(qr)}
            >
              {qr.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
