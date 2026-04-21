import { useState, useEffect } from 'react'
import { collection, query, where, onSnapshot } from 'firebase/firestore'
import { db } from '../firebase.js'

const fmtAgo = (d) => {
  if (!d) return ''
  const diff = (Date.now() - (d.toDate ? d.toDate() : new Date(d))) / 60000
  if (diff < 60)   return `${Math.round(diff)}m`
  if (diff < 1440) return `${Math.round(diff / 60)}h`
  return `${Math.round(diff / 1440)}d`
}

export default function ChatsScreen({ user, onChatTap }) {
  const [chats, setChats] = useState([])

  useEffect(() => {
    if (!user?.uid) return
    const q = query(
      collection(db, 'chats'),
      where('participants', 'array-contains', user.uid)
    )
    return onSnapshot(q, snap => {
      const all = snap.docs.map(d => ({ ...d.data(), id: d.id, isReal: true }))
      all.sort((a, b) => {
        const ta = a.lastMessageTime?.toDate?.() || new Date(0)
        const tb = b.lastMessageTime?.toDate?.() || new Date(0)
        return tb - ta
      })
      setChats(all)
    }, err => console.error('Chats load error:', err))
  }, [user?.uid])

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
            const iAmOwner = chat.ownerUid === user?.uid
            const otherName = iAmOwner ? chat.renterName : chat.ownerName
            return (
              <div key={chat.id} className="chat-tile" onClick={() => onChatTap(chat)}>
                <div className="chat-car-thumb" style={{ background: chat.car?.colorBg || 'rgba(249,115,22,0.15)', overflow: 'hidden', position: 'relative' }}>
                  {chat.car?.photo
                    ? <img src={chat.car.photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }} />
                    : <span>{chat.car?.emoji || '🚗'}</span>
                  }
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                    <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text)' }}>
                      {chat.car?.brand} {chat.car?.model}
                    </span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-low)', flexShrink: 0 }}>
                      {fmtAgo(chat.lastMessageTime)}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--accent)', fontWeight: 500, marginBottom: 3 }}>
                    {otherName}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-low)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                      {chat.lastMessage || 'Start the conversation'}
                    </span>
                    <span className="badge badge-accent" style={{ flexShrink: 0 }}>
                      ฿{(chat.currentPrice || 0).toLocaleString()}
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
