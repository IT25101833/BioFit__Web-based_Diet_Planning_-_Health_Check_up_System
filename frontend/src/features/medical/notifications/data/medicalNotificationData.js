import { apiRequest, USE_MOCK } from '../../../../api/client'
let store = [
  {
    id: 'mn-1',
    title: 'Assessment pending review',
    message: 'Routine health check-up for Alex Perera is ready for your review.',
    type: 'assessments',
    read: false,
    createdAt: '2026-09-09T08:20:00',
    link: '/medical/assessments/ha-1',
  },
  {
    id: 'mn-2',
    title: 'High-priority health alert',
    message: 'Allergy safety reminder for Kasuni Abeysekara requires attention.',
    type: 'alerts',
    read: false,
    createdAt: '2026-09-09T07:55:00',
    link: '/medical/health-alerts/HRA-203',
  },
  {
    id: 'mn-3',
    title: 'Follow-up due today',
    message: 'Joint comfort follow-up for Taylor Kim is due today.',
    type: 'follow-ups',
    read: false,
    createdAt: '2026-09-09T07:10:00',
    link: '/medical/health-alerts/HRA-201',
  },
  {
    id: 'mn-4',
    title: 'Appointment starting soon',
    message: 'Health review with Alex Perera begins at 9:30 AM.',
    type: 'appointments',
    read: false,
    createdAt: '2026-09-09T06:45:00',
    link: '/medical/appointments',
  },
  {
    id: 'mn-5',
    title: 'Health record update required',
    message: 'Nimali Silva’s wellness record needs an updated assessment.',
    type: 'records',
    read: true,
    createdAt: '2026-09-08T16:30:00',
    link: '/medical/health-records/hr-2',
  },
  {
    id: 'mn-6',
    title: 'Guidance shared with care team',
    message: 'Wellness guidance for Taylor Kim was shared with Coach Maya and Nutrition.',
    type: 'alerts',
    read: true,
    createdAt: '2026-09-08T14:40:00',
    link: '/medical/health-alerts/HRA-201',
  },
  {
    id: 'mn-7',
    title: 'New enrolment pending medical clearance',
    message: 'Centre manager flagged a new Health Monitoring Pathway enrolment for review.',
    type: 'manager',
    read: true,
    createdAt: '2026-09-07T11:15:00',
    link: '/medical/dashboard',
  },
  {
    id: 'mn-8',
    title: 'Assessment completed',
    message: 'Programme health review for Sahan De Silva was marked completed.',
    type: 'assessments',
    read: true,
    createdAt: '2026-09-05T14:20:00',
    link: '/medical/assessments/ha-3',
  },
  {
    id: 'mn-9',
    title: 'Appointment cancelled',
    message: 'Routine check-up with Dilani Fernando on Aug 28 was cancelled.',
    type: 'appointments',
    read: true,
    createdAt: '2026-08-27T15:00:00',
    link: '/medical/appointments',
  },
]

function delay(ms = 420) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function fetchMedicalNotifications() {
  if (USE_MOCK) { await delay(); return store.map((n) => ({ ...n })) }
  return apiRequest('/api/medical/notifications')
}

export async function markMedicalNotificationRead(id) {
  if (USE_MOCK) { await delay(250); return { id, read: true } }
  return apiRequest(`/api/medical/notifications/${id}/read`, { method: 'PATCH' })
}

export async function markAllMedicalNotificationsRead() {
  if (USE_MOCK) { await delay(350); return { success: true } }
  return apiRequest('/api/medical/notifications/read-all', { method: 'PATCH' })
}
