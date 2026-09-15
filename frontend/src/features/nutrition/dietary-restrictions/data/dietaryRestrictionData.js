import { apiRequest, USE_MOCK } from '../../../../api/client'
let dietaryStore = [
  {
    id: 'dr-1',
    clientId: 'BF-C1024',
    clientName: 'Alex Perera',
    name: 'Lactose Intolerance',
    type: 'Food Intolerance',
    status: 'Active',
    dateRecorded: '2026-07-05',
    lastReviewed: '2026-09-08',
    mealPlan: 'Balanced Wellness Meal Plan',
    notes: 'Use dairy alternatives in breakfast and snacks.',
    mealPlanImpact: 'Prefer dairy-free yogurt and milk alternatives.',
    source: 'Nutrition Consultant',
    protected: false,
  },
  {
    id: 'dr-2',
    clientId: 'BF-C1024',
    clientName: 'Alex Perera',
    name: 'Warm breakfast preference',
    type: 'Preference',
    status: 'Active',
    dateRecorded: '2026-07-05',
    lastReviewed: '2026-09-01',
    mealPlan: 'Balanced Wellness Meal Plan',
    notes: 'Client prefers warm morning meals.',
    mealPlanImpact: 'Prioritise warm breakfast options.',
    source: 'Nutrition Consultant',
    protected: false,
  },
  {
    id: 'dr-3',
    clientId: 'BF-C1102',
    clientName: 'Taylor Kim',
    name: 'Vegetarian Preference',
    type: 'Preference',
    status: 'Active',
    dateRecorded: '2026-08-18',
    lastReviewed: '2026-09-07',
    mealPlan: 'Gentle Fuel Plan',
    notes: 'Vegetarian meal options preferred.',
    mealPlanImpact: 'Use plant-based proteins.',
    source: 'Nutrition Consultant',
    protected: false,
  },
  {
    id: 'dr-4',
    clientId: 'BF-C1102',
    clientName: 'Taylor Kim',
    name: 'Soft texture preference',
    type: 'Dietary Restriction',
    status: 'Under Review',
    dateRecorded: '2026-09-07',
    lastReviewed: '2026-09-07',
    mealPlan: 'Gentle Fuel Plan',
    notes: 'Soft textures preferred for comfort.',
    mealPlanImpact: 'Avoid overly crunchy or hard meals when possible.',
    source: 'Nutrition Consultant',
    protected: false,
  },
  {
    id: 'dr-5',
    clientId: 'BF-C1201',
    clientName: 'Kasuni Abeysekara',
    name: 'Peanut Allergy',
    type: 'Medical Allergy',
    status: 'Active',
    dateRecorded: '2026-09-01',
    lastReviewed: '2026-09-06',
    mealPlan: 'Not assigned',
    notes: 'Medically recorded peanut allergy. Use for meal planning only.',
    mealPlanImpact: 'Avoid peanut-containing meals and cross-contact notes.',
    source: 'Medical Record',
    protected: true,
  },
]

function delay(ms = 400) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function fetchDietaryRestrictions() {
  if (USE_MOCK) { await delay(); return dietaryStore.map((d) => ({ ...d })) }
  return apiRequest('/api/nutrition/dietary-restrictions')
}

export async function fetchDietaryRestrictionsByClient(clientId) {
  if (USE_MOCK) { await delay(); return dietaryStore.filter((d) => d.clientId === clientId).map((d) => ({ ...d })) }
  return apiRequest(`/api/nutrition/dietary-restrictions/client/${clientId}`)
}

export async function createDietaryRestriction(payload) {
  if (USE_MOCK) {
    await delay(450)
    const created = { id: `dr-${Date.now()}`, ...payload }
    dietaryStore = [created, ...dietaryStore]
    return created
  }
  return apiRequest('/api/nutrition/dietary-restrictions', { method: 'POST', body: JSON.stringify(payload) })
}

export async function updateDietaryRestriction(id, payload) {
  if (USE_MOCK) {
    await delay(450)
    dietaryStore = dietaryStore.map((d) => (d.id === id ? { ...d, ...payload } : d))
    return dietaryStore.find((d) => d.id === id)
  }
  return apiRequest(`/api/nutrition/dietary-restrictions/${id}`, { method: 'PUT', body: JSON.stringify(payload) })
}

export async function deactivateDietaryRestriction(id) {
  if (USE_MOCK) { await delay(400); return updateDietaryRestriction(id, { status: 'Inactive' }) }
  return apiRequest(`/api/nutrition/dietary-restrictions/${id}/deactivate`, { method: 'PATCH' })
}
