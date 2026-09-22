import { apiRequest } from '../../../../api/client'

export function getAssessmentSummaryStats(list = []) {
  const counts = {
    total: list.length,
    pendingReview: 0,
    reviewed: 0,
    followUpRequired: 0,
    completed: 0,
  }
  for (const item of list) {
    if (item.status === 'Pending Review') counts.pendingReview += 1
    else if (item.status === 'Reviewed') counts.reviewed += 1
    else if (item.status === 'Follow-up Required') counts.followUpRequired += 1
    else if (item.status === 'Completed' || item.status === 'COMPLETED') counts.completed += 1
  }
  return counts
}

export async function fetchAssessments({ clientUserId } = {}) {
  const params = new URLSearchParams()
  if (clientUserId) params.set('clientUserId', String(clientUserId))
  const q = params.toString()
  return apiRequest(`/api/medical/assessments${q ? `?${q}` : ''}`)
}

export async function fetchAssessmentById(id) {
  return apiRequest(`/api/medical/assessments/${id}`)
}

export async function createAssessment(payload) {
  return apiRequest('/api/medical/assessments', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function updateAssessment(id, payload) {
  return apiRequest(`/api/medical/assessments/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
}
