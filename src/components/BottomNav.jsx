export default function BottomNav({ tab, onTabChange }) {
  return (
    <nav className="bottom-nav">
      {/* Chats */}
      <button
        className={`nav-side ${tab === 'chats' ? 'active' : ''}`}
        onClick={() => onTabChange('chats')}
      >
        {tab !== 'chats' && <span className="nav-badge-dot" />}
        <span className="nav-icon" style={{ color: tab === 'chats' ? 'var(--accent)' : 'var(--text-low)' }}>
          💬
        </span>
        <span className="nav-label">Chats</span>
      </button>

      {/* Spacer for center floating toggle */}
      <div style={{ flex: 1 }} />

      {/* Profile */}
      <button
        className={`nav-side ${tab === 'profile' ? 'active' : ''}`}
        onClick={() => onTabChange('profile')}
      >
        <span className="nav-icon" style={{ color: tab === 'profile' ? 'var(--accent)' : 'var(--text-low)' }}>
          👤
        </span>
        <span className="nav-label">Profile</span>
      </button>
    </nav>
  )
}
