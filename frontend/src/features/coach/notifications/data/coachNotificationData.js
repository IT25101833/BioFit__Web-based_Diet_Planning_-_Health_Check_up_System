import { apiRequest, USE_MOCK } from '../../../../api/client'
export const coachNotifications = [
  {
    id: 'cn1',
    type: 'clients',
    title: 'New client assigned',
    body: 'Kasuni Abeysekara has been assigned to your coaching list.',
    createdAt: '2026-09-09T08:20:00',
    read: false,
  },
  {
    id: 'cn2',
    type: 'assessments',
    title: 'Assessment due',
    body: 'Taylor Kim has a fitness assessment due on Sep 12.',
    createdAt: '2026-09-08T14:10:00',
    read: false,
  },
  {
    id: 'cn3',
    type: 'workout-plans',
    title: 'Workout plan ending soon',
    body: 'Energy Recovery Pathway for Sahan De Silva ends Sep 20.',
    createdAt: '2026-09-07T11:00:00',
    read: true,
  },
  {
    id: 'cn4',
    type: 'clients',
    title: 'Client completed workout',
    body: 'Alex Perera completed Full Body Workout.',
    createdAt: '2026-09-09T09:48:00',
    read: false,
  },
  {
    id: 'cn5',
    type: 'schedule',
    title: 'Schedule changed',
    body: 'Your 2:30 PM session moved to Studio 2.',
    createdAt: '2026-09-06T16:40:00',
    read: true,
  },
  {
    id: 'cn6',
    type: 'assessments',
    title: 'Health/safety review notice',
    body: 'Medical review guidance remains active for Taylor Kim before intensity changes.',
    createdAt: '2026-09-05T10:15:00',
    read: true,
  },
]

function delay(ms = 350) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function fetchCoachNotifications() {
  if (USE_MOCK) {
    await delay()
    return coachNotifications.map((n) => ({ ...n }))
  }
  return apiRequest('/api/coach/notifications')
}

export async function markCoachNotificationRead(id) {
  if (USE_MOCK) {
    await delay(250)
    return { id, read: true }
  }
  return apiRequest(`/api/coach/notifications/${id}/read`, { method: 'PATCH' })
}

export async function markAllCoachNotificationsRead() {
  if (USE_MOCK) {
    await delay(350)
    return { success: true }
  }
  return apiRequest('/api/coach/notifications/read-all', { method: 'PATCH' })
}
