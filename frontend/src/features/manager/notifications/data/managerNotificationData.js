import { apiRequest, USE_MOCK } from '../../../../api/client'
export const managerNotifications = [
  {
    id: 'mn1',
    type: 'programmes',
    title: 'New programme enrolment',
    body: 'Alex Perera enrolled in Weight Management Programme.',
    createdAt: '2026-09-09T09:42:00',
    read: false,
  },
  {
    id: 'mn2',
    type: 'scheduling',
    title: 'Staff schedule change',
    body: 'Nutrition consultation moved to 2:30 PM in Consultation Room B.',
    createdAt: '2026-09-09T08:55:00',
    read: false,
  },
  {
    id: 'mn3',
    type: 'programmes',
    title: 'Programme capacity warning',
    body: 'Complete Wellness Programme is at 80% capacity.',
    createdAt: '2026-09-08T13:10:00',
    read: true,
  },
  {
    id: 'mn4',
    type: 'appointments',
    title: 'Appointment cancellation',
    body: 'Wellness consultation for Dilani Fernando was cancelled.',
    createdAt: '2026-09-07T16:20:00',
    read: true,
  },
  {
    id: 'mn5',
    type: 'programmes',
    title: 'Programme completion',
    body: 'Wellness Starter Pathway marked completed for Meera Jayasinghe.',
    createdAt: '2026-09-06T11:00:00',
    read: true,
  },
  {
    id: 'mn6',
    type: 'scheduling',
    title: 'Staff availability update',
    body: 'Tharindu Perera marked unavailable for Thursday afternoon.',
    createdAt: '2026-09-05T10:15:00',
    read: false,
  },
  {
    id: 'mn7',
    type: 'system',
    title: 'Operational notice',
    body: 'Studio 2 maintenance window scheduled for Sunday evening.',
    createdAt: '2026-09-04T09:00:00',
    read: true,
  },
]

function delay(ms = 350) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/** GET /api/manager/notifications */
export async function fetchManagerNotifications() {
  if (USE_MOCK) {
    await delay()
    return managerNotifications.map((n) => ({ ...n }))
  }
  return apiRequest('/api/manager/notifications')
}

export async function markManagerNotificationRead(id) {
  if (USE_MOCK) {
    await delay(250)
    return { id, read: true }
  }
  return apiRequest(`/api/manager/notifications/${id}/read`, { method: 'PATCH' })
}

export async function markAllManagerNotificationsRead() {
  if (USE_MOCK) {
    await delay(350)
    return { success: true }
  }
  return apiRequest('/api/manager/notifications/read-all', { method: 'PATCH' })
}
