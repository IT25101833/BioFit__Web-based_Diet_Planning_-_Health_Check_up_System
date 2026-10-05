import { apiRequest } from '../../../../api/client'

export function formatNutritionDate(iso) {
  if (!iso) return '—'
  return new Date(`${iso}T00:00:00`).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export async function fetchNutritionClients() {
  return apiRequest('/api/nutrition/clients')
}

export async function fetchNutritionClientById(id) {
  return apiRequest(`/api/nutrition/clients/${id}`)
}

/** Async options for Select Client dropdowns — loads from backend. */
export async function getNutritionClientOptions() {
  const clients = await fetchNutritionClients()
  return (clients || []).map((c) => ({
    value: c.id,
    label: `${c.name} (${c.id})`,
    client: c,
  }))
}
