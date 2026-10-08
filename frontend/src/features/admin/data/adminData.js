import { apiRequest, USE_MOCK } from '../../../api/client'

export const adminStats = [
  { label: 'Total Users', value: '486', hint: 'Across all BioFit roles', icon: 'Users' },
  { label: 'Active Staff Accounts', value: '34', hint: 'Currently enabled', icon: 'UserCheck' },
  { label: 'System Alerts', value: '3', hint: 'Require attention', icon: 'TriangleAlert' },
  { label: 'Backup Status', value: 'Healthy', hint: 'Latest backup successful', icon: 'DatabaseBackup' },
]

export const users = [
  {
    id: 'USR-10021',
    name: 'Alex Morgan',
    initials: 'AM',
    role: 'CLIENT',
    email: 'client@biofit.demo',
    status: 'ACTIVE',
    type: 'Client',
    created: '12 Aug 2026',
    lastLogin: 'Today',
    verification: 'Verified',
  },
]

export const services = [
  { name: 'BioFit Web Application', status: 'Operational', checked: 'Just now', issue: 'No recent issues' },
  { name: 'Database Service', status: 'Connected', checked: 'Just now', issue: 'No recent issues' },
  { name: 'Authentication Service', status: 'Available', checked: 'Just now', issue: 'No recent issues' },
]

export const auditLogs = []
export const backups = [
  { id: 'BKP-latest', date: new Date().toISOString(), type: 'Scheduled', status: 'Successful', duration: '4m 12s', by: 'System' },
]
export const roles = [
  'CLIENT',
  'WELLNESS_CENTRE_MANAGER',
  'FITNESS_COACH',
  'NUTRITION_CONSULTANT',
  'MEDICAL_ADVISOR',
  'CUSTOMER_EXPERIENCE_OFFICER',
  'DIGITAL_OPERATIONS_EXECUTIVE',
  'ADMIN',
]
export const notifications = [
  { title: 'Platform healthy', category: 'System', time: 'Just now', read: false },
]

function delay(ms = 350) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/** GET /api/admin/dashboard */
export async function fetchAdminDashboard() {
  if (USE_MOCK) {
    await delay()
    return {
      stats: adminStats,
      users,
      auditLogs,
      services,
      backups,
      roles,
      notifications,
    }
  }
  return apiRequest('/api/admin/dashboard')
}

export async function fetchAdminUsers(params = {}) {
  if (USE_MOCK) {
    await delay()
    return users.map((u) => ({ ...u }))
  }
  const query = new URLSearchParams()
  if (params.role) query.set('role', params.role)
  if (params.status) query.set('status', params.status)
  if (params.type) query.set('type', params.type)
  if (params.q) query.set('q', params.q)
  if (params.sort) query.set('sort', params.sort)
  const suffix = query.toString() ? `?${query.toString()}` : ''
  return apiRequest(`/api/admin/users${suffix}`)
}

export async function fetchAdminUser(id) {
  return apiRequest(`/api/admin/users/${id}`)
}

export async function createAdminUser(payload) {
  return apiRequest('/api/admin/users', { method: 'POST', body: JSON.stringify(payload) })
}

export async function updateAdminUser(id, payload) {
  if (USE_MOCK) {
    await delay(400)
    return { id, ...payload }
  }
  return apiRequest(`/api/admin/users/${id}`, { method: 'PATCH', body: JSON.stringify(payload) })
}

export async function setAdminUserStatus(id, action) {
  return apiRequest(`/api/admin/users/${id}/${action}`, { method: 'PATCH' })
}

export async function issueAdminPasswordReset(id) {
  return apiRequest(`/api/admin/users/${id}/password-reset`, { method: 'POST' })
}

export async function fetchAdminAuditLogs() {
  if (USE_MOCK) {
    await delay()
    return auditLogs.map((a) => ({ ...a }))
  }
  return apiRequest('/api/admin/audit-logs')
}

