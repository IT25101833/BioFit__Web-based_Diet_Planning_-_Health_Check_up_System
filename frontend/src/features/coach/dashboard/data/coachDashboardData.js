import { apiRequest } from '../../../../api/client'

export async function fetchCoachDashboard() {
  return apiRequest('/api/coach/dashboard')
}

export async function fetchCoachProfile() {
  return apiRequest('/api/coach/profile')
}

export async function updateCoachProfile(payload) {
  return apiRequest('/api/coach/profile', { method: 'PATCH', body: JSON.stringify(payload) })
}
