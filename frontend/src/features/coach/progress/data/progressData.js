import { apiRequest } from '../../../../api/client'

export async function fetchProgressRows() {
  return apiRequest('/api/coach/progress')
}

export async function fetchClientProgress(clientId) {
  return apiRequest(`/api/coach/progress/${clientId}`)
}

export async function saveProgressRecord(payload) {
  return apiRequest('/api/coach/progress', { method: 'POST', body: JSON.stringify(payload) })
}
