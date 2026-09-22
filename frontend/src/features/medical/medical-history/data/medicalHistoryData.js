import { apiRequest } from '../../../../api/client'

export async function fetchMedicalClients() {
  return apiRequest('/api/medical/clients')
}

export async function fetchMedicalHistory({ status, clientUserId } = {}) {
  const params = new URLSearchParams()
  if (status) params.set('status', status)
  if (clientUserId) params.set('clientUserId', String(clientUserId))
  const q = params.toString()
  return apiRequest(`/api/medical/medical-history${q ? `?${q}` : ''}`)
}

export async function fetchMedicalHistoryById(id) {
  return apiRequest(`/api/medical/medical-history/${id}`)
}

export async function createMedicalHistory(payload) {
  return apiRequest('/api/medical/medical-history', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function updateMedicalHistory(id, payload) {
  return apiRequest(`/api/medical/medical-history/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
}

export async function deactivateMedicalHistory(id) {
  return apiRequest(`/api/medical/medical-history/${id}/deactivate`, {
    method: 'PATCH',
  })
}
