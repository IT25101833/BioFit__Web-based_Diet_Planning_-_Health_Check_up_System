import {
  computeDayAvailability,
  defaultWeeklyHours,
  parseDurationMinutes,
  validateBookingSlot,
} from './bookingEngine'

const STORAGE_KEY = 'biofit.booking.v1'

const ROLE_LABELS = {
  WELLNESS_CENTRE_MANAGER: 'Wellness Centre Manager',
  FITNESS_COACH: 'Fitness Coach',
  NUTRITION_CONSULTANT: 'Nutrition Consultant',
  MEDICAL_ADVISOR: 'Medical Advisor',
  CUSTOMER_EXPERIENCE_OFFICER: 'Customer Experience Officer',
  DIGITAL_OPERATIONS_EXECUTIVE: 'Digital Operations Executive',
}

export const BOOKABLE_PROFESSIONALS = [
  {
    id: 'mgr-sarah',
    userId: 2,
    name: 'Sarah Williams',
    role: ROLE_LABELS.WELLNESS_CENTRE_MANAGER,
    roleKey: 'WELLNESS_CENTRE_MANAGER',
    audience: 'STAFF',
    services: ['staff-meeting', 'ops-review'],
  },
  {
    id: 'coach-daniel',
    userId: 3,
    name: 'Daniel Perera',
    role: ROLE_LABELS.FITNESS_COACH,
    roleKey: 'FITNESS_COACH',
    audience: 'CLIENT',
    services: ['fitness', 'wellness'],
  },
  {
    id: 'nutri-maya',
    userId: 4,
    name: 'Maya Fernando',
    role: ROLE_LABELS.NUTRITION_CONSULTANT,
    roleKey: 'NUTRITION_CONSULTANT',
    audience: 'CLIENT',
    services: ['nutrition', 'wellness'],
  },
  {
    id: 'ops-jordan',
    userId: 5,
    name: 'Jordan Lee',
    role: ROLE_LABELS.DIGITAL_OPERATIONS_EXECUTIVE,
    roleKey: 'DIGITAL_OPERATIONS_EXECUTIVE',
    audience: 'CLIENT',
    services: ['ops-support'],
  },
  {
    id: 'cx-priya',
    userId: 6,
    name: 'Priya Nair',
    role: ROLE_LABELS.CUSTOMER_EXPERIENCE_OFFICER,
    roleKey: 'CUSTOMER_EXPERIENCE_OFFICER',
    audience: 'CLIENT',
    services: ['support', 'wellness'],
  },
  {
    id: 'med-elena',
    userId: 7,
    name: 'Elena Costa',
    role: ROLE_LABELS.MEDICAL_ADVISOR,
    roleKey: 'MEDICAL_ADVISOR',
    audience: 'CLIENT',
    services: ['checkup', 'medical'],
  },
]

export const BOOKING_SERVICES = [
  {
    id: 'fitness',
    name: 'Fitness Consultation',
    description: 'Movement guidance and programme check-in with your coach.',
    duration: '45 min',
    forAudience: 'CLIENT',
  },
  {
    id: 'nutrition',
    name: 'Nutrition Consultation',
    description: 'Meal rhythm support and dietary guidance.',
    duration: '45 min',
    forAudience: 'CLIENT',
  },
  {
    id: 'checkup',
    name: 'Health Check-up',
    description: 'Scheduled wellness assessment with medical oversight.',
    duration: '60 min',
    forAudience: 'CLIENT',
  },
  {
    id: 'medical',
    name: 'Medical Review',
    description: 'Follow-up discussion of your authorised health information.',
    duration: '30 min',
    forAudience: 'CLIENT',
  },
  {
    id: 'wellness',
    name: 'Wellness Consultation',
    description: 'Holistic lifestyle support and goal setting.',
    duration: '40 min',
    forAudience: 'CLIENT',
  },
  {
    id: 'support',
    name: 'Customer Experience Session',
    description: 'Help with bookings, programmes, or centre experience.',
    duration: '30 min',
    forAudience: 'CLIENT',
  },
  {
    id: 'ops-support',
    name: 'Digital Operations Support',
    description: 'Platform access and digital service assistance.',
    duration: '30 min',
    forAudience: 'CLIENT',
  },
  {
    id: 'staff-meeting',
    name: 'Manager Check-in',
    description: 'Staff meeting with the Wellness Centre Manager.',
    duration: '30 min',
    forAudience: 'STAFF',
  },
  {
    id: 'ops-review',
    name: 'Operations Review',
    description: 'Centre operations and staffing discussion with the manager.',
    duration: '45 min',
    forAudience: 'STAFF',
  },
]

