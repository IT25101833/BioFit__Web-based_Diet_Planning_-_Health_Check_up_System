import { apiRequest, USE_MOCK } from '../../../../api/client'
export const coachProfile = {
  id: 'BF-FC01',
  firstName: 'Maya',
  lastName: 'Fernando',
  email: 'maya.fernando@vitallife.lk',
  contactNumber: '+94 77 445 2210',
  role: 'Fitness Coach',
  specialization: 'Strength, mobility & sustainable movement',
  experience: '8 years',
  centre: 'VitalLife Wellness · Colombo',
}

export const coachDashboard = {
  greetingName: 'Maya',
  stats: {
    assignedClients: { value: 24, hint: '3 new this month' },
    todaysSessions: { value: 6, hint: 'Next session at 10:30 AM' },
    activePlans: { value: 18, hint: '4 ending soon' },
    assessmentsDue: { value: 5, hint: '2 due today' },
  },
  todaysSchedule: [
    {
      id: 'cs1',
      time: '09:00 AM',
      clientId: 'BF-C1024',
      client: 'Alex Perera',
      sessionType: 'Strength Training',
      workout: 'Upper Body Strength',
      duration: '45 min',
      status: 'Completed',
    },
    {
      id: 'cs2',
      time: '10:30 AM',
      clientId: 'BF-C1088',
      client: 'Sahan De Silva',
      sessionType: 'Mobility Session',
      workout: 'Recovery & Mobility',
      duration: '40 min',
      status: 'In Progress',
    },
    {
      id: 'cs3',
      time: '12:00 PM',
      clientId: 'BF-C1102',
      client: 'Taylor Kim',
      sessionType: 'Cardio & Balance',
      workout: 'Steady Movement',
      duration: '35 min',
      status: 'Upcoming',
    },
    {
      id: 'cs4',
      time: '02:30 PM',
      clientId: 'BF-C1110',
      client: 'Dilani Fernando',
      sessionType: 'Full Body',
      workout: 'Beginner Strength',
      duration: '45 min',
      status: 'Upcoming',
    },
  ],
  attention: [
    {
      id: 'att1',
      clientId: 'BF-C1201',
      client: 'Kasuni Abeysekara',
      reason: 'Fitness Assessment Due',
      due: 'Due Sep 12',
    },
    {
      id: 'att2',
      clientId: 'BF-C1088',
      client: 'Sahan De Silva',
      reason: 'Workout plan ending soon',
      due: 'Ends Sep 20',
    },
    {
      id: 'att3',
      clientId: 'BF-C1102',
      client: 'Taylor Kim',
      reason: 'Progress update overdue',
      due: 'Update due',
    },
    {
      id: 'att4',
      clientId: 'BF-C1024',
      client: 'Alex Perera',
      reason: 'Safety consideration to review',
      due: 'Low-impact guidance',
    },
  ],
  progressTrend: [
    { label: 'Mon', value: 72 },
    { label: 'Tue', value: 78 },
    { label: 'Wed', value: 70 },
    { label: 'Thu', value: 82 },
    { label: 'Fri', value: 76 },
    { label: 'Sat', value: 68 },
    { label: 'Sun', value: 64 },
  ],
  activePlans: [
    {
      id: 'wp-1',
      name: 'Beginner Strength & Mobility',
      client: 'Alex Perera',
      clientId: 'BF-C1024',
      weekLabel: 'Week 4 of 8',
      progress: 65,
      status: 'Active',
    },
    {
      id: 'wp-2',
      name: 'Energy Recovery Pathway',
      client: 'Sahan De Silva',
      clientId: 'BF-C1088',
      weekLabel: 'Week 6 of 8',
      progress: 78,
      status: 'Active',
    },
    {
      id: 'wp-3',
      name: 'Steady Cardio Foundations',
      client: 'Taylor Kim',
      clientId: 'BF-C1102',
      weekLabel: 'Week 2 of 6',
      progress: 32,
      status: 'Active',
    },
  ],
  recentActivity: [
    {
      id: 'ra1',
      text: 'Alex Perera completed Full Body Workout.',
      at: 'Today · 9:48 AM',
    },
    {
      id: 'ra2',
      text: 'Sahan De Silva completed Week 3 assessment.',
      at: 'Yesterday · 4:10 PM',
    },
    {
      id: 'ra3',
      text: 'Taylor Kim reached 80% workout adherence.',
      at: 'Yesterday · 11:20 AM',
    },
    {
      id: 'ra4',
      text: 'Dilani Fernando’s workout plan was updated.',
      at: 'Sep 7 · 3:05 PM',
    },
  ],
}

function delay(ms = 400) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function fetchCoachDashboard() {
  if (USE_MOCK) {
    await delay()
    return structuredClone(coachDashboard)
  }
  return apiRequest('/api/coach/dashboard')
}

export async function fetchCoachProfile() {
  if (USE_MOCK) {
    await delay()
    return { ...coachProfile }
  }
  return apiRequest('/api/coach/profile')
}

export async function updateCoachProfile(payload) {
  if (USE_MOCK) {
    await delay(500)
    return { ...coachProfile, ...payload }
  }
  return apiRequest('/api/coach/profile', { method: 'PATCH', body: JSON.stringify(payload) })
}
