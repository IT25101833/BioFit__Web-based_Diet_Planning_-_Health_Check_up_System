import { apiRequest } from '../../../../api/client'

/** GET /api/client/workout-plan — returns null/empty when unassigned */
export async function fetchClientWorkoutPlan() {
  return apiRequest('/api/client/workout-plan')
}

/** GET /api/client/fitness-progress */
export async function fetchClientFitnessProgress() {
  return apiRequest('/api/client/fitness-progress')
}