/** GET /api/admin/erasure-requests */
export async function fetchErasureRequests() {
  if (USE_MOCK) {
    await delay()
    return mockErasureRequests.map((r) => ({ ...r }))
  }
  return apiRequest('/api/admin/erasure-requests')
}

/** POST /api/admin/erasure-requests */
export async function createErasureRequest(payload) {
  if (USE_MOCK) {
    await delay(400)
    const created = {
      id: mockErasureSeq++,
      recordType: payload.recordType,
      recordId: Number(payload.recordId),
      clientUserId: Number(payload.clientUserId) || null,
      legalBasis: payload.legalBasis,
      reason: payload.reason,
      status: 'PENDING',
      requestedByUserId: 1,
      requestedAt: new Date().toISOString(),
      reviewedByUserId: null,
      reviewedAt: null,
      reviewNotes: null,
      executedByUserId: null,
      executedAt: null,
    }
    mockErasureRequests = [created, ...mockErasureRequests]
    return { ...created }
  }
  return apiRequest('/api/admin/erasure-requests', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

/** PATCH /api/admin/erasure-requests/{id}/approve */
export async function approveErasureRequest(id, payload = {}) {
  if (USE_MOCK) {
    await delay(350)
    mockErasureRequests = mockErasureRequests.map((r) =>
      String(r.id) === String(id)
        ? {
            ...r,
            status: 'APPROVED',
            reviewedByUserId: 2,
            reviewedAt: new Date().toISOString(),
            reviewNotes: payload.reviewNotes || '',
          }
        : r,
    )
    return { ...mockErasureRequests.find((r) => String(r.id) === String(id)) }
  }
  return apiRequest(`/api/admin/erasure-requests/${id}/approve`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
}

/** PATCH /api/admin/erasure-requests/{id}/reject */
export async function rejectErasureRequest(id, payload = {}) {
  if (USE_MOCK) {
    await delay(350)
    mockErasureRequests = mockErasureRequests.map((r) =>
      String(r.id) === String(id)
        ? {
            ...r,
            status: 'REJECTED',
            reviewedByUserId: 2,
            reviewedAt: new Date().toISOString(),
            reviewNotes: payload.reviewNotes || '',
          }
        : r,
    )
    return { ...mockErasureRequests.find((r) => String(r.id) === String(id)) }
  }
  return apiRequest(`/api/admin/erasure-requests/${id}/reject`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
}

/** POST /api/admin/erasure-requests/{id}/execute */
export async function executeErasureRequest(id) {
  if (USE_MOCK) {
    await delay(400)
    mockErasureRequests = mockErasureRequests.map((r) =>
      String(r.id) === String(id)
        ? {
            ...r,
            status: 'EXECUTED',
            executedByUserId: 2,
            executedAt: new Date().toISOString(),
          }
        : r,
    )
    return { ...mockErasureRequests.find((r) => String(r.id) === String(id)) }
  }
  return apiRequest(`/api/admin/erasure-requests/${id}/execute`, { method: 'POST' })
}

/** DELETE /api/admin/appointments/:id — future erroneous/duplicate only */
export async function hardDeleteAdminAppointment(id) {
  return apiRequest(`/api/admin/appointments/${id}`, { method: 'DELETE' })
}

export function canHardDeleteAdminAppointment(item, todayIso) {
  if (!item?.date) return false
  return String(item.date) >= String(todayIso || '')
}

/** DELETE /api/admin/dietary-restrictions/:id — inactive unprotected junk only */
export async function hardDeleteAdminDietaryRestriction(id) {
  return apiRequest(`/api/admin/dietary-restrictions/${id}`, { method: 'DELETE' })
}

/** GET /api/admin/appointments — Admin only */
export async function fetchAdminAppointments() {
  return apiRequest('/api/admin/appointments')
}

let mockErasureSeq = 1
let mockErasureRequests = []

