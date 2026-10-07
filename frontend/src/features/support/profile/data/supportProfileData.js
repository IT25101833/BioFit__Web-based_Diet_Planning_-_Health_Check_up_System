import { apiRequest, USE_MOCK } from '../../../../api/client'
export let supportProfile = {
  id: 'BF-CX01',
  firstName: 'Amaya',
  lastName: 'Fernando',
  email: 'amaya.fernando@vitallife.lk',
  contactNumber: '+94 77 342 9918',
  role: 'Customer Experience Officer',
  specialization: 'Customer experience',
  accountStatus: 'Active',
}

function delay(ms = 350) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function fetchSupportProfile() {
  if (USE_MOCK) { await delay(); return { ...supportProfile } }
  return apiRequest('/api/support/profile')
}

export async function updateSupportProfile(payload) {
  if (USE_MOCK) { await delay(500); return { ...supportProfile, ...payload } }
  return apiRequest('/api/support/profile', { method: 'PATCH', body: JSON.stringify(payload) })
}