function seedState() {
  const weeklyHours = {}
  for (const pro of BOOKABLE_PROFESSIONALS) {
    if (pro.roleKey === 'MEDICAL_ADVISOR') {
      weeklyHours[pro.id] = defaultWeeklyHours('5:00 AM', '5:00 PM')
    } else if (pro.roleKey === 'WELLNESS_CENTRE_MANAGER') {
      weeklyHours[pro.id] = defaultWeeklyHours('8:00 AM', '6:00 PM')
    } else {
      weeklyHours[pro.id] = defaultWeeklyHours('9:00 AM', '5:00 PM')
    }
  }

  const today = new Date()
  const sampleDate = new Date(today)
  sampleDate.setDate(today.getDate() + 2)
  while (sampleDate.getDay() === 0) sampleDate.setDate(sampleDate.getDate() + 1)
  const sampleIso = sampleDate.toISOString().slice(0, 10)

  return {
    weeklyHours,
    blocks: [
      {
        id: 'blk-1',
        professionalId: 'med-elena',
        date: sampleIso,
        start: '2:00 PM',
        end: '3:00 PM',
        reason: 'Unavailable',
      },
    ],
    bookings: [
      {
        id: 'apt-seed-1',
        professionalId: 'coach-daniel',
        professional: 'Daniel Perera',
        professionalRole: 'Fitness Coach',
        professionalUserId: 3,
        service: 'Fitness Consultation',
        serviceId: 'fitness',
        date: sampleIso,
        time: '10:00 AM',
        duration: '45 min',
        status: 'Upcoming',
        clientName: 'Alex Morgan',
        clientUserId: 1,
        bookingReference: 'BF-APT-10421',
        notes: 'Wear comfortable clothing.',
        location: 'VitalLife Wellness Centre · Studio 2',
      },
      {
        id: 'apt-seed-2',
        professionalId: 'med-elena',
        professional: 'Elena Costa',
        professionalRole: 'Medical Advisor',
        professionalUserId: 7,
        service: 'Health Check-up',
        serviceId: 'checkup',
        date: sampleIso,
        time: '6:30 AM',
        duration: '60 min',
        status: 'Upcoming',
        clientName: 'Alex Morgan',
        clientUserId: 1,
        bookingReference: 'BF-APT-10458',
        notes: 'Routine wellness review.',
        location: 'VitalLife Wellness Centre · Health Suite',
      },
    ],
    notifications: [],
  }
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (parsed?.weeklyHours && parsed?.bookings) return parsed
    }
  } catch {
    /* ignore */
  }
  const seeded = seedState()
  saveState(seeded)
  return seeded
}

function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  window.dispatchEvent(new CustomEvent('biofit:booking-updated', { detail: state }))
}

let state = loadState()

export function getBookingState() {
  return state
}

export function resetBookingStore() {
  state = seedState()
  saveState(state)
  return state
}

export function listProfessionals({ audience = 'CLIENT', serviceId } = {}) {
  return BOOKABLE_PROFESSIONALS.filter((p) => {
    if (audience === 'CLIENT' && p.audience !== 'CLIENT') return false
    if (audience === 'STAFF' && p.roleKey !== 'WELLNESS_CENTRE_MANAGER') return false
    if (serviceId && !p.services.includes(serviceId)) return false
    return true
  })
}

export function listServices(audience = 'CLIENT') {
  return BOOKING_SERVICES.filter((s) => s.forAudience === audience)
}

export function getProfessionalAvailability(professionalId, dateIso, duration = '45 min') {
  const weeklyHours = state.weeklyHours[professionalId] || defaultWeeklyHours()
  const blocks = state.blocks.filter((b) => b.professionalId === professionalId)
  const bookings = state.bookings.filter((b) => b.professionalId === professionalId)
  return computeDayAvailability({
    dateIso,
    weeklyHours,
    blocks,
    bookings,
    durationMinutes: parseDurationMinutes(duration),
  })
}

