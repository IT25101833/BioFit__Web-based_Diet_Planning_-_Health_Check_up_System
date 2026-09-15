import { apiRequest, USE_MOCK } from '../../../../api/client'
import { assignedClients } from '../../clients/data/clientFitnessData'

export const workoutPlansSeed = [
  {
    id: 'wp-1',
    name: 'Beginner Strength & Mobility',
    clientId: 'BF-C1024',
    clientName: 'Alex Perera',
    programme: 'Weight Management Programme',
    goal: 'Build foundational strength with joint-friendly movement',
    difficulty: 'Beginner',
    startDate: '2026-09-01',
    endDate: '2026-10-27',
    sessionsPerWeek: 3,
    sessionDuration: '45 min',
    description: 'A calm progression of strength, mobility, and walking.',
    currentWeek: 4,
    totalWeeks: 8,
    progress: 65,
    status: 'Active',
    weeks: [
      {
        id: 'w1',
        label: 'Week 1',
        days: [
          {
            id: 'd1',
            day: 'Monday',
            title: 'Full Body Strength',
            exercises: [
              {
                exerciseId: 'ex-1',
                name: 'Bodyweight Squat',
                sets: '3',
                reps: '12',
                duration: '',
                rest: '60 sec',
                notes: '',
              },
              {
                exerciseId: 'ex-2',
                name: 'Incline Push-up',
                sets: '3',
                reps: '10',
                duration: '',
                rest: '60 sec',
                notes: '',
              },
              {
                exerciseId: 'ex-3',
                name: 'Brisk Walk',
                sets: '1',
                reps: '',
                duration: '15 min',
                rest: '',
                notes: 'Conversational pace',
              },
            ],
          },
          {
            id: 'd2',
            day: 'Wednesday',
            title: 'Cardio & Mobility',
            exercises: [
              {
                exerciseId: 'ex-3',
                name: 'Brisk Walk',
                sets: '1',
                reps: '',
                duration: '20 min',
                rest: '',
                notes: '',
              },
              {
                exerciseId: 'ex-4',
                name: 'Hip Opener Stretch',
                sets: '2',
                reps: '',
                duration: '45 sec / side',
                rest: '15 sec',
                notes: '',
              },
            ],
          },
          {
            id: 'd3',
            day: 'Friday',
            title: 'Strength & Balance',
            exercises: [
              {
                exerciseId: 'ex-6',
                name: 'Band Row',
                sets: '3',
                reps: '12',
                duration: '',
                rest: '60 sec',
                notes: '',
              },
              {
                exerciseId: 'ex-5',
                name: 'Single-leg Balance Hold',
                sets: '2',
                reps: '',
                duration: '20 sec / side',
                rest: '20 sec',
                notes: 'Use support if needed',
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'wp-2',
    name: 'Energy Recovery Pathway',
    clientId: 'BF-C1088',
    clientName: 'Sahan De Silva',
    programme: 'Complete Wellness Programme',
    goal: 'Support recovery and steady energy',
    difficulty: 'Intermediate',
    startDate: '2026-08-01',
    endDate: '2026-09-20',
    sessionsPerWeek: 3,
    sessionDuration: '40 min',
    description: 'Mobility-led sessions with light strength.',
    currentWeek: 6,
    totalWeeks: 8,
    progress: 78,
    status: 'Active',
    weeks: [
      {
        id: 'w1',
        label: 'Week 1',
        days: [
          {
            id: 'd1',
            day: 'Tuesday',
            title: 'Recovery & Mobility',
            exercises: [
              {
                exerciseId: 'ex-4',
                name: 'Hip Opener Stretch',
                sets: '2',
                reps: '',
                duration: '45 sec / side',
                rest: '15 sec',
                notes: '',
              },
              {
                exerciseId: 'ex-3',
                name: 'Brisk Walk',
                sets: '1',
                reps: '',
                duration: '20 min',
                rest: '',
                notes: '',
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'wp-3',
    name: 'Steady Cardio Foundations',
    clientId: 'BF-C1102',
    clientName: 'Taylor Kim',
    programme: 'Health Monitoring Pathway',
    goal: 'Build low-impact endurance',
    difficulty: 'Beginner',
    startDate: '2026-08-25',
    endDate: '2026-10-06',
    sessionsPerWeek: 3,
    sessionDuration: '35 min',
    description: 'Walking and balance focus with careful intensity.',
    currentWeek: 2,
    totalWeeks: 6,
    progress: 32,
    status: 'Active',
    weeks: [
      {
        id: 'w1',
        label: 'Week 1',
        days: [
          {
            id: 'd1',
            day: 'Monday',
            title: 'Steady Movement',
            exercises: [
              {
                exerciseId: 'ex-3',
                name: 'Brisk Walk',
                sets: '1',
                reps: '',
                duration: '15 min',
                rest: '',
                notes: 'Flat terrain preferred',
              },
              {
                exerciseId: 'ex-5',
                name: 'Single-leg Balance Hold',
                sets: '2',
                reps: '',
                duration: '20 sec / side',
                rest: '20 sec',
                notes: '',
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'wp-4',
    name: 'Full Body Foundations',
    clientId: 'BF-C1110',
    clientName: 'Dilani Fernando',
    programme: 'Weight Management Programme',
    goal: 'Establish consistent training habits',
    difficulty: 'Beginner',
    startDate: '2026-08-18',
    endDate: '2026-10-13',
    sessionsPerWeek: 3,
    sessionDuration: '45 min',
    description: 'Balanced full-body sessions.',
    currentWeek: 3,
    totalWeeks: 8,
    progress: 45,
    status: 'Active',
    weeks: [
      {
        id: 'w1',
        label: 'Week 1',
        days: [
          {
            id: 'd1',
            day: 'Thursday',
            title: 'Full Body Ease',
            exercises: [
              {
                exerciseId: 'ex-1',
                name: 'Bodyweight Squat',
                sets: '3',
                reps: '10',
                duration: '',
                rest: '60 sec',
                notes: '',
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'wp-draft',
    name: 'Gentle Start Draft',
    clientId: 'BF-C1201',
    clientName: 'Kasuni Abeysekara',
    programme: 'General Wellness',
    goal: 'Introduce weekly movement rhythm',
    difficulty: 'Beginner',
    startDate: '2026-09-15',
    endDate: '2026-11-10',
    sessionsPerWeek: 2,
    sessionDuration: '30 min',
    description: 'Draft plan pending assignment.',
    currentWeek: 0,
    totalWeeks: 8,
    progress: 0,
    status: 'Draft',
    weeks: [],
  },
]

let plansStore = workoutPlansSeed.map((item) => structuredClone(item))

function delay(ms = 420) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function getClientOptions() {
  return assignedClients.map((c) => ({
    value: c.id,
    label: `${c.name} (${c.id})`,
    client: c,
  }))
}

export async function fetchWorkoutPlans() {
  if (USE_MOCK) {
    await delay()
    return plansStore.map((p) => ({ ...p }))
  }
  return apiRequest('/api/coach/workout-plans')
}

export async function fetchWorkoutPlanById(id) {
  if (USE_MOCK) {
    await delay()
    const found = plansStore.find((p) => p.id === id)
    if (!found) throw new Error('Not found')
    return structuredClone(found)
  }
  return apiRequest(`/api/coach/workout-plans/${id}`)
}

export async function createWorkoutPlan(payload) {
  if (USE_MOCK) {
    await delay(500)
    const created = { id: `wp-${Date.now()}`, ...payload }
    plansStore = [created, ...plansStore]
    return created
  }
  return apiRequest('/api/coach/workout-plans', { method: 'POST', body: JSON.stringify(payload) })
}

export async function updateWorkoutPlan(id, payload) {
  if (USE_MOCK) {
    await delay(500)
    plansStore = plansStore.map((p) => (p.id === id ? { ...p, ...payload } : p))
    return plansStore.find((p) => p.id === id)
  }
  return apiRequest(`/api/coach/workout-plans/${id}`, { method: 'PUT', body: JSON.stringify(payload) })
}

export async function archiveWorkoutPlan(id) {
  if (USE_MOCK) {
    await delay(400)
    return updateWorkoutPlan(id, { status: 'Archived' })
  }
  return apiRequest(`/api/coach/workout-plans/${id}/archive`, { method: 'PATCH' })
}

export async function duplicateWorkoutPlan(id) {
  if (USE_MOCK) {
    await delay(450)
    const found = plansStore.find((p) => p.id === id)
    const copy = { ...found, id: `wp-${Date.now()}`, name: `${found.name} (copy)` }
    plansStore = [copy, ...plansStore]
    return copy
  }
  return apiRequest(`/api/coach/workout-plans/${id}/duplicate`, { method: 'POST' })
}
