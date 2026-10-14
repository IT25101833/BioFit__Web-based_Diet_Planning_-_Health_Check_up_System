import { apiRequest } from '../../../../api/client'

export async function fetchCoachAppointments() {
  return apiRequest('/api/coach/appointments')
}

export async function markCoachAppointmentAttendance(id, { attendance, note } = {}) {
  return apiRequest(`/api/coach/appointments/${encodeURIComponent(id)}/attendance`, {
    method: 'PATCH',
    body: JSON.stringify({
      attendance,
      ...(note != null && String(note).trim() !== '' ? { note: String(note).trim() } : {}),
    }),
  })
}
