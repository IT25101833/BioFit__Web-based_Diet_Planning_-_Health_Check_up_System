import { apiRequest, USE_MOCK } from '../../../../api/client'

/** Mock-only in-memory store (live API uses the database). */
const mockNotifications = []

function delay(ms = 420) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/** GET /api/client/notifications */
export async function fetchClientNotifications() {
  if (USE_MOCK) {
    await delay()
    return mockNotifications.map((item) => ({ ...item }))
  }
  return apiRequest('/api/client/notifications')
}

/** GET /api/client/notifications/unread-count */
export async function fetchClientUnreadNotificationCount() {
  if (USE_MOCK) {
    await delay(150)
    return mockNotifications.filter((n) => !n.read).length
  }
  const res = await apiRequest('/api/client/notifications/unread-count')
  return typeof res?.count === 'number' ? res.count : 0
}

/** PATCH /api/client/notifications/:id/read */
export async function markNotificationRead(id) {
  if (USE_MOCK) {
    await delay(250)
    const item = mockNotifications.find((n) => n.id === id)
    if (item) item.read = true
    return { id, read: true }
  }
  return apiRequest(`/api/client/notifications/${id}/read`, { method: 'PATCH' })
}

/** PATCH /api/client/notifications/read-all */
export async function markAllNotificationsRead() {
  if (USE_MOCK) {
    await delay(350)
    mockNotifications.forEach((n) => {
      n.read = true
    })
    return { success: true }
  }
  return apiRequest('/api/client/notifications/read-all', { method: 'PATCH' })
}

function isChooseTimeLink(link) {
  return typeof link === 'string' && link.includes('reviewRequestId=')
}

/** Mock-only helper used by local support flows when USE_MOCK is true. */
export function pushClientNotification({ type = 'support', title, body, link }) {
  if (!USE_MOCK) return
  mockNotifications.unshift({
    id: `n-${Date.now()}`,
    type,
    title,
    body,
    createdAt: new Date().toISOString(),
    read: false,
    link: link || null,
  })
}
