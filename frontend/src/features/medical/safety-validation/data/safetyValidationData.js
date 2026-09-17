import { apiRequest, shouldUseMockData } from '../../../../api/client'

let mockValidations = []

function delay(ms = 400) {
  return new Promise((r) => setTimeout(r, ms))
}

export async function fetchSafetyValidations(clientUserId) {
  if (shouldUseMockData()) {
    await delay()
    return mockValidations
      .filter((item) => !clientUserId || item.userId === clientUserId)
      .map((item) => structuredClone(item))
  }
  const q = clientUserId ? `?clientUserId=${clientUserId}` : ''
  return apiRequest(`/api/medical/safety-validations${q}`)
}

export async function fetchSafetyValidationById(id) {
  if (shouldUseMockData()) {
    await delay()
    const found = mockValidations.find((item) => String(item.id) === String(id))
    if (!found) throw new Error('Not found')
    return structuredClone(found)
  }
  return apiRequest(`/api/medical/safety-validations/${id}`)
}

export async function runSafetyValidation(payload) {
  if (shouldUseMockData()) {
    await delay(600)
    const warnings = []
    if (String(payload.clientName || '').toLowerCase().includes('alex')) {
      warnings.push('Active allergy on file: Peanuts (High)')
      warnings.push('Health record lists documented conditions.')
    }
    const resultStatus = warnings.length ? 'Needs Review' : 'Cleared'
    const created = {
      id: Date.now(),
      userId: payload.userId || 1,
      clientId: payload.clientId,
      clientName: payload.clientName,
      referenceType: payload.referenceType || 'CLIENT',
      referenceId: payload.referenceId || null,
      resultStatus,
      status: resultStatus,
      warnings,
      advisorNotes: payload.advisorNotes || '',
      validatedBy: 'Medical Advisor',
      validatedAt: new Date().toISOString(),
    }
    mockValidations = [created, ...mockValidations]
    return structuredClone(created)
  }
  return apiRequest('/api/medical/safety-validations', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}
