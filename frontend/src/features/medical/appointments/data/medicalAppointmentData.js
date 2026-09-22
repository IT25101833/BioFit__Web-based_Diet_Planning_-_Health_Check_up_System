import { apiRequest } from '../../../../api/client'

export async function fetchMedicalAppointments() {
  return apiRequest('/api/medical/appointments')
}

/** PATCH /api/medical/appointments/:id/attendance */
export async function markMedicalAppointmentAttendance(id, { attendance, note } = {}) {
  return apiRequest(`/api/medical/appointments/${encodeURIComponent(id)}/attendance`, {
    method: 'PATCH',
    body: JSON.stringify({
      attendance,
      ...(note != null && String(note).trim() !== '' ? { note: String(note).trim() } : {}),
    }),
  })
}
