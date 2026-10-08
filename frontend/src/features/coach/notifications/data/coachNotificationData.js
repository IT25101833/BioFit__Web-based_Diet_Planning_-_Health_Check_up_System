import { apiRequest } from '../../../../api/client'

export async function fetchCoachNotifications() {
  return apiRequest('/api/coach/notifications')
}

export async function markCoachNotificationRead(id) {
  return apiRequest(`/api/coach/notifications/${id}/read`, { method: 'PATCH' })
}

export async function markAllCoachNotificationsRead() {
  return apiRequest('/api/coach/notifications/read-all', { method: 'PATCH' })
}
