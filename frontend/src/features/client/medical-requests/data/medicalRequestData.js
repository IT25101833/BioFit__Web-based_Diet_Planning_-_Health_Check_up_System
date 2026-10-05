import { apiRequest } from '../../../../api/client'

export function fetchMedicalAdvisors() {
  return apiRequest('/api/client/medical-advisors')
}

export function fetchMedicalRequestTimeSlots() {
  return apiRequest('/api/client/medical-requests/time-slots')
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
