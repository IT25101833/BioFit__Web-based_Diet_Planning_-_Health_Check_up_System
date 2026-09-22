import { apiRequest } from '../../../../api/client'

export async function fetchSafetyValidations(opts) {
  const clientUserId =
    typeof opts === 'object' && opts !== null ? opts.clientUserId : opts
  const q = clientUserId ? `?clientUserId=${encodeURIComponent(String(clientUserId))}` : ''
  return apiRequest(`/api/medical/safety-validations${q}`)
}

export async function fetchSafetyValidationById(id) {
  return apiRequest(`/api/medical/safety-validations/${id}`)
}

export async function runSafetyValidation(payload) {
  return apiRequest('/api/medical/safety-validations', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}
