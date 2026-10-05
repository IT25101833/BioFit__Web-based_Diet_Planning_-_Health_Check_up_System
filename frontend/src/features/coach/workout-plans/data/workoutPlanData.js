import { apiRequest } from '../../../../api/client'
import { fetchCoachClients } from '../../clients/data/clientFitnessData'

/** Load assignable clients from the backend (not hardcoded). */
export async function getClientOptions() {
  const clients = await fetchCoachClients()
  return (clients || []).map((c) => ({
    value: c.id,
    label: `${c.name} (${c.id})`,
    client: c,
  }))
}

export async function fetchWorkoutPlans() {
  return apiRequest('/api/coach/workout-plans')
}

export async function fetchWorkoutPlanById(id) {
  return apiRequest(`/api/coach/workout-plans/${id}`)
}

export async function createWorkoutPlan(payload) {
  return apiRequest('/api/coach/workout-plans', { method: 'POST', body: JSON.stringify(payload) })
}

export async function updateWorkoutPlan(id, payload) {
  return apiRequest(`/api/coach/workout-plans/${id}`, { method: 'PUT', body: JSON.stringify(payload) })
}

export async function archiveWorkoutPlan(id) {
  return apiRequest(`/api/coach/workout-plans/${id}/archive`, { method: 'PATCH' })
}

/** DELETE /api/coach/workout-plans/:id — unused Draft only */
export async function hardDeleteWorkoutPlan(id) {
  return apiRequest(`/api/coach/workout-plans/${id}`, { method: 'DELETE' })
}

export function canHardDeleteWorkoutPlan(plan) {
  if (!plan || String(plan.status || '').toLowerCase() !== 'draft') return false
  if (plan.clientUserId != null && String(plan.clientUserId).trim() !== '') return false
  if (plan.clientId && String(plan.clientId).trim() !== '') return false
  if (Number(plan.progress || 0) > 0) return false
  return true
}

export async function duplicateWorkoutPlan(id) {
  return apiRequest(`/api/coach/workout-plans/${id}/duplicate`, { method: 'POST' })
}
