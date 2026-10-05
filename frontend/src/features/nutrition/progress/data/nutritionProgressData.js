import { apiRequest } from '../../../../api/client'

export async function fetchNutritionProgressRows() {
  return apiRequest('/api/nutrition/progress')
}

export async function fetchNutritionClientProgress(clientId) {
  return apiRequest(`/api/nutrition/progress/${clientId}`)
}

export async function saveNutritionProgress(payload) {
  return apiRequest('/api/nutrition/progress', { method: 'POST', body: JSON.stringify(payload) })
}
