import { apiRequest, USE_MOCK } from '../../../../api/client'
export let supportNotifications = [
  {
    id: 'snotif-1',
    type: 'tickets',
    title: 'Client Replied to SUP-2048',
    message: 'Alex Perera sent a follow-up message regarding appointment slots.',
    at: '2026-09-09T09:15:00',
    read: false,
    link: '/support/tickets/SUP-2048',
  },
  {
    id: 'snotif-2',
    type: 'escalations',
    title: 'Specialist Guidance Received for SUP-2039',
    message: 'Elena Costa (Medical Advisor) responded to allergy screening inquiry.',
    at: '2026-09-08T14:30:00',
    read: false,
    link: '/support/tickets/SUP-2039',
  },
  {
    id: 'snotif-3',
    type: 'tickets',
    title: 'New High Priority Ticket in Queue',
    message: 'SUP-2048 was created for Appointment Support and requires triage.',
    at: '2026-09-09T08:30:00',
    read: false,
    link: '/support/tickets/SUP-2048',
  },
  {
    id: 'snotif-4',
    type: 'feedback',
    title: 'New Client Complaint Logged',
    message: 'Tharindu Mendis submitted a clinic waiting time concern (FB-502).',
    at: '2026-09-08T15:40:00',
    read: true,
    link: '/support/feedback',
  },
  {
    id: 'snotif-5',
    type: 'tickets',
    title: 'Ticket Assigned to You',
    message: 'SUP-2045 (Workout Plan Substitution) was assigned to Priya Nair.',
    at: '2026-09-08T11:15:00',
    read: true,
    link: '/support/tickets/SUP-2045',
  },
  {
    id: 'snotif-6',
    type: 'system',
    title: 'System Notice: Scheduled Maintenance Window',
    message: 'BioFit core database telemetry sync will undergo 15 min routine check on Sunday at 02:00 AM.',
    at: '2026-09-07T10:00:00',
    read: true,
    link: null,
  },
]

function delay(ms = 300) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function fetchSupportNotifications() {
  if (USE_MOCK) { await delay(); return supportNotifications.map((n) => ({ ...n })) }
  return apiRequest('/api/support/notifications')
}

export async function markSupportNotificationRead(id) {
  if (USE_MOCK) { await delay(250); return { id, read: true } }
  return apiRequest(`/api/support/notifications/${id}/read`, { method: 'PATCH' })
}

export async function markAllSupportNotificationsRead() {
  if (USE_MOCK) { await delay(350); return { success: true } }
  return apiRequest('/api/support/notifications/read-all', { method: 'PATCH' })
}
