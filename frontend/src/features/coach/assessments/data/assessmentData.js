import { apiRequest, USE_MOCK } from '../../../../api/client'
let assessmentsStore = [
  {
    id: 'fa-1',
    clientId: 'BF-C1024',
    clientName: 'Alex Perera',
    date: '2026-08-28',
    type: 'Progress Assessment',
    coach: 'Maya Fernando',
    status: 'Completed',
    nextAssessment: '2026-09-28',
    activityLevel: 'Moderately Active',
    experience: 'Beginner',
    strength: 'Developing foundational control',
    endurance: 'Comfortable with short walking intervals',
    mobility: 'Shoulder range still limited on left side',
    flexibility: 'Improving with consistent stretching',
    goals: 'Improve strength and flexibility gradually',
    observations: 'Good adherence; keep impact low.',
    limitations: 'Avoid high-impact activities',
    safetyNotes: 'Continue low-impact options',
    reviewRequired: false,
    coachNotes: 'Progress is steady and sustainable.',
  },
  {
    id: 'fa-2',
    clientId: 'BF-C1088',
    clientName: 'Sahan De Silva',
    date: '2026-09-03',
    type: 'Progress Assessment',
    coach: 'Maya Fernando',
    status: 'Completed',
    nextAssessment: '2026-10-03',
    activityLevel: 'Active',
    experience: 'Intermediate',
    strength: 'Good control on light resistance work',
    endurance: 'Walking pace remains steady',
    mobility: 'Hip mobility improved',
    flexibility: 'Within expected comfort range',
    goals: 'Support recovery and energy',
    observations: 'Ready for gentle progression.',
    limitations: 'None noted for current plan',
    safetyNotes: '',
    reviewRequired: false,
    coachNotes: 'Maintain recovery emphasis.',
  },
  {
    id: 'fa-3',
    clientId: 'BF-C1102',
    clientName: 'Taylor Kim',
    date: '2026-08-10',
    type: 'Initial Fitness Assessment',
    coach: 'Maya Fernando',
    status: 'Follow-up',
    nextAssessment: '2026-09-12',
    activityLevel: 'Lightly Active',
    experience: 'Beginner',
    strength: 'Early stage',
    endurance: 'Prefers shorter sessions',
    mobility: 'Knee comfort preference',
    flexibility: 'Gentle range recommended',
    goals: 'Improve walking endurance safely',
    observations: 'Start conservatively.',
    limitations: 'Avoid prolonged high-intensity intervals',
    safetyNotes: 'Medical review required before intensity increases',
    reviewRequired: true,
    coachNotes: 'Coordinate with safety guidance before progressing.',
  },
]

function delay(ms = 400) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function fetchAssessments() {
  if (USE_MOCK) { await delay(); return assessmentsStore.map((a) => ({ ...a })) }
  return apiRequest('/api/coach/assessments')
}

export async function fetchAssessmentById(id) {
  if (USE_MOCK) {
    await delay()
    const found = assessmentsStore.find((a) => a.id === id)
    if (!found) throw new Error('Not found')
    return { ...found }
  }
  return apiRequest(`/api/coach/assessments/${id}`)
}

export async function createAssessment(payload) {
  if (USE_MOCK) {
    await delay(450)
    const created = { id: `fa-${Date.now()}`, ...payload }
    assessmentsStore = [created, ...assessmentsStore]
    return created
  }
  return apiRequest('/api/coach/assessments', { method: 'POST', body: JSON.stringify(payload) })
}
