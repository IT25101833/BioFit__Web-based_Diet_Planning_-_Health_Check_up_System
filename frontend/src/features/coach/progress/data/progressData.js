import { apiRequest, USE_MOCK } from '../../../../api/client'
export const progressRows = [
  {
    clientId: 'BF-C1024',
    clientName: 'Alex Perera',
    workoutPlan: 'Beginner Strength & Mobility',
    currentWeek: 'Week 4 of 8',
    completion: 65,
    attendance: 90,
    lastUpdate: '2026-09-08',
    status: 'On Track',
    weeklyCompletion: [55, 60, 62, 65, 68, 70, 72],
    attendanceTrend: [80, 85, 90, 90, 95, 90, 90],
  },
  {
    clientId: 'BF-C1088',
    clientName: 'Sahan De Silva',
    workoutPlan: 'Energy Recovery Pathway',
    currentWeek: 'Week 6 of 8',
    completion: 78,
    attendance: 95,
    lastUpdate: '2026-09-07',
    status: 'On Track',
    weeklyCompletion: [70, 72, 74, 76, 78, 80, 82],
    attendanceTrend: [90, 90, 95, 95, 100, 95, 95],
  },
  {
    clientId: 'BF-C1102',
    clientName: 'Taylor Kim',
    workoutPlan: 'Steady Cardio Foundations',
    currentWeek: 'Week 2 of 6',
    completion: 32,
    attendance: 75,
    lastUpdate: '2026-08-30',
    status: 'Update Due',
    weeklyCompletion: [20, 25, 28, 30, 32, 34, 35],
    attendanceTrend: [60, 65, 70, 75, 70, 75, 80],
  },
  {
    clientId: 'BF-C1110',
    clientName: 'Dilani Fernando',
    workoutPlan: 'Full Body Foundations',
    currentWeek: 'Week 3 of 8',
    completion: 45,
    attendance: 80,
    lastUpdate: '2026-09-02',
    status: 'Needs Review',
    weeklyCompletion: [30, 35, 40, 42, 45, 48, 50],
    attendanceTrend: [70, 75, 80, 80, 85, 80, 80],
  },
]

function delay(ms = 400) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function fetchProgressRows() {
  if (USE_MOCK) {
    await delay()
    return progressRows.map((r) => ({ ...r }))
  }
  return apiRequest('/api/coach/progress')
}

export async function fetchClientProgress(clientId) {
  if (USE_MOCK) {
    await delay()
    return structuredClone(progressRows.find((r) => r.clientId === clientId) || {})
  }
  return apiRequest(`/api/coach/progress/${clientId}`)
}

export async function saveProgressRecord(payload) {
  if (USE_MOCK) {
    await delay(400)
    return payload
  }
  return apiRequest('/api/coach/progress', { method: 'POST', body: JSON.stringify(payload) })
}
