import { apiRequest, USE_MOCK } from '../../../../api/client'
export const clientProfile = {
  id: 'BF-C1024',
  firstName: 'Alex',
  lastName: 'Perera',
  email: 'alex@example.com',
  contactNumber: '+94 77 123 4567',
  dateOfBirth: '2005-03-15',
  gender: 'Male',
  accountStatus: 'Active',
  emailVerified: true,
  memberSince: '2026-08-12',
  lastLogin: 'Today · 8:45 AM',
  currentProgramme: 'Weight Management Programme',
  address: '',
  avatarUrl: '',
  emergencyContact: {
    name: 'N. Perera',
    relationship: 'Parent',
    contactNumber: '+94 71 555 0198',
  },
}

export function getFullName(profile) {
  return `${profile.firstName} ${profile.lastName}`.trim()
}

export function formatDisplayDate(isoDate) {
  if (!isoDate) return ''
  const date = new Date(`${isoDate}T00:00:00`)
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export function formatShortDate(isoDate) {
  if (!isoDate) return ''
  const date = new Date(`${isoDate}T00:00:00`)
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export function getProfileCompletion(profile) {
  const checks = [
    Boolean(profile.firstName?.trim()),
    Boolean(profile.lastName?.trim()),
    Boolean(profile.dateOfBirth),
    Boolean(profile.gender),
    Boolean(profile.email?.trim()),
    Boolean(profile.contactNumber?.trim()),
    Boolean(profile.emergencyContact?.name?.trim()),
    Boolean(profile.emergencyContact?.contactNumber?.trim()),
  ]
  const met = checks.filter(Boolean).length
  const percent = Math.round((met / checks.length) * 100)
  return { percent, complete: percent === 100 }
}

function delay(ms = 400) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/** Simulated profile fetch — replace with GET /api/client/profile */
export async function fetchClientProfile() {
  if (USE_MOCK) {
    await delay()
    return structuredClone(clientProfile)
  }
  return apiRequest('/api/client/profile')
}

/** Simulated profile update — replace with PUT /api/client/profile */
export async function updateClientProfile(payload) {
  if (USE_MOCK) {
    await delay(500)
    return { ...clientProfile, ...payload }
  }
  return apiRequest('/api/client/profile', { method: 'PUT', body: JSON.stringify(payload) })
}

/** Simulated password change — replace with PUT /api/auth/change-password */
export async function changeClientPassword(payload) {
  if (USE_MOCK) {
    await delay(500)
    return { success: true }
  }
  return apiRequest('/api/auth/change-password', {
    method: 'PUT',
    body: JSON.stringify({
      currentPassword: payload.currentPassword,
      newPassword: payload.password || payload.newPassword,
    }),
  })
}
