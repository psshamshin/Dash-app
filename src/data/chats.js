import { cars } from './cars.js'

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
    negotiationEnabled: true,
    messages: [
      { id: 'm1', type: 'text', text: 'Hello! The Mercedes is clean and fully insured. When do you need it?', me: false, time: ago(130) },
      { id: 'm2', type: 'text', text: "Could we lower the price a bit?", me: true, time: ago(115) },
      {
        id: 'm3',
        type: 'price_offer',
        me: false,
        time: ago(90),
        breakdown: { rental: 1500, insurance: 200, deposit: 100 },
        total: 1800,
        status: 'pending',
      },
    ],
  },
  {
    id: 'c2',
    car: cars[1],
    otherName: 'Nanthida K.',
    otherInit: 'NK',
    otherColor: cars[1].color,
    currentPrice: 1400,
    negotiationEnabled: true,
    messages: [
      { id: 'm4', type: 'text', text: 'Is the car available for my selected dates?', me: true, time: ago(1440) },
      { id: 'm5', type: 'text', text: 'Yes! The CR-V is free. Great for exploring Chiang Mai 🏔️', me: false, time: ago(1380) },
    ],
  },
  {
    id: 'c3',
    car: cars[7],
    otherName: 'Elena V.',
    otherInit: 'EV',
    otherColor: cars[7].color,
    currentPrice: 2400,
    negotiationEnabled: false,
    messages: [
      { id: 'm6', type: 'text', text: 'The BMW is available. Pick-up in Bangkok CBD, fully insured.', me: false, time: ago(300) },
    ],
  },
]
