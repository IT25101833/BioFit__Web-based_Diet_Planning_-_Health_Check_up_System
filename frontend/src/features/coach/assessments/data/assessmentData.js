import { apiRequest } from '../../../../api/client'

export async function fetchAssessments() {
  return apiRequest('/api/coach/assessments')
}

export async function fetchAssessmentById(id) {
  return apiRequest(`/api/coach/assessments/${id}`)
}

export async function createAssessment(payload) {
  return apiRequest('/api/coach/assessments', { method: 'POST', body: JSON.stringify(payload) })
}
