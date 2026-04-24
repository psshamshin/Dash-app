import { useState } from 'react'
import {
  collection, getDocs, deleteDoc, doc, writeBatch,
} from 'firebase/firestore'
import { db } from '../firebase.js'

async function deleteCollection(colPath) {
  const snap = await getDocs(collection(db, colPath))
  if (snap.empty) return 0
  const batch = writeBatch(db)
  snap.docs.forEach(d => batch.delete(d.ref))
  await batch.commit()
  return snap.size
}

export default function AdminScreen({ onBack }) {
  const [log,     setLog]     = useState([])
  const [loading, setLoading] = useState(false)

  function addLog(msg, ok = true) {
    setLog(prev => [...prev, { msg, ok, t: new Date().toLocaleTimeString() }])
  }

  async function clearChats() {
    setLoading(true)
    try {
      const chatsSnap = await getDocs(collection(db, 'chats'))
      let msgCount = 0
      const batch = writeBatch(db)
      for (const chatDoc of chatsSnap.docs) {
        const msgsSnap = await getDocs(collection(db, 'chats', chatDoc.id, 'messages'))
        msgsSnap.docs.forEach(m => batch.delete(m.ref))
        msgCount += msgsSnap.size
        batch.delete(chatDoc.ref)
      }
      await batch.commit()
      addLog(`Deleted ${chatsSnap.size} chats and ${msgCount} messages`)
    } catch (e) {
      addLog(`Error: ${e.message}`, false)
    }
    setLoading(false)
  }

  async function clearListings() {
    setLoading(true)
    try {
      const count = await deleteCollection('cars')
      addLog(`Deleted ${count} car listings`)
    } catch (e) {
      addLog(`Error: ${e.message}`, false)
    }
    setLoading(false)
  }

  async function clearBookings() {
    setLoading(true)
    try {
      const count = await deleteCollection('bookings')
      addLog(`Deleted ${count} bookings`)
    } catch (e) {
      addLog(`Error: ${e.message}`, false)
    }
    setLoading(false)
  }

  async function clearAll() {
    setLoading(true)
    setLog([])
    await clearChats()
    await clearListings()
    await clearBookings()
    addLog('Done — all data cleared')
    setLoading(false)
  }

  const actions = [
    {
      icon: '💬', label: 'Clear all chats',
      sub: 'Delete all conversations and messages',
      color: '#f97316', fn: clearChats,
    },
    {
      icon: '🚗', label: 'Delete all listings',
      sub: 'Remove all car listings from Firestore',
      color: '#f97316', fn: clearListings,
    },
    {
      icon: '📋', label: 'Clear all bookings',
      sub: 'Delete all booking records',
      color: '#f97316', fn: clearBookings,
    },
    {
      icon: '🗑️', label: 'Clear everything',
      sub: 'Wipe chats, listings, bookings',
      color: '#ef4444', fn: clearAll,
      danger: true,
    },
  ]

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '16px 16px 12px', background: 'var(--surface)', borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, zIndex: 10 }}>
        <button onClick={onBack} style={{ width: 36, height: 36, borderRadius: 10, border: 'none', background: 'var(--surface-2)', color: 'var(--text)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '1rem', flexShrink: 0 }}>←</button>
        <span style={{ flex: 1, fontSize: '1rem', fontWeight: 700, color: 'var(--text)' }}>Admin Panel</span>
        <span className="badge badge-accent">dev</span>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 16px', paddingBottom: 'calc(var(--nav-h) + 24px)', display: 'flex', flexDirection: 'column', gap: 14 }}>

        {/* Warning */}
        <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 12, padding: '12px 14px', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
          <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>⚠️</span>
          <p style={{ fontSize: '0.82rem', color: '#ef4444', lineHeight: 1.5, margin: 0 }}>
            These actions are <strong>irreversible</strong>. Data deleted from Firestore cannot be recovered.
          </p>
        </div>

        {/* Actions */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden' }}>
          {actions.map((a, i) => (
            <button
              key={a.label}
              onClick={a.fn}
              disabled={loading}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 14,
                padding: '14px 16px', background: 'transparent', border: 'none',
                borderBottom: i < actions.length - 1 ? '1px solid var(--border)' : 'none',
                cursor: loading ? 'default' : 'pointer', opacity: loading ? 0.5 : 1,
                transition: 'background .15s', textAlign: 'left',
              }}
            >
              <div style={{ width: 40, height: 40, borderRadius: 10, background: a.danger ? 'rgba(239,68,68,0.1)' : 'var(--accent-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', flexShrink: 0 }}>
                {a.icon}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: '0.9rem', color: a.danger ? '#ef4444' : 'var(--text)', marginBottom: 2 }}>{a.label}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-low)' }}>{a.sub}</div>
              </div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-low)' }}>›</span>
            </button>
          ))}
        </div>

        {/* Log */}
        {log.length > 0 && (
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-low)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Log</div>
            {log.map((entry, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-low)', flexShrink: 0, marginTop: 1 }}>{entry.t}</span>
                <span style={{ fontSize: '0.8rem', color: entry.ok ? 'var(--green)' : '#ef4444' }}>{entry.msg}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
