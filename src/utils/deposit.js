const OPTIONAL_KEYS = ['drivingHistory', 'pastBookings', 'houseRegistration', 'incomeStatement']

// Base deposit is determined by car daily price
export function calcBaseDeposit(carPrice) {
  if (carPrice > 2000) return 8000
  if (carPrice >= 1000) return 5000
  return 3000
}

// Returns discount percentage from optional docs (5% each, max 20% with 4 docs)
export function calcDepositDiscount(documents) {
  return OPTIONAL_KEYS.filter(k => documents?.[k]).length * 5
}

// Final deposit = base × (1 − discount%), rounded to nearest ฿100
export function calcFinalDeposit(carPrice, documents) {
  const base = calcBaseDeposit(carPrice || 0)
  const pct  = calcDepositDiscount(documents)
  return Math.round(base * (1 - pct / 100) / 100) * 100
}

export function depositTierLabel(amount) {
  if (amount < 3000) return 'Low'
  if (amount <= 6000) return 'Standard'
  return 'High'
}

export function depositTierColor(amount) {
  if (amount < 3000) return '#22c55e'
  if (amount <= 6000) return '#f59e0b'
  return '#ef4444'
}
