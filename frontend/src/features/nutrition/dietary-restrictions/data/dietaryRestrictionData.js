import { apiRequest } from '../../../../api/client'

export async function fetchDietaryRestrictions() {
  return apiRequest('/api/nutrition/dietary-restrictions')
}

export async function fetchDietaryRestrictionsByClient(clientId) {
  return apiRequest(`/api/nutrition/dietary-restrictions/client/${clientId}`)
}

export async function createDietaryRestriction(payload) {
  return apiRequest('/api/nutrition/dietary-restrictions', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function updateDietaryRestriction(id, payload) {
  return apiRequest(`/api/nutrition/dietary-restrictions/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
}

export async function deactivateDietaryRestriction(id) {
  return apiRequest(`/api/nutrition/dietary-restrictions/${id}/deactivate`, { method: 'PATCH' })
}
