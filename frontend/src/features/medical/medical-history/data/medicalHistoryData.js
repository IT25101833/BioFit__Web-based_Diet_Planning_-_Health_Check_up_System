import { apiRequest, shouldUseMockData } from '../../../../api/client'

let mockHistory = [
  {
    id: 1,
    userId: 1,
    clientId: 'BF-C1',
    clientName: 'Alex Morgan',
    recordType: 'Allergy',
    conditionName: '',
    allergyInfo: 'Peanuts',
    description: 'Documented peanut allergy — avoid cross-contact.',
    severity: 'High',
    recordedDate: '2026-08-01',
    status: 'Active',
    createdBy: 'Elena Costa',
    createdAt: '2026-08-01T10:00:00Z',
    updatedAt: '2026-08-01T10:00:00Z',
  },
  {
    id: 2,
    userId: 1,
    clientId: 'BF-C1',
    clientName: 'Alex Morgan',
    recordType: 'Condition',
    conditionName: 'Knee joint discomfort',
    allergyInfo: '',
    description: 'Low-impact activity preferred until review.',
    severity: 'Medium',
    recordedDate: '2026-08-12',
    status: 'Active',
    createdBy: 'Elena Costa',
    createdAt: '2026-08-12T09:00:00Z',
    updatedAt: '2026-08-12T09:00:00Z',
  },
]

let seq = 3

function delay(ms = 350) {
  return new Promise((r) => setTimeout(r, ms))
}

export async function fetchMedicalClients() {
  if (shouldUseMockData()) {
    await delay()
    return [
      { userId: 1, clientId: 'BF-C1', clientName: 'Alex Morgan', email: 'client@biofit.demo' },
      { userId: 15, clientId: 'BF-C15', clientName: 'Sathalogithsiva Hariram', email: '' },
    ]
  }
  return apiRequest('/api/medical/clients')
}

export async function fetchMedicalHistory({ status, clientUserId } = {}) {
  if (shouldUseMockData()) {
    await delay()
    return mockHistory
      .filter((item) => (!status || item.status === status) && (!clientUserId || item.userId === clientUserId))
      .map((item) => structuredClone(item))
  }
  const params = new URLSearchParams()
  if (status) params.set('status', status)
  if (clientUserId) params.set('clientUserId', String(clientUserId))
  const q = params.toString()
  return apiRequest(`/api/medical/medical-history${q ? `?${q}` : ''}`)
}

export async function fetchMedicalHistoryById(id) {
  if (shouldUseMockData()) {
    await delay()
    const found = mockHistory.find((item) => String(item.id) === String(id))
    if (!found) throw new Error('Not found')
    return structuredClone(found)
  }
  return apiRequest(`/api/medical/medical-history/${id}`)
}

export async function createMedicalHistory(payload) {
  if (shouldUseMockData()) {
    await delay(400)
    const created = {
      id: seq++,
      ...payload,
      status: 'Active',
      createdBy: 'Medical Advisor',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    mockHistory = [created, ...mockHistory]
    return structuredClone(created)
  }
  return apiRequest('/api/medical/medical-history', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function updateMedicalHistory(id, payload) {
  if (shouldUseMockData()) {
    await delay(400)
    mockHistory = mockHistory.map((item) =>
      String(item.id) === String(id)
        ? { ...item, ...payload, id: item.id, updatedAt: new Date().toISOString() }
        : item,
    )
    return structuredClone(mockHistory.find((item) => String(item.id) === String(id)))
  }
  return apiRequest(`/api/medical/medical-history/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
}

export async function deactivateMedicalHistory(id) {
  if (shouldUseMockData()) {
    await delay(350)
    mockHistory = mockHistory.map((item) =>
      String(item.id) === String(id)
        ? {
            ...item,
            status: 'Inactive',
            deactivatedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }
        : item,
    )
    return structuredClone(mockHistory.find((item) => String(item.id) === String(id)))
  }
  return apiRequest(`/api/medical/medical-history/${id}/deactivate`, { method: 'PATCH' })
}

export async function deactivateHealthRecord(id) {
  if (shouldUseMockData()) {
    await delay(350)
    return { id, active: false, recordStatus: 'Inactive' }
  }
  const numeric = String(id).startsWith('hr-') ? String(id).slice(3) : id
  return apiRequest(`/api/medical/health-records/${numeric}/deactivate`, { method: 'PATCH' })
}
