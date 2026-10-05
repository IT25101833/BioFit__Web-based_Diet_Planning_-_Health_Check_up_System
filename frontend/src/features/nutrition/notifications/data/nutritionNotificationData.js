import { apiRequest } from '../../../../api/client'

export async function fetchNutritionNotifications() {
  return apiRequest('/api/nutrition/notifications')
}

export async function markNutritionNotificationRead(id) {
  return apiRequest(`/api/nutrition/notifications/${id}/read`, { method: 'PATCH' })
}

export async function markAllNutritionNotificationsRead() {
  return apiRequest('/api/nutrition/notifications/read-all', { method: 'PATCH' })
}
