import { apiRequest, USE_MOCK } from '../../../../api/client'
export const assignedClients = [
  {
    id: 'BF-C1024',
    name: 'Alex Perera',
    age: 21,
    programme: 'Weight Management Programme',
    workoutPlanId: 'wp-1',
    workoutPlan: 'Beginner Strength & Mobility',
    planProgress: 65,
    lastAssessment: '2026-08-28',
    nextSession: '2026-09-10',
    status: 'Active',
    planStatus: 'Active',
    assessmentStatus: 'Up to date',
    progressStatus: 'On Track',
    goals: [
      'Improve cardiovascular endurance',
      'Increase overall strength',
      'Improve flexibility',
    ],
    activityLevel: 'Moderately Active',
    experience: 'Beginner',
    preferences: ['Strength Training', 'Walking', 'Low-impact cardio'],
    safety: {
      medicalClearance: 'Approved',
      restrictions: ['Avoid high-impact activities'],
      mobilityNotes: ['Limited shoulder range on left side'],
      reviewRequired: false,
    },
    currentPlan: {
      id: 'wp-1',
      name: 'Beginner Strength & Mobility',
      startDate: '2026-09-01',
      endDate: '2026-10-27',
      currentWeek: 4,
      totalWeeks: 8,
      progress: 65,
      status: 'Active',
    },
    progressMetrics: [
      { label: 'Workout completion', value: 72 },
      { label: 'Training consistency', value: 68 },
      { label: 'Session attendance', value: 90 },
      { label: 'Assessment improvement', value: 55 },
    ],
    recentAssessments: [
      {
        id: 'fa-1',
        date: '2026-08-28',
        type: 'Progress Assessment',
        summary: 'Steady improvement in mobility and session consistency.',
        recordedBy: 'Maya Fernando',
      },
      {
        id: 'fa-0',
        date: '2026-07-30',
        type: 'Initial Fitness Assessment',
        summary: 'Comfortable starting point with room for gradual progression.',
        recordedBy: 'Maya Fernando',
      },
    ],
  },
  {
    id: 'BF-C1088',
    name: 'Sahan De Silva',
    age: 28,
    programme: 'Complete Wellness Programme',
    workoutPlanId: 'wp-2',
    workoutPlan: 'Energy Recovery Pathway',
    planProgress: 78,
    lastAssessment: '2026-09-03',
    nextSession: '2026-09-11',
    status: 'Active',
    planStatus: 'Active',
    assessmentStatus: 'Up to date',
    progressStatus: 'On Track',
    goals: ['Improve recovery routines', 'Build steady energy'],
    activityLevel: 'Active',
    experience: 'Intermediate',
    preferences: ['Mobility', 'Light strength', 'Walking'],
    safety: {
      medicalClearance: 'Approved',
      restrictions: [],
      mobilityNotes: [],
      reviewRequired: false,
    },
    currentPlan: {
      id: 'wp-2',
      name: 'Energy Recovery Pathway',
      startDate: '2026-08-01',
      endDate: '2026-09-20',
      currentWeek: 6,
      totalWeeks: 8,
      progress: 78,
      status: 'Active',
    },
    progressMetrics: [
      { label: 'Workout completion', value: 84 },
      { label: 'Training consistency', value: 80 },
      { label: 'Session attendance', value: 95 },
      { label: 'Assessment improvement', value: 70 },
    ],
    recentAssessments: [
      {
        id: 'fa-2',
        date: '2026-09-03',
        type: 'Progress Assessment',
        summary: 'Recovery habits improving; ready for gentle progression.',
        recordedBy: 'Maya Fernando',
      },
    ],
  },
  {
    id: 'BF-C1102',
    name: 'Taylor Kim',
    age: 34,
    programme: 'Health Monitoring Pathway',
    workoutPlanId: 'wp-3',
    workoutPlan: 'Steady Cardio Foundations',
    planProgress: 32,
    lastAssessment: '2026-08-10',
    nextSession: '2026-09-12',
    status: 'Active',
    planStatus: 'Active',
    assessmentStatus: 'Due',
    progressStatus: 'Update Due',
    goals: ['Improve walking endurance', 'Support joint comfort'],
    activityLevel: 'Lightly Active',
    experience: 'Beginner',
    preferences: ['Walking', 'Balance', 'Flexibility'],
    safety: {
      medicalClearance: 'Approved',
      restrictions: ['Avoid prolonged high-intensity intervals'],
      mobilityNotes: ['Knee comfort preference for low-impact options'],
      reviewRequired: true,
    },
    currentPlan: {
      id: 'wp-3',
      name: 'Steady Cardio Foundations',
      startDate: '2026-08-25',
      endDate: '2026-10-06',
      currentWeek: 2,
      totalWeeks: 6,
      progress: 32,
      status: 'Active',
    },
    progressMetrics: [
      { label: 'Workout completion', value: 58 },
      { label: 'Training consistency', value: 52 },
      { label: 'Session attendance', value: 75 },
      { label: 'Assessment improvement', value: 40 },
    ],
    recentAssessments: [
      {
        id: 'fa-3',
        date: '2026-08-10',
        type: 'Initial Fitness Assessment',
        summary: 'Start with low-impact walking and balance work.',
        recordedBy: 'Maya Fernando',
      },
    ],
  },
  {
    id: 'BF-C1110',
    name: 'Dilani Fernando',
    age: 26,
    programme: 'Weight Management Programme',
    workoutPlanId: 'wp-4',
    workoutPlan: 'Full Body Foundations',
    planProgress: 45,
    lastAssessment: '2026-08-20',
    nextSession: '2026-09-10',
    status: 'Active',
    planStatus: 'Active',
    assessmentStatus: 'Up to date',
    progressStatus: 'Needs Review',
    goals: ['Build consistent training habits'],
    activityLevel: 'Moderately Active',
    experience: 'Beginner',
    preferences: ['Strength Training', 'Stretching'],
    safety: {
      medicalClearance: 'Approved',
      restrictions: [],
      mobilityNotes: [],
      reviewRequired: false,
    },
    currentPlan: {
      id: 'wp-4',
      name: 'Full Body Foundations',
      startDate: '2026-08-18',
      endDate: '2026-10-13',
      currentWeek: 3,
      totalWeeks: 8,
      progress: 45,
      status: 'Active',
    },
    progressMetrics: [
      { label: 'Workout completion', value: 60 },
      { label: 'Training consistency', value: 55 },
      { label: 'Session attendance', value: 80 },
      { label: 'Assessment improvement', value: 48 },
    ],
    recentAssessments: [
      {
        id: 'fa-4',
        date: '2026-08-20',
        type: 'Progress Assessment',
        summary: 'Good engagement; keep session volume steady.',
        recordedBy: 'Maya Fernando',
      },
    ],
  },
  {
    id: 'BF-C1201',
    name: 'Kasuni Abeysekara',
    age: 31,
    programme: 'General Wellness',
    workoutPlanId: '',
    workoutPlan: 'Not assigned',
    planProgress: 0,
    lastAssessment: '',
    nextSession: '2026-09-14',
    status: 'Active',
    planStatus: 'Draft',
    assessmentStatus: 'Due',
    progressStatus: 'Update Due',
    goals: ['Establish a gentle weekly movement rhythm'],
    activityLevel: 'Lightly Active',
    experience: 'Beginner',
    preferences: ['Walking', 'Mobility'],
    safety: {
      medicalClearance: 'Approved',
      restrictions: [],
      mobilityNotes: [],
      reviewRequired: false,
    },
    currentPlan: null,
    progressMetrics: [
      { label: 'Workout completion', value: 0 },
      { label: 'Training consistency', value: 0 },
      { label: 'Session attendance', value: 0 },
      { label: 'Assessment improvement', value: 0 },
    ],
    recentAssessments: [],
  },
]

function delay(ms = 400) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function formatCoachDate(iso) {
  if (!iso) return '—'
  return new Date(`${iso}T00:00:00`).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export async function fetchCoachClients() {
  if (USE_MOCK) {
    await delay()
    return assignedClients.map((c) => ({ ...c }))
  }
  return apiRequest('/api/coach/clients')
}

export async function fetchCoachClientById(id) {
  if (USE_MOCK) {
    await delay()
    const found = assignedClients.find((c) => c.id === id)
    if (!found) throw new Error('Not found')
    return structuredClone(found)
  }
  return apiRequest(`/api/coach/clients/${id}`)
}
