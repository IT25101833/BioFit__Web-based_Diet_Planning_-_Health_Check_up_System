import { apiRequest } from '../../../../api/client'

export function fetchMedicalAdvisors() {
  return apiRequest('/api/client/medical-advisors')
}

export function fetchMedicalRequestTimeSlots(date) {
  const query = date ? `?date=${encodeURIComponent(date)}` : ''
  return apiRequest(`/api/client/medical-requests/time-slots${query}`)
}

export function fetchClientMedicalRequests() {
  return apiRequest('/api/client/medical-requests')
}

export function submitMedicalRequest(body) {
  return apiRequest('/api/client/medical-requests', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export function cancelClientMedicalRequest(id) {
  return apiRequest(`/api/client/medical-requests/${encodeURIComponent(id)}/cancel`, {
    method: 'POST',
  })
}

export function formatRequestDate(value) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return String(value).slice(0, 10)
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
}

export function formatPreferredDate(value) {
  if (!value) return '—'
  const match = String(value).match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (!match) return String(value)
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

export function todayIsoDate() {
  const now = new Date()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${now.getFullYear()}-${month}-${day}`
}

/** Monday–Saturday, 9:00 AM through 4:30 PM. Today's past times are left out. */
export function buildPreferredTimeSlots(isoDate) {
  if (!isoDate || !/^\d{4}-\d{2}-\d{2}$/.test(isoDate)) return []
  const [year, month, day] = isoDate.split('-').map(Number)
  const selected = new Date(year, month - 1, day)
  if (Number.isNaN(selected.getTime()) || selected.getDay() === 0) return []
  const startOfToday = new Date()
  startOfToday.setHours(0, 0, 0, 0)
  if (selected < startOfToday) return []
  const now = new Date()
  const isToday = selected.getTime() === startOfToday.getTime()
  const nowMinutes = now.getHours() * 60 + now.getMinutes()
  const slots = []
  for (let minutes = 9 * 60; minutes < 17 * 60; minutes += 30) {
    if (isToday && minutes <= nowMinutes) continue
    let hour = Math.floor(minutes / 60)
    const minute = minutes % 60
    const suffix = hour >= 12 ? 'PM' : 'AM'
    hour %= 12
    if (hour === 0) hour = 12
    slots.push(`${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')} ${suffix}`)
  }
  return slots
}
