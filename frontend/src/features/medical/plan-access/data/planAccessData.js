import { apiRequest } from '../../../../api/client'

export async function fetchPlanAccessStatus(clientUserId) {
  return apiRequest(`/api/medical/plan-access?clientUserId=${encodeURIComponent(clientUserId)}`)
}

export async function requestPlanAccess(clientUserId, resourceType, reason) {
  return apiRequest('/api/medical/plan-access', {
    method: 'POST',
    body: JSON.stringify({ clientUserId, resourceType, planType: resourceType, reason }),
  })
}

export async function fetchApprovedWorkoutPlan(clientUserId) {
  return apiRequest(
    `/api/medical/plan-access/workout-plan?clientUserId=${encodeURIComponent(clientUserId)}`,
  )
}

export async function fetchApprovedNutritionPlan(clientUserId) {
  return apiRequest(
    `/api/medical/plan-access/nutrition-plan?clientUserId=${encodeURIComponent(clientUserId)}`,
  )
}

export async function fetchClientPlanAccessRequests() {
  return apiRequest('/api/client/plan-access-requests')
}

export async function decideClientPlanAccess(id, status, rejectionReason) {
  return apiRequest(`/api/client/plan-access-requests/${id}/decide`, {
    method: 'POST',
    body: JSON.stringify({ status, rejectionReason }),
  })
}

export async function revokeClientPlanAccess(id) {
  return apiRequest(`/api/client/plan-access-requests/${id}/revoke`, { method: 'POST' })
}
