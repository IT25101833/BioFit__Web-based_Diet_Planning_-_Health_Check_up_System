import { apiRequest, USE_MOCK } from '../../../../api/client'
export const notifications = [
  {
    id: 'n1',
    type: 'appointment',
    title: 'Appointment reminder',
    body: 'Fitness consultation with Maya Fernando tomorrow at 10:00 AM.',
    createdAt: '2026-09-11T08:00:00',
    read: false,
  },
  {
    id: 'n2',
    type: 'programme',
    title: 'Programme update',
    body: 'Week 10 of Weight Management Programme is now underway.',
    createdAt: '2026-09-08T09:30:00',
    read: false,
  },
  {
    id: 'n3',
    type: 'workout',
    title: 'Workout update',
    body: 'Your coach refreshed Thursday’s steady cardio session.',
    createdAt: '2026-09-07T16:20:00',
    read: true,
  },
  {
    id: 'n4',
    type: 'meal',
    title: 'Meal-plan update',
    body: 'Warmer breakfast options were added to this week’s plan.',
    createdAt: '2026-09-05T12:10:00',
    read: true,
  },
  {
    id: 'n5',
    type: 'support',
    title: 'Support ticket update',
    body: 'Support replied to “Meal plan preference update”.',
    createdAt: '2026-09-05T11:05:00',
    read: false,
  },
  {
    id: 'n6',
    type: 'health',
    title: 'Health reminder',
    body: 'Hydration reminder remains under monitoring until 15 Sep.',
    createdAt: '2026-09-01T10:00:00',
    read: true,
  },
]

function delay(ms = 420) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/** GET /api/client/notifications */
export async function fetchClientNotifications() {
  if (USE_MOCK) {
    await delay()
    return notifications.map((item) => ({ ...item }))
  }
  return apiRequest('/api/client/notifications')
}

/** PATCH /api/client/notifications/:id/read */
export async function markNotificationRead(id) {
  if (USE_MOCK) {
    await delay(250)
    return { id, read: true }
  }
  return apiRequest(`/api/client/notifications/${id}/read`, { method: 'PATCH' })
}

/** PATCH /api/client/notifications/read-all */
export async function markAllNotificationsRead() {
  if (USE_MOCK) {
    await delay(350)
    return { success: true }
  }
  return apiRequest('/api/client/notifications/read-all', { method: 'PATCH' })
}
