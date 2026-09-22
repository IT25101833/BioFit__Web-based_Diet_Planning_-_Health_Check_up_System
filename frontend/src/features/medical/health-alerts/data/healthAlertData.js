import { apiRequest } from '../../../../api/client'

export function findSimilarActiveAlert(alerts, clientId, title) {
  const normalised = String(title || '')
    .trim()
    .toLowerCase()
  const clientKey = String(clientId || '').trim()
  if (!clientKey || !normalised || !Array.isArray(alerts)) return null
  return (
    alerts.find((item) => {
      if (item.status === 'Resolved') return false
      const titleMatch =
        String(item.title || '')
          .trim()
          .toLowerCase() === normalised
      if (!titleMatch) return false
      const itemClient = String(item.clientId || '').trim()
      const itemUser = item.userId != null ? String(item.userId) : ''
      return (
        itemClient === clientKey ||
        itemUser === clientKey ||
        itemClient === `BF-C${clientKey}` ||
        clientKey === `BF-C${itemUser}`
      )
    }) || null
  )
}

export async function fetchHealthAlerts() {
  return apiRequest('/api/medical/health-alerts')
}

export async function fetchHealthAlertById(id) {
  return apiRequest(`/api/medical/health-alerts/${id}`)
}

export async function createHealthAlert(payload) {
  return apiRequest('/api/medical/health-alerts', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function updateHealthAlert(id, payload) {
  return apiRequest(`/api/medical/health-alerts/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
}

export async function updateAlertStatus(id, status) {
  return apiRequest(`/api/medical/health-alerts/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  })
}

export async function startAlertReview(id, payload = {}) {
  return apiRequest(`/api/medical/health-alerts/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({
      action: 'startAlertReview',
      ...(typeof payload === 'object' ? payload : {}),
    }),
  })
}

export async function resolveAlert(id, payload = {}) {
  return apiRequest(`/api/medical/health-alerts/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({
      action: 'resolveAlert',
      ...(typeof payload === 'object' ? payload : {}),
    }),
  })
}

export async function addFollowUp(id, payload = {}) {
  return apiRequest(`/api/medical/health-alerts/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({
      action: 'addFollowUp',
      ...(typeof payload === 'object' ? payload : {}),
    }),
  })
}

export async function completeFollowUp(id, payload = {}) {
  return apiRequest(`/api/medical/health-alerts/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({
      action: 'completeFollowUp',
      ...(typeof payload === 'object' ? payload : {}),
    }),
  })
}

export async function updateGuidance(id, payload = {}) {
  return apiRequest(`/api/medical/health-alerts/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({
      action: 'updateGuidance',
      ...(typeof payload === 'object' ? payload : {}),
    }),
  })
}

export async function deactivateHealthAlert(id) {
  return apiRequest(`/api/medical/health-alerts/${id}/deactivate`, { method: 'PATCH' })
}
