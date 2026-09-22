import { apiRequest, USE_MOCK } from '../../../../api/client'
import {
  buildUpcomingDates,
  formatMinutesToLabel,
  parseDurationMinutes,
  parseTimeToMinutes,
} from '../../../booking/bookingEngine'
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

export function formatAppointmentDateLong(isoDate) {
  if (!isoDate) return ''
  return new Date(`${isoDate}T00:00:00`).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export function getAppointmentEndTime(appointment) {
  if (appointment?.endTime) return appointment.endTime
  const start = parseTimeToMinutes(appointment?.time)
  if (start == null) return null
  return formatMinutesToLabel(start + parseDurationMinutes(appointment?.duration))
}

export function formatAppointmentTimeRange(appointment) {
  if (!appointment?.time) return ''
  const end = getAppointmentEndTime(appointment)
  return end ? `${appointment.time} – ${end}` : appointment.time
}

export function formatDurationLabel(duration) {
  const mins = parseDurationMinutes(duration)
  return `${mins} min`
}

export function isPastAppointment(appointment, todayIso = new Date().toISOString().slice(0, 10)) {
  if (!appointment) return false
  if (String(appointment.status).toLowerCase() === 'completed') return true
  if (String(appointment.attendance || '').toUpperCase() === 'ATTENDED') return true
  if (isAdvisorUnavailableAppointment(appointment)) return false
  if (String(appointment.status).toLowerCase() === 'cancelled') return false
  if (!appointment.date) return false
  return String(appointment.date) < todayIso
}

export function isUpcomingAppointment(appointment, todayIso = new Date().toISOString().slice(0, 10)) {
  if (!appointment) return false
  if (isAdvisorUnavailableAppointment(appointment)) return false
  if (String(appointment.status).toLowerCase().startsWith('cancelled')) return false
  if (String(appointment.status).toLowerCase() === 'completed') return false
  if (String(appointment.attendance || '').toUpperCase() === 'ATTENDED') return false
  const status = String(appointment.status || '').toLowerCase()
  if (status !== 'upcoming' && status !== 'confirmed') return false
  if (!appointment.date) return true
  return String(appointment.date) >= todayIso
}

export function isAdvisorUnavailableAppointment(appointment) {
  if (!appointment) return false
  if (String(appointment.attendance || '').toUpperCase() === 'ADVISOR_UNAVAILABLE') return true
  return String(appointment.status || '').toLowerCase() === 'cancelled by advisor'
}

export function isCancelledAppointment(appointment) {
  if (!appointment) return false
  if (isAdvisorUnavailableAppointment(appointment)) return true
  return String(appointment.status || '').toLowerCase() === 'cancelled'
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
  excludeAppointmentId,
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
  if (excludeAppointmentId) params.set('excludeAppointmentId', excludeAppointmentId)
  const base = audience === 'STAFF' ? '/api/staff' : '/api/client'
  return apiRequest(`${base}/booking/availability?${params}`)
}

/** GET /api/client/appointments or /api/staff/appointments */
export async function fetchClientAppointments(audience = 'CLIENT') {
  if (USE_MOCK) {
    await delay()
    return listMockBookingsForClient()
  }
  const base = audience === 'STAFF' ? '/api/staff' : '/api/client'
  return apiRequest(`${base}/appointments`)
}

/** GET /api/client/appointments/:id or /api/staff/appointments/:id */
export async function fetchClientAppointmentById(id, audience = 'CLIENT') {
  if (USE_MOCK) {
    await delay()
    const found = listMockBookingsForClient().find((item) => item.id === id)
    if (!found) throw new Error('Appointment not found')
    return { ...found }
  }
  const base = audience === 'STAFF' ? '/api/staff' : '/api/client'
  return apiRequest(`${base}/appointments/${id}`)
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

/** PATCH .../appointments/:id/cancel */
export async function cancelClientAppointment(id, audience = 'CLIENT') {
  if (USE_MOCK) {
    await delay(500)
    return { id, status: 'Cancelled' }
  }
  const base = audience === 'STAFF' ? '/api/staff' : '/api/client'
  return apiRequest(`${base}/appointments/${id}/cancel`, { method: 'PATCH' })
}

/** PATCH .../appointments/:id/reschedule */
export async function rescheduleClientAppointment(id, payload, audience = 'CLIENT') {
  if (USE_MOCK) {
    await delay(500)
    return { id, ...payload, status: 'Upcoming' }
  }
  const base = audience === 'STAFF' ? '/api/staff' : '/api/client'
  return apiRequest(`${base}/appointments/${id}/reschedule`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
}
