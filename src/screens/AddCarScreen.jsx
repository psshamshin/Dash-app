import { useState, useRef } from 'react'

const CATEGORIES = ['Sedan', 'SUV', 'Hatchback', 'Pickup', 'Van', 'Luxury', 'Electric']
const FUELS      = ['Petrol', 'Diesel', 'Electric', 'Hybrid']
const TRANS      = ['Automatic', 'Manual']

export default function AddCarScreen({ user, onPublish, onBack }) {
  const [photo,        setPhoto]        = useState(null)
  const [brand,        setBrand]        = useState('')
  const [model,        setModel]        = useState('')
  const [year,         setYear]         = useState('2023')
  const [category,     setCategory]     = useState('Sedan')
  const [price,        setPrice]        = useState('1500')
  const [location,     setLocation]     = useState('')
  const [seats,        setSeats]        = useState('5')
  const [fuel,         setFuel]         = useState('Petrol')
  const [transmission, setTransmission] = useState('Automatic')
  const [description,  setDescription]  = useState('')
  const [publishing,   setPublishing]   = useState(false)
  const fileRef = useRef(null)

  function handlePhoto(e) {
    const file = e.target.files[0]
    if (!file) return
    // reset so the same file can be re-selected after clearing
    e.target.value = ''
    const reader = new FileReader()
    reader.onload = ev => setPhoto(ev.target.result)
    reader.readAsDataURL(file)
  }

  function publish(e) {
    e.preventDefault()
    if (!brand || !model || !location) return
    setPublishing(true)
    setTimeout(() => {
      const newCar = {
        id: Date.now(),
        brand, model, year: +year,
        price: +price,
        category, location, seats: +seats,
        fuel, transmission,
        fuelUsage: fuel === 'Electric' ? 'N/A' : '9 l/100km',
        owner: user.name,
        ownerInit: user.avatar,
        rating: 5.0,
        reviews: 0,
        distance: '0.5 km',
        eta: '5 min',
        color: '#f97316',
        colorBg: 'rgba(249,115,22,0.15)',
        emoji: '🚗',
        photo,
        trips: 0,
        isAvailable: true,
        activity: [],
        description,
        isOwn: true,
      }
      setPublishing(false)
      onPublish(newCar)
    }, 1000)
  }

  const canPublish = brand && model && location && !publishing

  return (
    <div style={{ minHeight: '100dvh', background: '#0a0a0a', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', padding: '16px 16px 8px', gap: 10, background: '#111', borderBottom: '1px solid rgba(255,255,255,0.07)', position: 'sticky', top: 0, zIndex: 10 }}>
        <button onClick={onBack} style={{ width: 36, height: 36, borderRadius: 10, border: 'none', background: 'rgba(255,255,255,0.07)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '1rem', flexShrink: 0 }}>←</button>
        <span style={{ flex: 1, fontSize: '1rem', fontWeight: 700, color: '#fff' }}>Add your car</span>
        <button
          onClick={publish}
          disabled={!canPublish}
          style={{
            padding: '8px 18px', borderRadius: 100, border: 'none',
            background: canPublish ? '#f97316' : 'rgba(255,255,255,0.08)',
            color: canPublish ? '#fff' : 'rgba(255,255,255,0.25)',
            fontFamily: 'inherit', fontSize: '0.82rem', fontWeight: 700,
            cursor: canPublish ? 'pointer' : 'default', transition: 'all .2s',
          }}
        >
          {publishing ? 'Publishing…' : 'Publish'}
        </button>
      </div>

      <div style={{ overflowY: 'auto', flex: 1, paddingBottom: 40 }}>
        {/* Photo upload — single input, iOS shows native sheet (Take Photo / Library) */}
        <div
          onClick={() => fileRef.current?.click()}
          style={{ position: 'relative', background: '#111', borderBottom: '1px solid rgba(255,255,255,0.07)', cursor: 'pointer' }}
        >
          <div style={{ height: 220, position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
            {photo ? (
              <>
                <img src={photo} alt="car" style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }} />
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)', padding: '9px 18px', borderRadius: 100, fontSize: '0.82rem', color: '#fff', fontWeight: 600 }}>
                    📷 Change photo
                  </div>
                </div>
              </>
            ) : (
              <>
                <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem' }}>
                  📷
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '0.88rem', color: 'rgba(255,255,255,0.6)', fontWeight: 600 }}>Add car photo</div>
                  <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.25)', marginTop: 3 }}>Tap to take photo or choose from library</div>
                </div>
              </>
            )}
          </div>
        </div>

        <input ref={fileRef} type="file" accept="image/*" onChange={handlePhoto} style={{ display: 'none' }} />

        <div style={{ padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 18 }}>
          {/* Brand + Model */}
          <Row>
            <Field label="Brand"  value={brand}  onChange={setBrand}  placeholder="e.g. Toyota" />
            <Field label="Model"  value={model}  onChange={setModel}  placeholder="e.g. Camry" />
          </Row>

          {/* Year + Price */}
          <Row>
            <Field label="Year"        value={year}  onChange={setYear}  placeholder="2023" type="number" />
            <Field label="Price / day (฿)" value={price} onChange={setPrice} placeholder="1500"  type="number" />
          </Row>

          {/* Category */}
          <div>
            <Label>Category</Label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
              {CATEGORIES.map(c => (
                <button key={c} onClick={() => setCategory(c)} style={{
                  padding: '7px 14px', borderRadius: 100, border: 'none',
                  background: category === c ? 'rgba(249,115,22,0.15)' : 'rgba(255,255,255,0.06)',
                  color: category === c ? '#f97316' : 'rgba(255,255,255,0.45)',
                  fontFamily: 'inherit', fontSize: '0.8rem', fontWeight: 600,
                  cursor: 'pointer', transition: 'all .15s',
                  border: category === c ? '1px solid rgba(249,115,22,0.3)' : '1px solid transparent',
                }}>
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Location */}
          <Field label="Pick-up location" value={location} onChange={setLocation} placeholder="e.g. Bangkok CBD" />

          {/* Specs row */}
          <Row>
            <Field label="Seats" value={seats} onChange={setSeats} placeholder="5" type="number" />
            <div style={{ flex: 1 }}>
              <Label>Fuel</Label>
              <select value={fuel} onChange={e => setFuel(e.target.value)} style={{ marginTop: 6, padding: '11px 14px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 12, color: '#fff', fontFamily: 'inherit', fontSize: '0.88rem', outline: 'none', width: '100%' }}>
                {FUELS.map(f => <option key={f} value={f} style={{ background: '#1c1c1c' }}>{f}</option>)}
              </select>
            </div>
          </Row>

          {/* Transmission */}
          <div>
            <Label>Transmission</Label>
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              {TRANS.map(t => (
                <button key={t} onClick={() => setTransmission(t)} style={{
                  flex: 1, padding: '10px', borderRadius: 100, border: 'none',
                  background: transmission === t ? 'rgba(249,115,22,0.15)' : 'rgba(255,255,255,0.06)',
                  color: transmission === t ? '#f97316' : 'rgba(255,255,255,0.45)',
                  fontFamily: 'inherit', fontSize: '0.85rem', fontWeight: 600,
                  cursor: 'pointer', transition: 'all .15s',
                  border: transmission === t ? '1px solid rgba(249,115,22,0.3)' : '1px solid transparent',
                }}>
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <Label>Description (optional)</Label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Describe your car — condition, extras, rules…"
              rows={3}
              style={{
                marginTop: 8, width: '100%', padding: '12px 14px',
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.09)',
                borderRadius: 12, color: '#fff',
                fontFamily: 'inherit', fontSize: '0.88rem',
                outline: 'none', resize: 'none', lineHeight: 1.5,
              }}
              onFocus={e => e.target.style.borderColor = 'rgba(249,115,22,0.6)'}
              onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.09)'}
            />
          </div>

          <button
            onClick={publish}
            disabled={!canPublish}
            style={{
              width: '100%', padding: '15px', borderRadius: 100, border: 'none',
              background: canPublish ? '#f97316' : 'rgba(255,255,255,0.08)',
              color: canPublish ? '#fff' : 'rgba(255,255,255,0.25)',
              fontFamily: 'inherit', fontSize: '0.95rem', fontWeight: 700,
              cursor: canPublish ? 'pointer' : 'default', transition: 'all .2s',
            }}
          >
            {publishing ? 'Publishing…' : '🚗 Publish listing'}
          </button>
        </div>
      </div>
    </div>
  )
}

function Field({ label, value, onChange, placeholder, type = 'text' }) {
  return (
    <div style={{ flex: 1 }}>
      <Label>{label}</Label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          marginTop: 6, width: '100%', padding: '11px 14px',
          background: 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(255,255,255,0.09)',
          borderRadius: 12, color: '#fff',
          fontFamily: 'inherit', fontSize: '0.88rem', outline: 'none', boxShadow: 'none',
          transition: 'border-color .2s',
        }}
        onFocus={e => e.target.style.borderColor = 'rgba(249,115,22,0.6)'}
        onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.09)'}
      />
    </div>
  )
}

function Label({ children }) {
  return <div style={{ fontSize: '0.74rem', color: 'rgba(255,255,255,0.4)', fontWeight: 500 }}>{children}</div>
}

function Row({ children }) {
  return <div style={{ display: 'flex', gap: 12 }}>{children}</div>
}
