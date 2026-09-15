import { apiRequest, USE_MOCK } from '../../../../api/client'
export const managerProfile = {
  id: 'BF-M001',
  firstName: 'Sarah',
  lastName: 'Jayasuriya',
  email: 'nethmi.jayasuriya@vitallife.lk',
  contactNumber: '+94 77 220 1188',
  role: 'Wellness Centre Manager',
  centre: 'VitalLife Wellness · Colombo',
  memberSince: '2024-03-01',
}

export const managerDashboard = {
  greetingName: 'Sarah',
  stats: {
    activeProgrammes: { value: 12, hint: '2 starting this month' },
    activeClients: { value: 186, hint: '14 new enrolments this week' },
    staffAvailableToday: { value: 18, hint: '3 currently in session' },
    todaysAppointments: { value: 27, hint: '9 remaining this afternoon' },
  },
  todaysOperations: [
    {
      id: 'op-1',
      time: '09:00 AM',
      service: 'Fitness Consultation',
      professional: 'Maya Fernando',
      client: 'Alex Perera',
      programme: 'Weight Management',
      status: 'Completed',
    },
    {
      id: 'op-2',
      time: '10:30 AM',
      service: 'Nutrition Consultation',
      professional: 'Maya Fernando',
      client: 'Sahan De Silva',
      programme: 'Integrated Wellness',
      status: 'In Progress',
    },
    {
      id: 'op-3',
      time: '11:15 AM',
      service: 'Health Check-up',
      professional: 'Elena Costa',
      client: 'Taylor Kim',
      programme: 'Health Monitoring',
      status: 'Scheduled',
    },
    {
      id: 'op-4',
      time: '02:00 PM',
      service: 'Wellness Consultation',
      professional: 'Nova Dias',
      client: 'Dilani Fernando',
      programme: 'General Wellness',
      status: 'Scheduled',
    },
    {
      id: 'op-5',
      time: '03:30 PM',
      service: 'Fitness Session',
      professional: 'Daniel Perera',
      client: 'Group · Studio 2',
      programme: 'Complete Wellness',
      status: 'Scheduled',
    },
  ],
  enrolmentTrend: [
    { label: 'Apr', value: 18 },
    { label: 'May', value: 22 },
    { label: 'Jun', value: 27 },
    { label: 'Jul', value: 31 },
    { label: 'Aug', value: 29 },
    { label: 'Sep', value: 34 },
  ],
  activeProgrammes: [
    {
      id: 'prog-complete',
      title: 'Complete Wellness Programme',
      type: 'Integrated Wellness',
      enrolled: 24,
      capacity: 30,
      staff: 'Maya Fernando · Maya Fernando',
      status: 'Active',
    },
    {
      id: 'prog-weight',
      title: 'Weight Management Programme',
      type: 'Weight Management',
      enrolled: 18,
      capacity: 25,
      staff: 'Daniel Perera · Nova Dias',
      status: 'Active',
    },
    {
      id: 'prog-energy',
      title: 'Energy & Recovery Reset',
      type: 'Fitness',
      enrolled: 12,
      capacity: 20,
      staff: 'Maya Fernando · Maya Fernando',
      status: 'Active',
    },
  ],
  staffAvailability: [
    { id: 's1', name: 'Maya Fernando', role: 'Fitness Coach', status: 'In Session' },
    { id: 's2', name: 'Daniel Perera', role: 'Fitness Coach', status: 'Available' },
    { id: 's3', name: 'Maya Fernando', role: 'Nutrition Consultant', status: 'In Session' },
    { id: 's4', name: 'Nova Dias', role: 'Nutrition Consultant', status: 'Available' },
    { id: 's5', name: 'Elena Costa', role: 'Medical Advisor', status: 'Available' },
    { id: 's6', name: 'Tharindu Perera', role: 'Fitness Coach', status: 'Unavailable' },
  ],
  recentActivity: [
    {
      id: 'a1',
      text: 'New client enrolled in Weight Management Programme',
      at: 'Today · 9:42 AM',
    },
    {
      id: 'a2',
      text: 'Nutrition consultation schedule updated for Studio B',
      at: 'Today · 8:55 AM',
    },
    {
      id: 'a3',
      text: 'Fitness Coach assigned to Complete Wellness Programme',
      at: 'Yesterday · 4:20 PM',
    },
    {
      id: 'a4',
      text: 'Programme capacity warning: Complete Wellness at 80%',
      at: 'Yesterday · 1:10 PM',
    },
  ],
}

function delay(ms = 400) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/** GET /api/manager/dashboard */
export async function fetchManagerDashboard() {
  if (USE_MOCK) {
    await delay()
    return structuredClone(managerDashboard)
  }
  return apiRequest('/api/manager/dashboard')
}

/** GET /api/manager/profile */
export async function fetchManagerProfile() {
  if (USE_MOCK) {
    await delay()
    return { ...managerProfile }
  }
  return apiRequest('/api/manager/profile')
}

/** PATCH /api/manager/profile */
export async function updateManagerProfile(payload) {
  if (USE_MOCK) {
    await delay(500)
    return { ...managerProfile, ...payload }
  }
  return apiRequest('/api/manager/profile', { method: 'PATCH', body: JSON.stringify(payload) })
}
