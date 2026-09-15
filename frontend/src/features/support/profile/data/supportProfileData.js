import { apiRequest, USE_MOCK } from '../../../../api/client'
export let supportProfile = {
  id: 'BF-CX01',
  firstName: 'Amaya',
  lastName: 'Fernando',
  email: 'amaya.fernando@vitallife.lk',
  contactNumber: '+94 77 342 9918',
  role: 'Customer Experience Officer',
  department: 'Client Care & Service Experience',
  team: 'VitalLife Experience Desk',
  workingHours: '08:00 AM – 05:00 PM (Mon – Sat)',
  bio: 'Specialized in wellness onboarding, appointment coordination, and omnichannel client concierge care for VitalLife members.',
  skills: ['Appointment Scheduling', 'Client Care', 'Complaint Resolution', 'Specialist Routing', 'Service Triage'],
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
