import { useState, useEffect, useRef } from 'react'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db } from './firebase.js'
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

export default function App() {
  const [user, setUser]                 = useState(null)
  const [authLoading, setAuthLoading]   = useState(true)
  const [screen, setScreen]             = useState('splash')
  const [tab, setTab]                   = useState('browse')
  const [role, setRole]                 = useState('renter')
  const [selectedCar, setSelectedCar]   = useState(null)
  const [selectedChat, setSelectedChat] = useState(null)
  const initialAuthDone = useRef(false)

  // ── Firebase auth persistence (handles page reload) ─────────────────────────
  useEffect(() => {
    return onAuthStateChanged(auth, async (fbUser) => {
      if (!initialAuthDone.current) {
        initialAuthDone.current = true
        if (fbUser) {
          try {
            const snap = await getDoc(doc(db, 'users', fbUser.uid))
            if (snap.exists()) {
              setUser({ uid: fbUser.uid, ...snap.data() })
              setScreen('main')
            }
          } catch (e) { console.error('Auth load error:', e) }
        }
        setAuthLoading(false)
      } else if (!fbUser) {
        setUser(null)
        setScreen('splash')
        setTab('browse')
        setRole('renter')
      }
    })
  }, [])

  // ── Auth handlers ───────────────────────────────────────────────────────────
  function handleAuth(profile, isNew) {
    setUser(profile)
    setScreen(isNew ? 'onboarding' : 'main')
  }

  function handleOnboardingComplete(updatedUser) {
    setUser(updatedUser)
    setScreen('main')
  }

  async function handleLogout() {
    await signOut(auth)
  }

  // ── Navigation ──────────────────────────────────────────────────────────────
  function handleStart() { setScreen('auth') }

  function handleCarTap(car) { setSelectedCar(car); setScreen('car') }

  async function handleCarBook(car) {
    if (car.ownerUid && user) {
      // Real car with a Firebase owner — create or find Firestore chat
      const chatId = `${user.uid}_${car.id}`
      const chatRef = doc(db, 'chats', chatId)
      try {
        const snap = await getDoc(chatRef)
        if (!snap.exists()) {
          await setDoc(chatRef, {
            id: chatId,
            participants: [user.uid, car.ownerUid],
            car: {
              id: car.id, brand: car.brand, model: car.model,
              photo: car.photo || null, emoji: car.emoji || '🚗',
              colorBg: car.colorBg || 'rgba(249,115,22,0.15)',
              price: car.price,
            },
            renterUid: user.uid,
            renterName: user.name,
            renterInit: user.avatar,
            ownerUid: car.ownerUid,
            ownerName: car.owner,
            ownerInit: car.ownerInit,
            currentPrice: car.price,
            lastMessage: '',
            lastMessageTime: serverTimestamp(),
            createdAt: serverTimestamp(),
          })
        }
        const freshSnap = await getDoc(chatRef)
        setSelectedChat({ id: chatId, ...freshSnap.data(), isReal: true })
      } catch (e) {
        console.error('Chat creation error:', e)
        setSelectedChat({
          id: chatId, isReal: false,
          car, otherName: car.owner, otherInit: car.ownerInit,
          otherColor: car.color, currentPrice: car.price, messages: [],
        })
      }
    } else {
      // Seed / demo car — use auto-reply
      setSelectedChat({
        id: `new_${car.id}`, isReal: false,
        car, otherName: car.owner, otherInit: car.ownerInit,
        otherColor: car.color, currentPrice: car.price, messages: [],
      })
    }
    setScreen('chat')
  }

  function handleChatOpen(chat) {
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
    setTab(newTab); setScreen('main')
    setSelectedCar(null); setSelectedChat(null)
  }

  function handleRoleChange(newRole) {
    setRole(newRole)
    setTab(newRole === 'owner' ? 'listings' : 'browse')
    if (!['splash','auth','onboarding'].includes(screen)) setScreen('main')
    setSelectedCar(null); setSelectedChat(null)
  }

  function handlePublishCar() {
    setScreen('main')
    setTab('listings')
  }

  // ── Active tab ──────────────────────────────────────────────────────────────
  let activeTab = tab
  if (role === 'owner' && tab === 'browse') activeTab = 'listings'

  function renderTab() {
    if (activeTab === 'chats')    return <ChatsScreen user={user} onChatTap={handleChatOpen} />
    if (activeTab === 'profile')  return <ProfileScreen user={user} onLogout={handleLogout} />
    if (activeTab === 'listings') return (
      <ListingsScreen user={user} onCarTap={handleCarTap} onAddCar={() => setScreen('add-car')} />
    )
    return <BrowseScreen user={user} onCarTap={handleCarTap} />
  }

  // ── Screen routing ──────────────────────────────────────────────────────────
  if (authLoading) {
    return (
      <div style={{ width: '100%', minHeight: '100dvh', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid rgba(249,115,22,0.2)', borderTopColor: '#f97316', animation: 'spin 0.9s linear infinite' }} />
      </div>
    )
  }

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
        role={role}
        user={user}
        onBack={() => setScreen('main')}
        onChat={handleCarBook}
      />
    )
  } else if (screen === 'chat' && selectedChat) {
    content = (
      <ChatDetailScreen
        chat={selectedChat}
        user={user}
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
