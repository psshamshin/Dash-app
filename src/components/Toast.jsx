import { useEffect } from 'react'

export default function Toast({ toast, onDismiss }) {
  useEffect(() => {
    if (!toast) return
    const t = setTimeout(onDismiss, 4000)
    return () => clearTimeout(t)
  }, [toast])

  if (!toast) return null

  return (
    <div
      onClick={() => { toast.onTap?.(); onDismiss() }}
      style={{
        position: 'fixed',
        top: 'max(16px, env(safe-area-inset-top, 16px))',
        left: 12, right: 12,
        zIndex: 9999,
        background: 'rgba(22, 22, 22, 0.92)',
        backdropFilter: 'saturate(180%) blur(24px)',
        WebkitBackdropFilter: 'saturate(180%) blur(24px)',
        borderRadius: 18,
        padding: '12px 14px',
        border: '1px solid rgba(255,255,255,0.1)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.45)',
        display: 'flex', alignItems: 'center', gap: 12,
        cursor: toast.onTap ? 'pointer' : 'default',
        animation: 'toastIn .35s cubic-bezier(0.34,1.56,0.64,1)',
      }}
    >
      <div style={{
        width: 40, height: 40, borderRadius: 12, flexShrink: 0,
        background: toast.iconBg || 'rgba(249,115,22,0.15)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '1.2rem',
      }}>
        {toast.icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#fff', marginBottom: 2 }}>
          {toast.title}
        </div>
        {toast.body && (
          <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.55)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {toast.body}
          </div>
        )}
      </div>
      <button
        onClick={e => { e.stopPropagation(); onDismiss() }}
        style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', fontSize: '0.85rem', padding: '4px', flexShrink: 0 }}
      >
        ✕
      </button>
    </div>
  )
}
