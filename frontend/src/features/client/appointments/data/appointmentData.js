import { apiRequest, USE_MOCK } from '../../../../api/client'
export const appointments = [
  {
    id: 'apt-1',
    service: 'Fitness Consultation',
    professional: 'Maya Fernando',
    professionalRole: 'Fitness Coach',
    date: '2026-09-12',
    time: '10:00 AM',
    status: 'Upcoming',
    bookingReference: 'BF-APT-10421',
    notes:
      'Wear comfortable clothing. Bring any recent activity notes you would like to discuss.',
    location: 'VitalLife Wellness Centre · Studio 2',
  },
  {
    id: 'apt-2',
    service: 'Nutrition Consultation',
    professional: 'Maya Fernando',
    professionalRole: 'Nutrition Consultant',
    date: '2026-09-18',
    time: '2:30 PM',
    status: 'Upcoming',
    bookingReference: 'BF-APT-10458',
    notes: 'A light meal before the session is recommended.',
    location: 'VitalLife Wellness Centre · Consultation Room B',
  },
  {
    id: 'apt-3',
    service: 'Health Check-up',
    professional: 'Elena Costa',
    professionalRole: 'Medical Advisor',
    date: '2026-08-20',
    time: '9:15 AM',
    status: 'Completed',
    bookingReference: 'BF-APT-10210',
    notes: 'Routine wellness review completed.',
    location: 'VitalLife Wellness Centre · Health Suite',
  },
  {
    id: 'apt-4',
    service: 'Wellness Consultation',
    professional: 'Nova Dias',
    professionalRole: 'Wellness Advisor',
    date: '2026-08-05',
    time: '4:00 PM',
    status: 'Cancelled',
    bookingReference: 'BF-APT-10188',
    notes: 'Cancelled by client. Please rebook when convenient.',
    location: 'VitalLife Wellness Centre · Room 1',
  },
]

export const bookingServices = [
  {
    id: 'fitness',
    name: 'Fitness Consultation',
    description: 'Movement guidance and programme check-in with your coach.',
    duration: '45 min',
  },
  {
    id: 'nutrition',
    name: 'Nutrition Consultation',
    description: 'Meal rhythm support and dietary guidance.',
    duration: '45 min',
  },
  {
    id: 'checkup',
    name: 'Health Check-up',
    description: 'Scheduled wellness assessment with medical oversight.',
    duration: '60 min',
  },
  {
    id: 'medical',
    name: 'Medical Review',
    description: 'Follow-up discussion of your authorised health information.',
    duration: '30 min',
  },
  {
    id: 'wellness',
    name: 'Wellness Consultation',
    description: 'Holistic lifestyle support and goal setting.',
    duration: '40 min',
  },
]

export const bookingProfessionals = {
  fitness: [
    { id: 'maya', name: 'Maya Fernando', role: 'Fitness Coach' },
    { id: 'kasun', name: 'Daniel Perera', role: 'Fitness Coach' },
  ],
  nutrition: [
    { id: 'ruwan', name: 'Maya Fernando', role: 'Nutrition Consultant' },
    { id: 'amaya', name: 'Nova Dias', role: 'Nutrition Consultant' },
  ],
  checkup: [{ id: 'nimali', name: 'Elena Costa', role: 'Medical Advisor' }],
  medical: [{ id: 'nimali', name: 'Elena Costa', role: 'Medical Advisor' }],
  wellness: [
    { id: 'amaya', name: 'Nova Dias', role: 'Wellness Advisor' },
    { id: 'maya', name: 'Maya Fernando', role: 'Fitness Coach' },
  ],
}

export const availableSlots = [
  '9:00 AM',
  '10:00 AM',
  '11:30 AM',
  '1:00 PM',
  '2:30 PM',
  '4:00 PM',
]

function delay(ms = 420) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function formatAppointmentDate(isoDate) {
  if (!isoDate) return ''
  return new Date(`${isoDate}T00:00:00`).toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

/** GET /api/client/appointments */
export async function fetchClientAppointments() {
  if (USE_MOCK) {
    await delay()
    return appointments.map((item) => ({ ...item }))
  }
  return apiRequest('/api/client/appointments')
}

/** GET /api/client/appointments/:id */
export async function fetchClientAppointmentById(id) {
  if (USE_MOCK) {
    await delay()
    const found = appointments.find((item) => item.id === id)
    if (!found) throw new Error('Appointment not found')
    return { ...found }
  }
  return apiRequest(`/api/client/appointments/${id}`)
}

/** POST /api/client/appointments */
export async function createClientAppointment(payload) {
  if (USE_MOCK) {
    await delay(600)
    return {
      id: `apt-${Date.now()}`,
      bookingReference: `BF-APT-${Math.floor(10000 + Math.random() * 90000)}`,
      status: 'Upcoming',
      ...payload,
    }
  }
  return apiRequest('/api/client/appointments', { method: 'POST', body: JSON.stringify(payload) })
}

/** PATCH /api/client/appointments/:id/cancel */
export async function cancelClientAppointment(id) {
  if (USE_MOCK) {
    await delay(500)
    return { id, status: 'Cancelled' }
  }
  return apiRequest(`/api/client/appointments/${id}/cancel`, { method: 'PATCH' })
}
