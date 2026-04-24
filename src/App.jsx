import { useState, useEffect, useRef } from 'react'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { doc, getDoc, setDoc, serverTimestamp, collection, query, where, onSnapshot } from 'firebase/firestore'
import { auth, db } from './firebase.js'
import AuthScreen        from './screens/AuthScreen.jsx'
import OnboardingScreen  from './screens/OnboardingScreen.jsx'
import BrowseScreen      from './screens/BrowseScreen.jsx'
import ListingsScreen    from './screens/ListingsScreen.jsx'
import ChatsScreen       from './screens/ChatsScreen.jsx'
import ChatDetailScreen  from './screens/ChatDetailScreen.jsx'
import CarDetailScreen   from './screens/CarDetailScreen.jsx'
import ProfileScreen     from './screens/ProfileScreen.jsx'
import AddCarScreen      from './screens/AddCarScreen.jsx'
import BookingScreen        from './screens/BookingScreen.jsx'
import ActiveRentalScreen  from './screens/ActiveRentalScreen.jsx'
import AdminScreen          from './screens/AdminScreen.jsx'
import BottomNav            from './components/BottomNav.jsx'
import Toast                from './components/Toast.jsx'

export default function App() {
  const [user, setUser]                 = useState(null)
  const [screen, setScreen]             = useState('main')
  const [tab, setTab]                   = useState('browse')
  const [selectedCar, setSelectedCar]   = useState(null)
  const [selectedChat, setSelectedChat]     = useState(null)
  const [activeRental, setActiveRental]     = useState(null)
  const today = new Date().toISOString().split('T')[0]
  const plus4 = new Date(Date.now() + 4 * 864e5).toISOString().split('T')[0]
  const [searchPickup, setSearchPickup] = useState(today)
  const [searchRet,    setSearchRet]    = useState(plus4)
  const [theme, setTheme]                   = useState(() => localStorage.getItem('dash_theme') || 'dark')
  const [toast, setToast]                   = useState(null)
  const chatTimestamps                       = useRef({})
  const screenRef                            = useRef(screen)
  const selectedChatRef                      = useRef(null)

  // Role is derived from current tab
  const role = tab === 'listings' ? 'owner' : 'renter'

  // Apply theme
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('dash_theme', theme)
  }, [theme])

  // Keep refs in sync for use inside Firestore listeners
  useEffect(() => { screenRef.current = screen }, [screen])
  useEffect(() => { selectedChatRef.current = selectedChat }, [selectedChat])

  function showToast(icon, title, body, opts = {}) {
    setToast({ icon, title, body, iconBg: opts.iconBg, onTap: opts.onTap })
  }

  // Global listener: new messages in user's chats
  useEffect(() => {
    if (!user?.uid) return
    const q = query(collection(db, 'chats'), where('participants', 'array-contains', user.uid))
    return onSnapshot(q, snap => {
      snap.docChanges().forEach(change => {
        const data = change.doc.data()
        const chatId = change.doc.id
        const newMs = data.lastMessageTime?.toMillis?.()

        if (change.type === 'added') {
          chatTimestamps.current[chatId] = newMs
          return
        }
        if (change.type !== 'modified') return

        const oldMs = chatTimestamps.current[chatId]
        chatTimestamps.current[chatId] = newMs

        // Only notify if it's a new message and user is not already in this chat
        if (!newMs || !oldMs || newMs <= oldMs) return
        if (screenRef.current === 'chat' && selectedChatRef.current?.id === chatId) return
        if (!data.lastMessage) return

        const iAmOwner = data.ownerUid === user.uid
        const otherName = iAmOwner ? data.renterName : data.ownerName
        showToast('💬', otherName || 'New message', data.lastMessage, {
          iconBg: 'rgba(249,115,22,0.15)',
          onTap: () => {
            setSelectedChat({ ...data, id: chatId, isReal: true })
            setScreen('chat')
          },
        })
      })
    }, () => {})
  }, [user?.uid])

  // Global listener: booking status changes for owner
  useEffect(() => {
    if (!user?.uid) return
    const q = query(
      collection(db, 'bookings'),
      where('ownerUid', '==', user.uid),
      where('status', '==', 'confirmed')
    )
    let initialized = false
    return onSnapshot(q, snap => {
      if (!initialized) { initialized = true; return }
      snap.docChanges().forEach(change => {
        if (change.type !== 'added') return
        const b = change.doc.data()
        showToast('🚗', 'New booking!', `${b.renterName} booked ${b.carBrand} ${b.carModel}`, {
          iconBg: 'rgba(34,197,94,0.15)',
          onTap: () => { setTab('listings'); setScreen('main') },
        })
      })
    }, () => {})
  }, [user?.uid])

  // Firebase auth state
  useEffect(() => {
    return onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        try {
          const snap = await getDoc(doc(db, 'users', fbUser.uid))
          if (snap.exists()) {
            const profile = { uid: fbUser.uid, ...snap.data() }
            setUser(profile)
            if (screen === 'auth' || screen === 'onboarding') setScreen('main')
          }
        } catch (e) { console.error('Auth load error:', e) }
      } else {
        setUser(null)
      }
    })
  }, []) // eslint-disable-line

  // ── Auth ────────────────────────────────────────────────────────────────────
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
    setUser(null)
    setTab('browse')
    setScreen('main')
  }

  // ── Guard: redirect to auth if not logged in ─────────────────────────────
  function requireAuth() {
    if (!user) { setScreen('auth'); return false }
    return true
  }

  // ── Navigation ──────────────────────────────────────────────────────────────
  function handleCarTap(car) {
    if (!requireAuth()) return
    setSelectedCar(car)
    setScreen('car')
  }

  async function handleCarBook(car, bookType = 'negotiate') {
    if (!requireAuth()) return
    if (bookType === 'quick_book') {
      setSelectedCar(car)
      setScreen('booking')
      return
    }
    if (car.ownerUid && user) {
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
              color: car.color || '#f97316',
              price: car.price,
              location: car.location || '',
              year: car.year || '',
              seats: car.seats || 5,
              fuel: car.fuel || 'Petrol',
              transmission: car.transmission || 'Automatic',
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
        setSelectedChat({
          id: chatId,
          ...freshSnap.data(),
          isReal: true,
          bookType,
        })
      } catch (e) {
        console.error('Chat creation error:', e)
        // Even if Firestore fails, show real chat UI for cars with real owners
        setSelectedChat({
          id: chatId,
          isReal: true,
          bookType,
          car: {
            id: car.id, brand: car.brand, model: car.model,
            photo: car.photo || null, emoji: car.emoji || '🚗',
            colorBg: car.colorBg || 'rgba(249,115,22,0.15)',
            price: car.price,
          },
          renterUid: user.uid,  renterName: user.name,  renterInit: user.avatar,
          ownerUid:  car.ownerUid, ownerName: car.owner, ownerInit: car.ownerInit,
          currentPrice: car.price,
        })
      }
    } else {
      setSelectedChat({
        id: `new_${car.id}`, isReal: false, bookType,
        car, otherName: car.owner, otherInit: car.ownerInit,
        otherColor: car.color, currentPrice: car.price, messages: [],
      })
    }
    setScreen('chat')
  }

  function handleChatOpen(chat) {
    if (!requireAuth()) return
    setSelectedChat(chat)
    setScreen('chat')
  }

  function handleDealAccepted(offer, chat) {
    // Renter accepted a negotiated price — go to BookingScreen with that price pre-filled
    const carForBooking = {
      ...chat.car,
      owner:    chat.ownerName,
      ownerInit: chat.ownerInit,
      ownerUid: chat.ownerUid,
    }
    setSelectedCar({ ...carForBooking, _overridePrice: offer.total })
    setScreen('booking')
  }

  function handleBack() {
    setScreen(prev => {
      if (prev === 'chat') return selectedCar ? 'car' : 'main'
      return 'main'
    })
  }

  function handleTabChange(newTab) {
    if (!user && ['listings', 'chats'].includes(newTab)) {
      setScreen('auth'); return
    }
    setTab(newTab)
    setScreen('main')
    setSelectedCar(null)
    setSelectedChat(null)
  }

  function handlePublishCar() {
    setScreen('main')
    setTab('listings')
  }

  // ── Render tab ──────────────────────────────────────────────────────────────
  function renderTab() {
    if (tab === 'chats')    return <ChatsScreen user={user} onChatTap={handleChatOpen} />
    if (tab === 'listings') return <ListingsScreen user={user} onCarTap={handleCarTap} onAddCar={() => setScreen('add-car')} />
    if (tab === 'profile')  return <ProfileScreen user={user} theme={theme} onToggleTheme={() => setTheme(t => t === 'dark' ? 'light' : 'dark')} onLogout={handleLogout} onLogin={() => setScreen('auth')} onAdmin={() => setScreen('admin')} />
    return <BrowseScreen user={user} onCarTap={handleCarTap} onRentalTap={r => { setActiveRental(r); setScreen('rental') }} pickup={searchPickup} ret={searchRet} onPickupChange={setSearchPickup} onRetChange={setSearchRet} />
  }

  // ── Screen routing ──────────────────────────────────────────────────────────
  let content
  if (screen === 'auth') {
    content = <AuthScreen onAuth={handleAuth} onBack={() => setScreen('main')} />
  } else if (screen === 'onboarding') {
    content = <OnboardingScreen user={user} onComplete={handleOnboardingComplete} />
  } else if (screen === 'add-car') {
    content = <AddCarScreen user={user} onPublish={handlePublishCar} onBack={() => setScreen('main')} />
  } else if (screen === 'booking' && selectedCar) {
    content = (
      <BookingScreen
        car={selectedCar}
        user={user}
        initialPickup={searchPickup}
        initialRet={searchRet}
        onBack={() => setScreen('car')}
        onDone={(rental) => {
          setActiveRental(rental)
          setScreen('rental')
          showToast('✅', 'Booking confirmed!', `${rental.carBrand} ${rental.carModel} · ${rental.pickup} → ${rental.ret}`, { iconBg: 'rgba(34,197,94,0.15)' })
        }}
      />
    )
  } else if (screen === 'admin') {
    content = <AdminScreen onBack={() => setScreen('main')} />
  } else if (screen === 'rental' && activeRental) {
    content = (
      <ActiveRentalScreen
        rental={activeRental}
        onBack={() => setScreen('main')}
        onContactOwner={() => {
          if (!activeRental?.ownerUid) return   // seed car — no real owner
          handleCarBook({
            id:           activeRental.carId,
            brand:        activeRental.carBrand,
            model:        activeRental.carModel,
            photo:        activeRental.carPhoto  || null,
            emoji:        activeRental.carEmoji  || '🚗',
            colorBg:      activeRental.carColorBg || 'rgba(249,115,22,0.15)',
            color:        activeRental.carColor  || '#f97316',
            price:        activeRental.total,
            location:     activeRental.carLocation || '',
            year:         activeRental.carYear || '',
            ownerUid:     activeRental.ownerUid,
            owner:        activeRental.ownerName,
            ownerInit:    activeRental.ownerInit,
          }, 'negotiate')
        }}
      />
    )
  } else if (screen === 'car' && selectedCar) {
    content = (
      <CarDetailScreen
        car={selectedCar}
        user={user}
        onBack={() => setScreen('main')}
        onChat={handleCarBook}
        onContactRenter={(car) => {
          const renter = car.activeBooking
          if (!renter) return
          handleChatOpen({
            id: `${renter.renterUid}_${car.id}`,
            isReal: true,
            car: { id: car.id, brand: car.brand, model: car.model, photo: car.photo, emoji: car.emoji, colorBg: car.colorBg, price: car.price },
            ownerUid: user.uid,
            ownerName: user.name,
            ownerInit: user.avatar,
            renterUid: renter.renterUid,
            renterName: renter.renterName,
            renterInit: renter.renterInit,
            currentPrice: renter.total,
          })
        }}
      />
    )
  } else if (screen === 'chat' && selectedChat) {
    content = (
      <ChatDetailScreen
        chat={selectedChat}
        user={user}
        role={role}
        onBack={handleBack}
        onDealAccepted={(offer) => handleDealAccepted(offer, selectedChat)}
      />
    )
  } else {
    content = (
      <div className="app-shell">
        <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
          {renderTab()}
        </div>
      </div>
    )
  }

  const hideNav = ['auth', 'onboarding', 'add-car', 'chat'].includes(screen)

  return (
    <div style={{ width: '100%', minHeight: '100dvh', position: 'relative', background: 'var(--bg)' }}>
      {content}
      {!hideNav && <BottomNav tab={tab} onTabChange={handleTabChange} />}
      <Toast toast={toast} onDismiss={() => setToast(null)} />
    </div>
  )
}
