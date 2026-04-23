const TABS = [
  { id: 'chats',    icon: '💬', label: 'Chat'    },
  { id: 'browse',   icon: '🔍', label: 'Renter'  },
  { id: 'listings', icon: '🚗', label: 'Owner'   },
  { id: 'profile',  icon: '👤', label: 'Profile' },
]

export default function BottomNav({ tab, onTabChange }) {
  return (
    <nav className="bottom-nav">
      {TABS.map(t => (
        <button
          key={t.id}
          className={`nav-tab ${tab === t.id ? 'active' : ''}`}
          onClick={() => onTabChange(t.id)}
        >
          <span className="nav-icon">{t.icon}</span>
          <span className="nav-label">{t.label}</span>
        </button>
      ))}
    </nav>
  )
}
