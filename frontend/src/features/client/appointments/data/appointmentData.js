import { apiRequest } from '../../../../api/client'
import {
  buildUpcomingDates,
  formatMinutesToLabel,
  parseDurationMinutes,
  parseTimeToMinutes,
} from '../../../booking/bookingEngine'

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

export function isTodayAppointment(appointment, todayIso = new Date().toISOString().slice(0, 10)) {
  if (!appointment || isCancelledAppointment(appointment)) return false
  return String(appointment.date || '') === todayIso
}

export function isLaterAppointment(appointment, todayIso = new Date().toISOString().slice(0, 10)) {
  if (!isUpcomingAppointment(appointment, todayIso)) return false
  return String(appointment.date || '') > todayIso
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
  const base = audience === 'STAFF' ? '/api/staff' : '/api/client'
  return apiRequest(`${base}/appointments`)
}

/** GET /api/client/appointments/:id or /api/staff/appointments/:id */
export async function fetchClientAppointmentById(id, audience = 'CLIENT') {
  const base = audience === 'STAFF' ? '/api/staff' : '/api/client'
  return apiRequest(`${base}/appointments/${id}`)
}

/** POST /api/client/appointments or /api/staff/appointments */
export async function createClientAppointment(payload) {
  const path =
    payload?.audience === 'STAFF' ? '/api/staff/appointments' : '/api/client/appointments'
  return apiRequest(path, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

/** GET /api/client/review-requests/:id */
export async function fetchMedicalReviewRequest(id) {
  return apiRequest(`/api/client/review-requests/${encodeURIComponent(id)}`)
}

/** POST /api/client/review-requests/:id/book */
export async function bookMedicalReviewRequest(id, { time }) {
  return apiRequest(`/api/client/review-requests/${encodeURIComponent(id)}/book`, {
    method: 'POST',
    body: JSON.stringify({ time }),
  })
}

/** PATCH .../appointments/:id/cancel */
export async function cancelClientAppointment(id, audience = 'CLIENT') {
  const base = audience === 'STAFF' ? '/api/staff' : '/api/client'
  return apiRequest(`${base}/appointments/${id}/cancel`, { method: 'PATCH' })
}

/** PATCH .../appointments/:id/reschedule */
export async function rescheduleClientAppointment(id, payload, audience = 'CLIENT') {
  const base = audience === 'STAFF' ? '/api/staff' : '/api/client'
  return apiRequest(`${base}/appointments/${id}/reschedule`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
}
