import { apiRequest } from '../../../../api/client'
import { fetchNutritionClients } from '../../clients/data/nutritionClientData'

/** Load assignable clients from the backend (not hardcoded). */
export async function getMealPlanClientOptions() {
  const clients = await fetchNutritionClients()
  return (clients || []).map((c) => ({
    value: c.id,
    label: `${c.name} (${c.id})`,
    client: c,
  }))
}

export async function fetchMealPlans() {
  return apiRequest('/api/nutrition/meal-plans')
}

export async function fetchMealPlanById(id) {
  return apiRequest(`/api/nutrition/meal-plans/${id}`)
}

export async function createMealPlan(payload) {
  return apiRequest('/api/nutrition/meal-plans', { method: 'POST', body: JSON.stringify(payload) })
}

export async function updateMealPlan(id, payload) {
  return apiRequest(`/api/nutrition/meal-plans/${id}`, { method: 'PUT', body: JSON.stringify(payload) })
}

export async function archiveMealPlan(id) {
  return apiRequest(`/api/nutrition/meal-plans/${id}/archive`, { method: 'PATCH' })
}

/** DELETE /api/nutrition/meal-plans/:id — unused Draft only */
export async function hardDeleteMealPlan(id) {
  return apiRequest(`/api/nutrition/meal-plans/${id}`, { method: 'DELETE' })
}

export function canHardDeleteMealPlan(plan) {
  if (!plan || String(plan.status || '').toLowerCase() !== 'draft') return false
  if (plan.clientUserId != null && String(plan.clientUserId).trim() !== '') return false
  if (plan.clientId && String(plan.clientId).trim() !== '') return false
  if (Number(plan.progress || 0) > 0) return false
  return true
}

export async function duplicateMealPlan(id) {
  return apiRequest(`/api/nutrition/meal-plans/${id}/duplicate`, { method: 'POST' })
}
