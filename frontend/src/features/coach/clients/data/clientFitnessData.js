import { apiRequest } from '../../../../api/client'

export function formatCoachDate(iso) {
  if (!iso) return '—'
  return new Date(`${iso}T00:00:00`).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export async function fetchCoachClients() {
  return apiRequest('/api/coach/clients')
}

export async function fetchCoachClientById(id) {
  return apiRequest(`/api/coach/clients/${id}`)
}
