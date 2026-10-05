import { apiRequest } from '../../../../api/client'

/** GET /api/client/meal-plan — returns null/empty when unassigned */
export async function fetchClientMealPlan() {
  return apiRequest('/api/client/meal-plan')
}

/** GET /api/client/nutrition-progress */
export async function fetchClientNutritionProgress() {
  return apiRequest('/api/client/nutrition-progress')
}
