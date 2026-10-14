import { apiRequest } from '../../../../api/client'

/** GET /api/client/workout-plan — returns null/empty when unassigned */
export async function fetchClientWorkoutPlan() {
  return apiRequest('/api/client/workout-plan')
}

/** PATCH /api/client/workout-plan/sessions/:id — persists completion for this client only */
export async function completeClientWorkoutSession(sessionId) {
  return apiRequest(`/api/client/workout-plan/sessions/${encodeURIComponent(sessionId)}`, {
    method: 'PATCH',
    body: JSON.stringify({ status: 'COMPLETED' }),
  })
}

/** GET /api/client/fitness-progress */
export async function fetchClientFitnessProgress() {
  return apiRequest('/api/client/fitness-progress')
}
