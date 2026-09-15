import { apiRequest, USE_MOCK } from '../../../../api/client'
export const nutritionClients = [
  {
    id: 'BF-C1024',
    name: 'Alex Perera',
    programme: 'Weight Management Programme',
    mealPlanId: 'mp-1',
    mealPlan: 'Balanced Wellness Meal Plan',
    planStatus: 'Review Due',
    dietaryStatus: 'Active',
    reviewStatus: 'Review Due',
    lastReview: '2026-08-28',
    nextConsultation: '2026-09-10',
    status: 'Active',
    goals: [
      'Improve meal consistency',
      'Support steady energy levels',
      'Follow dietary guidance gently',
    ],
    preferences: ['Prefers warm breakfasts', 'Simple meal preparation'],
    mealPattern: '3 main meals + 2 snacks',
    guidance:
      'Meal planning should consider the client’s recorded dietary restrictions. Keep changes gradual and supportive.',
    reviewRequired: false,
    currentPlan: {
      id: 'mp-1',
      name: 'Balanced Wellness Meal Plan',
      startDate: '2026-09-01',
      endDate: '2026-09-30',
      currentWeek: 2,
      status: 'Review Due',
      lastUpdated: '2026-09-08',
      progress: 48,
    },
    progressMetrics: [
      { label: 'Meal-plan participation', value: 84 },
      { label: 'Weekly consistency', value: 78 },
      { label: 'Consultation attendance', value: 100 },
    ],
    consultations: [
      {
        id: 'nc1',
        date: '2026-08-28',
        type: 'Nutrition Follow-up',
        summary: 'Warm breakfast options working well; continue hydration reminders.',
        nextReview: '2026-09-10',
      },
    ],
  },
  {
    id: 'BF-C1088',
    name: 'Sahan De Silva',
    programme: 'Complete Wellness Programme',
    mealPlanId: 'mp-2',
    mealPlan: 'Recovery Nourish Plan',
    planStatus: 'Active',
    dietaryStatus: 'Active',
    reviewStatus: 'On Track',
    lastReview: '2026-09-03',
    nextConsultation: '2026-09-11',
    status: 'Active',
    goals: ['Support recovery routines', 'Maintain nourishing meal rhythm'],
    preferences: ['Lighter evening meals'],
    mealPattern: '3 main meals + 1 snack',
    guidance: 'High-level wellness guidance supports steady hydration and regular meal timing.',
    reviewRequired: false,
    currentPlan: {
      id: 'mp-2',
      name: 'Recovery Nourish Plan',
      startDate: '2026-08-20',
      endDate: '2026-09-20',
      currentWeek: 3,
      status: 'Active',
      lastUpdated: '2026-09-03',
      progress: 72,
    },
    progressMetrics: [
      { label: 'Meal-plan participation', value: 88 },
      { label: 'Weekly consistency', value: 82 },
      { label: 'Consultation attendance', value: 95 },
    ],
    consultations: [
      {
        id: 'nc2',
        date: '2026-09-03',
        type: 'Meal Plan Review',
        summary: 'Plan remains supportive; keep evening meals lighter.',
        nextReview: '2026-09-11',
      },
    ],
  },
  {
    id: 'BF-C1102',
    name: 'Taylor Kim',
    programme: 'Health Monitoring Pathway',
    mealPlanId: 'mp-3',
    mealPlan: 'Gentle Fuel Plan',
    planStatus: 'Active',
    dietaryStatus: 'Under Review',
    reviewStatus: 'Needs Follow-up',
    lastReview: '2026-08-20',
    nextConsultation: '2026-09-12',
    status: 'Active',
    goals: ['Support joint-friendly energy', 'Keep meal structure simple'],
    preferences: ['Soft textures preferred', 'Vegetarian preference'],
    mealPattern: '3 main meals',
    guidance:
      'Professional review recommended before significant dietary-plan changes.',
    reviewRequired: true,
    currentPlan: {
      id: 'mp-3',
      name: 'Gentle Fuel Plan',
      startDate: '2026-08-25',
      endDate: '2026-10-06',
      currentWeek: 2,
      status: 'Active',
      lastUpdated: '2026-09-07',
      progress: 40,
    },
    progressMetrics: [
      { label: 'Meal-plan participation', value: 62 },
      { label: 'Weekly consistency', value: 58 },
      { label: 'Consultation attendance', value: 80 },
    ],
    consultations: [
      {
        id: 'nc3',
        date: '2026-08-20',
        type: 'Initial Nutrition Consultation',
        summary: 'Start with simple vegetarian meals and soft textures.',
        nextReview: '2026-09-12',
      },
    ],
  },
  {
    id: 'BF-C1110',
    name: 'Dilani Fernando',
    programme: 'Weight Management Programme',
    mealPlanId: 'mp-4',
    mealPlan: 'Everyday Balance Plan',
    planStatus: 'Active',
    dietaryStatus: 'Active',
    reviewStatus: 'On Track',
    lastReview: '2026-08-22',
    nextConsultation: '2026-09-10',
    status: 'Active',
    goals: ['Build consistent meal rhythm'],
    preferences: ['Home-cooked meals'],
    mealPattern: '3 main meals + 2 snacks',
    guidance: 'Supportive meal consistency guidance only.',
    reviewRequired: false,
    currentPlan: {
      id: 'mp-4',
      name: 'Everyday Balance Plan',
      startDate: '2026-08-18',
      endDate: '2026-10-13',
      currentWeek: 3,
      status: 'Active',
      lastUpdated: '2026-08-22',
      progress: 55,
    },
    progressMetrics: [
      { label: 'Meal-plan participation', value: 70 },
      { label: 'Weekly consistency', value: 66 },
      { label: 'Consultation attendance', value: 85 },
    ],
    consultations: [],
  },
  {
    id: 'BF-C1201',
    name: 'Kasuni Abeysekara',
    programme: 'General Wellness',
    mealPlanId: '',
    mealPlan: 'Not assigned',
    planStatus: 'Draft',
    dietaryStatus: 'Active',
    reviewStatus: 'Review Due',
    lastReview: '',
    nextConsultation: '2026-09-14',
    status: 'Active',
    goals: ['Establish a calm weekly meal rhythm'],
    preferences: ['Simple recipes'],
    mealPattern: '3 main meals',
    guidance: 'Peanut allergy is medically recorded and must guide meal planning.',
    reviewRequired: false,
    currentPlan: null,
    progressMetrics: [
      { label: 'Meal-plan participation', value: 0 },
      { label: 'Weekly consistency', value: 0 },
      { label: 'Consultation attendance', value: 0 },
    ],
    consultations: [],
  },
]

function delay(ms = 400) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function formatNutritionDate(iso) {
  if (!iso) return '—'
  return new Date(`${iso}T00:00:00`).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export async function fetchNutritionClients() {
  if (USE_MOCK) { await delay(); return nutritionClients.map((c) => ({ ...c })) }
  return apiRequest('/api/nutrition/clients')
}

export async function fetchNutritionClientById(id) {
  if (USE_MOCK) {
    await delay()
    const found = nutritionClients.find((c) => c.id === id)
    if (!found) throw new Error('Not found')
    return structuredClone(found)
  }
  return apiRequest(`/api/nutrition/clients/${id}`)
}

export function getNutritionClientOptions() {
  return nutritionClients.map((c) => ({
    value: c.id,
    label: `${c.name} (${c.id})`,
    client: c,
  }))
}
