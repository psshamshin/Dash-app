import { useState } from 'react'
import SplashScreen      from './screens/SplashScreen.jsx'
import AuthScreen        from './screens/AuthScreen.jsx'
import OnboardingScreen  from './screens/OnboardingScreen.jsx'
import BrowseScreen      from './screens/BrowseScreen.jsx'
import ListingsScreen    from './screens/ListingsScreen.jsx'
import ChatsScreen       from './screens/ChatsScreen.jsx'
import ChatDetailScreen  from './screens/ChatDetailScreen.jsx'
import CarDetailScreen   from './screens/CarDetailScreen.jsx'
import ProfileScreen     from './screens/ProfileScreen.jsx'
import AddCarScreen      from './screens/AddCarScreen.jsx'
import BottomNav         from './components/BottomNav.jsx'
import { cars as initialCars } from './data/cars.js'

function loadUser() {
  try { return JSON.parse(localStorage.getItem('dash_user')) } catch { return null }
}

export default function App() {
  const [user, setUser]                 = useState(loadUser)
  const [screen, setScreen]             = useState('splash')
  const [tab, setTab]                   = useState('browse')
  const [role, setRole]                 = useState('renter')
  const [selectedCar, setSelectedCar]   = useState(null)
  const [selectedChat, setSelectedChat] = useState(null)
  const [extraCars, setExtraCars]       = useState([])

  const allCars = [...initialCars, ...extraCars]

  // ── Auth handlers ───────────────────────────────────────────────────────────
  function handleAuth(newUser, isNew) {
    setUser(newUser)
    if (isNew) {
      setScreen('onboarding')
    } else {
      setScreen('main')
    }
  }

  function handleOnboardingComplete(updatedUser) {
    setUser(updatedUser)
    localStorage.setItem('dash_user', JSON.stringify(updatedUser))
    setScreen('main')
  }

  function handleLogout() {
    localStorage.removeItem('dash_user')
    setUser(null)
    setScreen('splash')
    setTab('browse')
    setRole('renter')
  }

  // ── Navigation handlers ─────────────────────────────────────────────────────
  function handleStart() { setScreen('auth') }

  function handleCarTap(car) { setSelectedCar(car); setScreen('car') }

  function handleChatTap(chat) { setSelectedChat(chat); setScreen('chat') }

  function handleBack() {
    setScreen(prev => {
      if (prev === 'chat') return selectedCar ? 'car' : 'main'
      return 'main'
    })
  }

  function handleTabChange(newTab) {
    setTab(newTab); setScreen('main')
    setSelectedCar(null); setSelectedChat(null)
  }

  function handleRoleChange(newRole) {
    setRole(newRole)
    setTab(newRole === 'owner' ? 'listings' : 'browse')
    if (screen !== 'splash' && screen !== 'auth' && screen !== 'onboarding') setScreen('main')
    setSelectedCar(null); setSelectedChat(null)
  }

  function handlePublishCar(car) {
    setExtraCars(prev => [car, ...prev])
    setScreen('main')
    setTab('listings')
  }

  // ── Active tab ──────────────────────────────────────────────────────────────
  let activeTab = tab
  if (role === 'owner' && tab === 'browse') activeTab = 'listings'

  function renderTab() {
    if (activeTab === 'chats')    return <ChatsScreen onChatTap={handleChatTap} />
    if (activeTab === 'profile')  return <ProfileScreen user={user} onLogout={handleLogout} />
    if (activeTab === 'listings') return (
      <ListingsScreen
        cars={allCars}
        onCarTap={handleCarTap}
        onAddCar={() => setScreen('add-car')}
      />
    )
    return <BrowseScreen cars={allCars} onCarTap={handleCarTap} />
  }

  // ── Screen routing ──────────────────────────────────────────────────────────
  let content
  if (screen === 'splash') {
    content = <SplashScreen onStart={handleStart} />
  } else if (screen === 'auth') {
    content = <AuthScreen onAuth={handleAuth} onBack={() => setScreen('splash')} />
  } else if (screen === 'onboarding') {
    content = <OnboardingScreen user={user} onComplete={handleOnboardingComplete} />
  } else if (screen === 'add-car') {
    content = <AddCarScreen user={user} onPublish={handlePublishCar} onBack={() => setScreen('main')} />
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
        <BottomNav tab={activeTab} onTabChange={handleTabChange} />
      </div>
    )
  }

  const hideToggle = ['splash','auth','onboarding','add-car','car','chat'].includes(screen)

  return (
    <div style={{ width: '100%', minHeight: '100dvh', position: 'relative' }}>
      {content}
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
