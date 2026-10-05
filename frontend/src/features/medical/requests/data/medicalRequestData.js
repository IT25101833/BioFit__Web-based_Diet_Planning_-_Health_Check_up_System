import { apiRequest } from '../../../../api/client'
import {
  formatPreferredDate,
  formatRequestDate,
} from '../../../client/medical-requests/data/medicalRequestData'

export { formatPreferredDate, formatRequestDate }

export function fetchAdvisorMedicalRequests() {
  return apiRequest('/api/medical/requests')
}

export function fetchAdvisorMedicalRequest(id) {
  return apiRequest(`/api/medical/requests/${encodeURIComponent(id)}`)
}

export function acceptMedicalRequest(id) {
  return apiRequest(`/api/medical/requests/${encodeURIComponent(id)}/accept`, { method: 'POST' })
}

export function rejectMedicalRequest(id, rejectionReason) {
  return apiRequest(`/api/medical/requests/${encodeURIComponent(id)}/reject`, {
    method: 'POST',
    body: JSON.stringify({ rejectionReason }),
  })
}

export function startMedicalRequest(id) {
  return apiRequest(`/api/medical/requests/${encodeURIComponent(id)}/start`, { method: 'POST' })
}

export function completeMedicalRequest(id) {
  return apiRequest(`/api/medical/requests/${encodeURIComponent(id)}/complete`, { method: 'POST' })
}
