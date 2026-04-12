import { useState } from 'react'
import { initChats } from '../data/chats.js'

const fmtAgo = (d) => {
  const diff = (Date.now() - new Date(d)) / 60000
  if (diff < 60)   return `${Math.round(diff)}m`
  if (diff < 1440) return `${Math.round(diff / 60)}h`
  return `${Math.round(diff / 1440)}d`
}

export default function ChatsScreen({ onChatTap }) {
  const [chats] = useState(initChats)

  return (
    <div className="screen fade-up">
      <div className="app-bar">
        <span style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text)' }}>Chats</span>
      </div>

      {chats.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-low)' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: 10 }}>💬</div>
          <p>No conversations yet.<br />Tap a car to start chatting.</p>
        </div>
      ) : (
        <div style={{ background: 'var(--surface)', margin: '0 16px', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow-sm)', overflow: 'hidden' }}>
          {chats.map(chat => {
            const last = chat.messages[chat.messages.length - 1]
            return (
              <div key={chat.id} className="chat-tile" onClick={() => onChatTap(chat)}>
                <div className="chat-car-thumb" style={{ background: chat.car.colorBg }}>
                  <span>{chat.car.emoji}</span>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                    <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text)' }}>
                      {chat.car.brand} {chat.car.model}
                    </span>
                    {last && (
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-low)', flexShrink: 0 }}>
                        {fmtAgo(last.time)}
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--accent)', fontWeight: 500, marginBottom: 3 }}>
                    {chat.otherName}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                    <span style={{
                      fontSize: '0.8rem', color: 'var(--text-low)',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1,
                    }}>
                      {last ? last.text : 'No messages yet'}
                    </span>
                    <span className="badge badge-accent" style={{ flexShrink: 0 }}>
                      ฿{chat.currentPrice.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
