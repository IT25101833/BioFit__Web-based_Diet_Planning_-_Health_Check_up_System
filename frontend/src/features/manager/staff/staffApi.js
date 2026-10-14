import { apiRequest } from '../../../api/client'

function queryString(params = {}) {
  const query = new URLSearchParams()
  if (params.role) query.set('role', params.role)
  if (params.status) query.set('status', params.status)
  if (params.q) query.set('q', params.q)
  if (params.sort) query.set('sort', params.sort)
  const suffix = query.toString()
  return suffix ? `?${suffix}` : ''
}

export function fetchCentreStaff(params) {
  return apiRequest(`/api/manager/staff${queryString(params)}`)
}

export function createCentreStaff(payload) {
  return apiRequest('/api/manager/staff', { method: 'POST', body: JSON.stringify(payload) })
}

export function updateCentreStaff(id, payload) {
  return apiRequest(`/api/manager/staff/${id}`, { method: 'PATCH', body: JSON.stringify(payload) })
}
