import { apiRequest, USE_MOCK } from '../../../../api/client'
export const nutritionNotifications = [
  {
    id: 'nn1',
    type: 'clients',
    title: 'New client assigned',
    body: 'Kasuni Abeysekara has been assigned for nutrition planning.',
    createdAt: '2026-09-09T08:10:00',
    read: false,
  },
  {
    id: 'nn2',
    type: 'meal-plans',
    title: 'Meal plan review due',
    body: 'Balanced Wellness Meal Plan for Alex Perera needs review.',
    createdAt: '2026-09-08T14:20:00',
    read: false,
  },
  {
    id: 'nn3',
    type: 'dietary',
    title: 'Dietary restriction updated',
    body: 'Soft texture preference recorded for Taylor Kim.',
    createdAt: '2026-09-07T16:05:00',
    read: true,
  },
  {
    id: 'nn4',
    type: 'dietary',
    title: 'Medical guidance updated',
    body: 'Peanut allergy reference remains active for Kasuni Abeysekara.',
    createdAt: '2026-09-06T10:40:00',
    read: true,
  },
  {
    id: 'nn5',
    type: 'appointments',
    title: 'Appointment scheduled',
    body: 'Nutrition follow-up with Alex Perera on Sep 10 at 10:30 AM.',
    createdAt: '2026-09-05T09:00:00',
    read: false,
  },
  {
    id: 'nn6',
    type: 'appointments',
    title: 'Appointment cancelled',
    body: 'Initial consultation with Kasuni Abeysekara was cancelled.',
    createdAt: '2026-09-03T15:20:00',
    read: true,
  },
]

function delay(ms = 350) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function fetchNutritionNotifications() {
  if (USE_MOCK) { await delay(); return nutritionNotifications.map((n) => ({ ...n })) }
  return apiRequest('/api/nutrition/notifications')
}

export async function markNutritionNotificationRead(id) {
  if (USE_MOCK) { await delay(250); return { id, read: true } }
  return apiRequest(`/api/nutrition/notifications/${id}/read`, { method: 'PATCH' })
}

export async function markAllNutritionNotificationsRead() {
  if (USE_MOCK) { await delay(350); return { success: true } }
  return apiRequest('/api/nutrition/notifications/read-all', { method: 'PATCH' })
}
