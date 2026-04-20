import { useState } from 'react'
import SplashScreen     from './screens/SplashScreen.jsx'
import BrowseScreen     from './screens/BrowseScreen.jsx'
import ListingsScreen   from './screens/ListingsScreen.jsx'
import ChatsScreen      from './screens/ChatsScreen.jsx'
import ChatDetailScreen from './screens/ChatDetailScreen.jsx'
import CarDetailScreen  from './screens/CarDetailScreen.jsx'
import ProfileScreen    from './screens/ProfileScreen.jsx'
import BottomNav        from './components/BottomNav.jsx'

export default function App() {
  const [screen, setScreen]             = useState('splash')
  const [tab, setTab]                   = useState('browse')
  const [role, setRole]                 = useState('renter')
  const [selectedCar, setSelectedCar]   = useState(null)
  const [selectedChat, setSelectedChat] = useState(null)

  function handleStart() { setScreen('main') }

  function handleCarTap(car) {
    setSelectedCar(car)
    setScreen('car')
  }

  function handleChatTap(chat) {
    setSelectedChat(chat)
    setScreen('chat')
  }

  function handleBack() {
    setScreen(prev => {
      if (prev === 'chat') return selectedCar ? 'car' : 'main'
      return 'main'
    })
  }

  function handleTabChange(newTab) {
    setTab(newTab)
    setScreen('main')
    setSelectedCar(null)
    setSelectedChat(null)
  }

  function handleRoleChange(newRole) {
    setRole(newRole)
    setTab(newRole === 'owner' ? 'listings' : 'browse')
    if (screen !== 'splash') setScreen('main')
    setSelectedCar(null)
    setSelectedChat(null)
  }

  // ── Active tab resolution ──────────────────────────────────────────────────
  let activeTab = tab
  if (role === 'owner' && tab === 'browse') activeTab = 'listings'

  function renderTab() {
    if (activeTab === 'chats')    return <ChatsScreen onChatTap={handleChatTap} />
    if (activeTab === 'profile')  return <ProfileScreen />
    if (activeTab === 'listings') return <ListingsScreen onCarTap={handleCarTap} />
    return <BrowseScreen onCarTap={handleCarTap} />
  }

  // ── Screens ────────────────────────────────────────────────────────────────
  let content
  if (screen === 'splash') {
    content = <SplashScreen onStart={handleStart} />
  } else if (screen === 'car' && selectedCar) {
    content = (
      <CarDetailScreen
        car={selectedCar}
        onBack={() => setScreen('main')}
        onChat={handleChatTap}
      />
    )
  } else if (screen === 'chat' && selectedChat) {
    content = (
      <ChatDetailScreen
        chat={selectedChat}
        role={role}
        onBack={handleBack}
      />
    )
  } else {
    content = (
      <div className="app-shell">
        <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
          {renderTab()}
        </div>
        <BottomNav
          tab={activeTab}
          onTabChange={handleTabChange}
        />
      </div>
    )
  }

  const hideToggle = screen === 'car' || screen === 'chat'

  return (
    <div style={{ width: '100%', minHeight: '100dvh', position: 'relative' }}>
      {content}

      {/* Floating role toggle — hidden on booking screens */}
      {!hideToggle && (
        <div className="role-float">
          <button
            className={`role-float-btn ${role === 'renter' ? 'active' : ''}`}
            onClick={() => handleRoleChange('renter')}
          >
            Renter
          </button>
          <button
            className={`role-float-btn ${role === 'owner' ? 'active' : ''}`}
            onClick={() => handleRoleChange('owner')}
          >
            Owner
          </button>
        </div>
      )}
    </div>
  )
}
