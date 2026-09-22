import { apiRequest } from '../../../../api/client'
import { fetchMedicalClients } from '../../medical-history/data/medicalHistoryData'

export function formatMedicalDate(iso) {
  if (!iso) return '—'
  const date = new Date(iso.includes('T') ? iso : `${iso}T12:00:00`)
  if (Number.isNaN(date.getTime())) return iso
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export async function fetchClientOptions() {
  const clients = await fetchMedicalClients()
  return (clients || []).map((c) => ({
    value: c.clientId || `BF-C${c.userId}`,
    label: `${c.name || c.clientName || 'Client'} (${c.clientId || `BF-C${c.userId}`})`,
    programme: c.programme || '',
    userId: c.userId || c.id,
    clientName: c.name || c.clientName || '',
  }))
}

export async function fetchHealthRecords() {
  return apiRequest('/api/medical/health-records')
}

export async function fetchHealthRecordById(id) {
  const numeric = String(id).startsWith('hr-') ? String(id).slice(3) : id
  return apiRequest(`/api/medical/health-records/${numeric}`)
}

export async function createHealthRecord(payload) {
  return apiRequest('/api/medical/health-records', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function updateHealthRecord(id, payload) {
  const numeric = String(id).startsWith('hr-') ? String(id).slice(3) : id
  return apiRequest(`/api/medical/health-records/${numeric}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
}

export async function deactivateHealthRecord(id) {
  const numeric = String(id).startsWith('hr-') ? String(id).slice(3) : id
  return apiRequest(`/api/medical/health-records/${numeric}/deactivate`, {
    method: 'PATCH',
  })
}