export function createMockBooking(payload) {
  const professional =
    BOOKABLE_PROFESSIONALS.find((p) => p.id === payload.professionalId) ||
    BOOKABLE_PROFESSIONALS.find((p) => p.name === payload.professional)

  if (!professional) {
    throw new Error('Please select a professional.')
  }

  const duration = payload.duration || '45 min'
  const weeklyHours = state.weeklyHours[professional.id] || defaultWeeklyHours()
  const blocks = state.blocks.filter((b) => b.professionalId === professional.id)
  const bookings = state.bookings.filter((b) => b.professionalId === professional.id)

  const check = validateBookingSlot({
    dateIso: payload.date,
    timeLabel: payload.time,
    durationMinutes: parseDurationMinutes(duration),
    weeklyHours,
    blocks,
    bookings,
  })

  if (!check.ok) {
    const err = new Error(check.message)
    err.code = 'SLOT_UNAVAILABLE'
    throw err
  }

  const created = {
    id: `apt-${Date.now()}`,
    bookingReference: `BF-APT-${Math.floor(10000 + Math.random() * 90000)}`,
    status: 'Upcoming',
    professionalId: professional.id,
    professional: professional.name,
    professionalRole: professional.role,
    professionalUserId: professional.userId,
    service: payload.service,
    serviceId: payload.serviceId,
    date: payload.date,
    time: payload.time,
    duration,
    notes: payload.notes || 'Please arrive 10 minutes early for check-in.',
    location: payload.location || 'VitalLife Wellness Centre',
    clientName: payload.clientName || 'Alex Morgan',
    clientUserId: payload.clientUserId || 1,
    audience: payload.audience || 'CLIENT',
  }

  state = {
    ...state,
    bookings: [...state.bookings, created],
    notifications: [
      {
        id: `ntf-${Date.now()}`,
        userId: professional.userId,
        audience: professional.roleKey,
        type: 'appointments',
        title: 'New appointment booked',
        body: `${created.clientName} booked ${created.service} on ${created.date} at ${created.time}.`,
        link: '/notifications',
        read: false,
        createdAt: new Date().toISOString(),
        popup: true,
      },
      ...state.notifications,
    ],
  }
  saveState(state)
  return created
}

export function getAvailabilityProfile(professionalId) {
  return {
    professionalId,
    weeklyHours: state.weeklyHours[professionalId] || defaultWeeklyHours(),
    blocks: state.blocks.filter((b) => b.professionalId === professionalId),
  }
}

export function saveWeeklyHours(professionalId, weeklyHours) {
  state = {
    ...state,
    weeklyHours: { ...state.weeklyHours, [professionalId]: weeklyHours },
  }
  saveState(state)
  return getAvailabilityProfile(professionalId)
}

export function addAvailabilityBlock(block) {
  const entry = {
    id: `blk-${Date.now()}`,
    reason: 'Unavailable',
    ...block,
  }
  state = { ...state, blocks: [...state.blocks, entry] }
  saveState(state)
  return entry
}

export function removeAvailabilityBlock(blockId) {
  state = { ...state, blocks: state.blocks.filter((b) => b.id !== blockId) }
  saveState(state)
  return { id: blockId, removed: true }
}

export function listMockBookingsForClient() {
  return state.bookings
    .filter((b) => b.audience !== 'STAFF' || b.clientUserId === 1)
    .map((b) => ({ ...b }))
}

export function listPendingBookingPopups(userId) {
  return state.notifications.filter(
    (n) => n.popup && !n.read && (!userId || Number(n.userId) === Number(userId)),
  )
}

export function markBookingNotificationRead(id) {
  state = {
    ...state,
    notifications: state.notifications.map((n) =>
      n.id === id ? { ...n, read: true, popup: false } : n,
    ),
  }
  saveState(state)
  return { id, read: true }
}

export function findProfessionalByRoleKey(roleKey) {
  return BOOKABLE_PROFESSIONALS.find((p) => p.roleKey === roleKey)
}

export function findProfessionalByUserId(userId) {
  return BOOKABLE_PROFESSIONALS.find((p) => Number(p.userId) === Number(userId))
}
