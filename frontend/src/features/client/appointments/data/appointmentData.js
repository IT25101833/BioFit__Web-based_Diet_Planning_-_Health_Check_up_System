import { apiRequest, USE_MOCK } from '../../../../api/client'
import { buildUpcomingDates } from '../../../booking/bookingEngine'
import {
  BOOKING_SERVICES,
  createMockBooking,
  getProfessionalAvailability,
  listMockBookingsForClient,
  listProfessionals,
  listServices,
} from '../../../booking/bookingStore'

export const appointments = [
  {
    id: 'apt-1',
    service: 'Fitness Consultation',
    professional: 'Maya Fernando',
    professionalRole: 'Nutrition Consultant',
    date: '2026-09-12',
    time: '10:00 AM',
    status: 'Upcoming',
    bookingReference: 'BF-APT-10421',
    notes:
      'Wear comfortable clothing. Bring any recent activity notes you would like to discuss.',
    location: 'VitalLife Wellness Centre · Studio 2',
  },
]

/** @deprecated use listServices / fetchBookingCatalog */
export const bookingServices = BOOKING_SERVICES.filter((s) => s.forAudience === 'CLIENT')

/** @deprecated use listProfessionals */
export const bookingProfessionals = {}

/** @deprecated use fetchProfessionalAvailability */
export const availableSlots = []

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

export function getBookingDateOptions() {
  return buildUpcomingDates(21)
}

/** GET /api/client/booking/catalog or /api/staff/booking/catalog */
export async function fetchBookingCatalog(audience = 'CLIENT') {
  if (USE_MOCK) {
    await delay(200)
    return {
      services: listServices(audience),
      professionals: listProfessionals({ audience }),
    }
  }
  const base = audience === 'STAFF' ? '/api/staff' : '/api/client'
  return apiRequest(`${base}/booking/catalog?audience=${encodeURIComponent(audience)}`)
}

/** GET availability for a professional on a date */
export async function fetchProfessionalAvailability({
  professionalId,
  date,
  duration = '45 min',
  audience = 'CLIENT',
}) {
  if (USE_MOCK) {
    await delay(180)
    return getProfessionalAvailability(professionalId, date, duration)
  }
  const params = new URLSearchParams({
    professionalId,
    date,
    duration: String(duration),
  })
  const base = audience === 'STAFF' ? '/api/staff' : '/api/client'
  return apiRequest(`${base}/booking/availability?${params}`)
}

/** GET /api/client/appointments */
export async function fetchClientAppointments() {
  if (USE_MOCK) {
    await delay()
    return listMockBookingsForClient()
  }
  return apiRequest('/api/client/appointments')
}

/** GET /api/client/appointments/:id */
export async function fetchClientAppointmentById(id) {
  if (USE_MOCK) {
    await delay()
    const found = listMockBookingsForClient().find((item) => item.id === id)
    if (!found) throw new Error('Appointment not found')
    return { ...found }
  }
  return apiRequest(`/api/client/appointments/${id}`)
}

/** POST /api/client/appointments or /api/staff/appointments */
export async function createClientAppointment(payload) {
  if (USE_MOCK) {
    await delay(500)
    return createMockBooking(payload)
  }
  const path =
    payload?.audience === 'STAFF' ? '/api/staff/appointments' : '/api/client/appointments'
  return apiRequest(path, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

/** PATCH /api/client/appointments/:id/cancel */
export async function cancelClientAppointment(id) {
  if (USE_MOCK) {
    await delay(500)
    return { id, status: 'Cancelled' }
  }
  return apiRequest(`/api/client/appointments/${id}/cancel`, { method: 'PATCH' })
}
