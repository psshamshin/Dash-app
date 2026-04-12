import { cars } from './cars.js'

export const quickReplies = [
  { id: 'raise',    label: '📈  +฿100',      text: "I'd like to raise the price by ฿100. Does that work?",         type: 'price',   delta: +100 },
  { id: 'lower',    label: '📉  −฿100',      text: "Could we lower the price by ฿100? I'd really appreciate it.",  type: 'price',   delta: -100 },
  { id: 'book',     label: '🚗  Book now',   text: "I'd like to book this car. Confirming now! 🚗",                type: 'primary', delta: 0   },
  { id: 'discount', label: '🏷️  −10% off',  text: "Would you consider a 10% discount for my rental?",             type: 'price',   delta: 0   },
  { id: 'accept',   label: '✅  Accept',     text: "I accept your offer. Let's go! ✅",                            type: 'success', delta: 0   },
  { id: 'decline',  label: '❌  Decline',    text: "Sorry, the current offer doesn't work for me.",                type: 'danger',  delta: 0   },
  { id: 'avail',    label: '📅  Available?', text: "Is the car available for my selected dates?",                  type: '',        delta: 0   },
  { id: 'tmrw',     label: '⏳  Tomorrow',   text: "I'll confirm the booking by tomorrow. Thank you!",             type: '',        delta: 0   },
]

const now = new Date()
const ago = (mins) => new Date(now - mins * 60000)

export const initChats = [
  {
    id: 'c1',
    car: cars[0],
    otherName: 'Arjun M.',
    otherInit: 'AM',
    otherColor: cars[0].color,
    currentPrice: 1800,
    messages: [
      { id: 'm1', text: 'Hello! The Mercedes is clean and fully insured. When do you need it?', me: false, time: ago(130) },
      { id: 'm2', text: "Could we lower the price by ฿100? I'd really appreciate it.", me: true, time: ago(115) },
      { id: 'm3', text: 'Sure! ฿1700/day for you. Happy to help 😊', me: false, time: ago(90) },
    ],
  },
  {
    id: 'c2',
    car: cars[1],
    otherName: 'Nanthida K.',
    otherInit: 'NK',
    otherColor: cars[1].color,
    currentPrice: 1400,
    messages: [
      { id: 'm4', text: 'Is the car available for my selected dates?', me: true, time: ago(1440) },
      { id: 'm5', text: 'Yes! The CR-V is free. Great for exploring Chiang Mai 🏔️', me: false, time: ago(1380) },
    ],
  },
  {
    id: 'c3',
    car: cars[7],
    otherName: 'Elena V.',
    otherInit: 'EV',
    otherColor: cars[7].color,
    currentPrice: 2400,
    messages: [
      { id: 'm6', text: 'The BMW is available. Pick-up in Bangkok CBD, fully insured.', me: false, time: ago(300) },
    ],
  },
]
