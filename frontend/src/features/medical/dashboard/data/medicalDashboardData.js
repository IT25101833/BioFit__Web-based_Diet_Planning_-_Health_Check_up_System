import { apiRequest } from '../../../../api/client'

export async function fetchMedicalDashboard() {
  return apiRequest('/api/medical/dashboard')
}

export async function fetchMedicalProfile() {
  return apiRequest('/api/medical/profile')
}

export async function updateMedicalProfile(payload) {
  return apiRequest('/api/medical/profile', {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
}
