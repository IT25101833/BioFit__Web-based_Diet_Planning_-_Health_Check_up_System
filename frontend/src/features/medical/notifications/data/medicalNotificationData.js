import { apiRequest } from '../../../../api/client'

export async function fetchMedicalNotifications() {
  return apiRequest('/api/medical/notifications')
}

export async function markMedicalNotificationRead(id) {
  return apiRequest(`/api/medical/notifications/${id}/read`, { method: 'PATCH' })
}

export async function markAllMedicalNotificationsRead() {
  return apiRequest('/api/medical/notifications/read-all', { method: 'PATCH' })
}
