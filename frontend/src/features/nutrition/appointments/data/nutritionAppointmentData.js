import { apiRequest } from '../../../../api/client'

export async function fetchNutritionAppointments() {
  return apiRequest('/api/nutrition/appointments')
}

/** PATCH /api/nutrition/appointments/:id/attendance */
export async function markNutritionAppointmentAttendance(id, { attendance, note } = {}) {
  return apiRequest(`/api/nutrition/appointments/${encodeURIComponent(id)}/attendance`, {
    method: 'PATCH',
    body: JSON.stringify({
      attendance,
      ...(note != null && String(note).trim() !== '' ? { note: String(note).trim() } : {}),
    }),
  })
}
