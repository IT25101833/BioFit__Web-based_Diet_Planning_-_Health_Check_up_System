import { apiRequest, USE_MOCK } from '../../../../api/client'

export const healthOverview = {
  latestCheckup: {
    date: '2026-08-20',
    title: 'Routine wellness check-up',
    summary: 'Overall wellness markers within expected ranges for your programme.',
  },
  medicalRecordStatus: 'Up to date',
  latestAssessment: {
    date: '2026-08-20',
    title: 'General health assessment',
    summary: 'No urgent concerns noted for client-facing guidance.',
  },
  upcomingReview: {
    date: '2026-09-25',
    title: 'Medical review',
  },
  safetyGuidance: [
    'Continue gradual activity increases as advised by your coach.',
    'Stay hydrated and rest when you feel unusually tired.',
    'Contact support if symptoms feel new or concerning.',
  ],
  activeAlertsCount: 1,
  heightCm: 170,
  weightKg: 72.5,
  bmi: 25.1,
  recentMetrics: [],
  goals: [],
}

export const healthAlerts = [
  {
    id: 'alert-1',
    title: 'Hydration reminder',
    status: 'Monitoring',
    dateRaised: '2026-09-01',
    followUpDate: '2026-09-15',
    guidance:
      'Aim for steady water intake through the day. Your care team will review this at your next check-in.',
  },
  {
    id: 'alert-2',
    title: 'Post-session recovery note',
    status: 'Resolved',
    dateRaised: '2026-08-12',
    followUpDate: '2026-08-26',
    guidance:
      'Extra rest days were recommended after a busy training week. This alert is now resolved.',
  },
]

function delay(ms = 420) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/** GET /api/client/health */
export async function fetchClientHealth() {
  if (USE_MOCK) {
    await delay()
    return structuredClone(healthOverview)
  }
  return apiRequest('/api/client/health')
}

/** GET /api/client/health-alerts */
export async function fetchClientHealthAlerts() {
  if (USE_MOCK) {
    await delay()
    return healthAlerts.map((item) => ({ ...item }))
  }
  return apiRequest('/api/client/health-alerts')
}

/** POST /api/client/health/metrics */
export async function createClientHealthMetric(payload) {
  if (USE_MOCK) {
    await delay(300)
    return { id: Date.now(), ...payload, recordedAt: new Date().toISOString().slice(0, 10) }
  }
  return apiRequest('/api/client/health/metrics', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

/** POST /api/client/health/goals */
export async function createClientHealthGoal(payload) {
  if (USE_MOCK) {
    await delay(300)
    return { id: Date.now(), status: 'ACTIVE', progressPercent: 0, ...payload }
  }
  return apiRequest('/api/client/health/goals', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}
