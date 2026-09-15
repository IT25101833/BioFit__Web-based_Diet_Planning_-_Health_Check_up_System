import { apiRequest, USE_MOCK } from '../../../../api/client'
export const staffMembers = [
  { id: 'maya', name: 'Maya Fernando', role: 'Fitness Coach', status: 'In Session' },
  { id: 'kasun', name: 'Daniel Perera', role: 'Fitness Coach', status: 'Available' },
  { id: 'tharindu', name: 'Tharindu Perera', role: 'Fitness Coach', status: 'Unavailable' },
  { id: 'ruwan', name: 'Maya Fernando', role: 'Nutrition Consultant', status: 'Available' },
  { id: 'amaya', name: 'Nova Dias', role: 'Nutrition Consultant', status: 'Break' },
  { id: 'nimali', name: 'Elena Costa', role: 'Medical Advisor', status: 'Available' },
]

export let scheduleEvents = [
  {
    id: 'sch-1',
    date: '2026-09-09',
    startTime: '09:00',
    endTime: '09:45',
    staffId: 'maya',
    staffName: 'Maya Fernando',
    role: 'Fitness Coach',
    service: 'Fitness Consultation',
    client: 'Alex Perera',
    programme: 'Weight Management',
    status: 'Completed',
    notes: '',
  },
  {
    id: 'sch-2',
    date: '2026-09-09',
    startTime: '10:30',
    endTime: '11:15',
    staffId: 'ruwan',
    staffName: 'Maya Fernando',
    role: 'Nutrition Consultant',
    service: 'Nutrition Consultation',
    client: 'Sahan De Silva',
    programme: 'Complete Wellness',
    status: 'In Progress',
    notes: '',
  },
  {
    id: 'sch-3',
    date: '2026-09-09',
    startTime: '11:15',
    endTime: '12:15',
    staffId: 'nimali',
    staffName: 'Elena Costa',
    role: 'Medical Advisor',
    service: 'Health Check-up',
    client: 'Taylor Kim',
    programme: 'Health Monitoring',
    status: 'Scheduled',
    notes: 'Room: Health Suite',
  },
  {
    id: 'sch-4',
    date: '2026-09-10',
    startTime: '09:30',
    endTime: '10:15',
    staffId: 'kasun',
    staffName: 'Daniel Perera',
    role: 'Fitness Coach',
    service: 'Fitness Session',
    client: 'Group · Studio 2',
    programme: 'Complete Wellness',
    status: 'Scheduled',
    notes: '',
  },
  {
    id: 'sch-5',
    date: '2026-09-10',
    startTime: '14:00',
    endTime: '14:40',
    staffId: 'amaya',
    staffName: 'Nova Dias',
    role: 'Nutrition Consultant',
    service: 'Wellness Consultation',
    client: 'Dilani Fernando',
    programme: 'General Wellness',
    status: 'Scheduled',
    notes: '',
  },
  {
    id: 'sch-6',
    date: '2026-09-11',
    startTime: '15:00',
    endTime: '15:45',
    staffId: 'maya',
    staffName: 'Maya Fernando',
    role: 'Fitness Coach',
    service: 'Fitness Consultation',
    client: 'Nuwan Rathnayake',
    programme: 'Energy & Recovery',
    status: 'Scheduled',
    notes: '',
  },
]

let scheduleStore = scheduleEvents.map((item) => ({ ...item }))

function delay(ms = 400) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/** GET /api/manager/schedules */
export async function fetchStaffSchedules() {
  if (USE_MOCK) {
    await delay()
    return structuredClone({ staff: staffMembers, events: scheduleEvents })
  }
  return apiRequest('/api/manager/schedules')
}

/** POST /api/manager/schedules */
export async function saveStaffSchedule(payload) {
  if (USE_MOCK) {
    await delay(500)
    const created = { id: `sch-${Date.now()}`, ...payload }
    scheduleEvents = [created, ...scheduleEvents]
    return created
  }
  return apiRequest('/api/manager/schedules', { method: 'POST', body: JSON.stringify(payload) })
}

/** PATCH cancel */
export async function cancelStaffSchedule(id) {
  if (USE_MOCK) {
    await delay(400)
    scheduleEvents = scheduleEvents.map((e) => (e.id === id ? { ...e, status: 'Cancelled' } : e))
    return { id, status: 'Cancelled' }
  }
  return apiRequest(`/api/manager/schedules/${id}/cancel`, { method: 'PATCH' })
}
