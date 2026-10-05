import { apiRequest } from '../../../../api/client'

export async function fetchNutritionDashboard() {
  return apiRequest('/api/nutrition/dashboard')
}

export async function fetchNutritionProfile() {
  return apiRequest('/api/nutrition/profile')
}

export async function updateNutritionProfile(payload) {
  return apiRequest('/api/nutrition/profile', { method: 'PATCH', body: JSON.stringify(payload) })
}
