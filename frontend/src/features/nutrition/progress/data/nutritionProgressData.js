import { apiRequest, USE_MOCK } from '../../../../api/client'
export const nutritionProgressRows = [
  {
    clientId: 'BF-C1024',
    clientName: 'Alex Perera',
    mealPlan: 'Balanced Wellness Meal Plan',
    mealPlanId: 'mp-1',
    currentWeek: 'Week 2 of 4',
    participation: 84,
    lastUpdate: '2026-09-08',
    lastConsultation: '2026-08-28',
    nextReview: '2026-09-10',
    status: 'Review Due',
    weeklyParticipation: [70, 75, 80, 84, 82, 78, 80],
  },
  {
    clientId: 'BF-C1088',
    clientName: 'Sahan De Silva',
    mealPlan: 'Recovery Nourish Plan',
    mealPlanId: 'mp-2',
    currentWeek: 'Week 3 of 4',
    participation: 88,
    lastUpdate: '2026-09-07',
    lastConsultation: '2026-09-03',
    nextReview: '2026-09-11',
    status: 'On Track',
    weeklyParticipation: [80, 82, 85, 86, 88, 90, 88],
  },
  {
    clientId: 'BF-C1102',
    clientName: 'Taylor Kim',
    mealPlan: 'Gentle Fuel Plan',
    mealPlanId: 'mp-3',
    currentWeek: 'Week 2 of 6',
    participation: 62,
    lastUpdate: '2026-09-01',
    lastConsultation: '2026-08-20',
    nextReview: '2026-09-12',
    status: 'Needs Follow-up',
    weeklyParticipation: [50, 55, 58, 60, 62, 64, 65],
  },
  {
    clientId: 'BF-C1110',
    clientName: 'Dilani Fernando',
    mealPlan: 'Everyday Balance Plan',
    mealPlanId: 'mp-4',
    currentWeek: 'Week 3 of 8',
    participation: 70,
    lastUpdate: '2026-09-02',
    lastConsultation: '2026-08-22',
    nextReview: '2026-09-10',
    status: 'On Track',
    weeklyParticipation: [60, 62, 65, 68, 70, 72, 70],
  },
]

function delay(ms = 400) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function fetchNutritionProgressRows() {
  if (USE_MOCK) { await delay(); return nutritionProgressRows.map((r) => ({ ...r })) }
  return apiRequest('/api/nutrition/progress')
}

export async function fetchNutritionClientProgress(clientId) {
  if (USE_MOCK) { await delay(); return structuredClone(nutritionProgressRows.find((r) => r.clientId === clientId) || {}) }
  return apiRequest(`/api/nutrition/progress/${clientId}`)
}

export async function saveNutritionProgress(payload) {
  if (USE_MOCK) { await delay(400); return payload }
  return apiRequest('/api/nutrition/progress', { method: 'POST', body: JSON.stringify(payload) })
}
