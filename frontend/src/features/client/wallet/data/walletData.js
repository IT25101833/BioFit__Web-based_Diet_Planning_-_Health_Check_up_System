import { apiRequest, getAccessToken } from '../../../../api/client'

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8080').replace(/\/$/, '')

export function fetchWallet() {
  return apiRequest('/api/client/wallet')
}

export function fetchWalletServices() {
  return apiRequest('/api/client/wallet/services')
}

export function fetchTopUpRequests() {
  return apiRequest('/api/client/wallet/topups')
}

export function fetchWalletTransactions() {
  return apiRequest('/api/client/wallet/transactions')
}

export function submitCashTopUp({ amount, note, receipt }) {
  const body = new FormData()
  body.append('amount', String(amount))
  if (note) body.append('note', note)
  body.append('receipt', receipt)
  return apiRequest('/api/client/wallet/topups', { method: 'POST', body })
}

export function updateCashTopUp(id, { amount, note, receipt }) {
  const body = new FormData()
  if (amount != null && amount !== '') body.append('amount', String(amount))
  if (note != null) body.append('note', note)
  if (receipt) body.append('receipt', receipt)
  return apiRequest(`/api/client/wallet/topups/${encodeURIComponent(id)}`, { method: 'PUT', body })
}

export function cancelCashTopUp(id) {
  return apiRequest(`/api/client/wallet/topups/${encodeURIComponent(id)}/cancel`, { method: 'POST' })
}

export function payWithWallet(serviceCode) {
  return apiRequest('/api/client/wallet/payments', {
    method: 'POST',
    body: JSON.stringify({ serviceCode }),
  })
}

export function fetchAdminTopUps(params = {}) {
  const search = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value) search.set(key, value)
  })
  const query = search.toString()
  return apiRequest(`/api/admin/wallet/topups${query ? `?${query}` : ''}`)
}

export function fetchAdminTopUp(id) {
  return apiRequest(`/api/admin/wallet/topups/${encodeURIComponent(id)}`)
}

export function approveTopUp(id) {
  return apiRequest(`/api/admin/wallet/topups/${encodeURIComponent(id)}/approve`, { method: 'POST' })
}

export function rejectTopUp(id, reason) {
  return apiRequest(`/api/admin/wallet/topups/${encodeURIComponent(id)}/reject`, {
    method: 'POST',
    body: JSON.stringify({ reason }),
  })
}

export function fetchAdminWallets() {
  return apiRequest('/api/admin/wallet/clients')
}

export function fetchAdminWallet(clientId) {
  return apiRequest(`/api/admin/wallet/clients/${encodeURIComponent(clientId)}`)
}

export function fetchAdminWalletTransactions() {
  return apiRequest('/api/admin/wallet/transactions')
}

export async function fetchReceiptBlob(path) {
  const token = getAccessToken()
  const response = await fetch(`${API_URL}${path}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  })
  if (!response.ok) {
    throw new Error('Unable to open this receipt.')
  }
  const blob = await response.blob()
  return { blob, type: response.headers.get('Content-Type') || blob.type }
}

export function formatRs(value) {
  const amount = Number(value || 0)
  return `Rs. ${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export function formatSignedRs(type, value) {
  const sign = String(type).toUpperCase() === 'DEBIT' ? '-' : '+'
  return `${sign}${formatRs(value)}`
}
