import { apiRequest, USE_MOCK } from '../../../../api/client'
import { nutritionClients } from '../../clients/data/nutritionClientData'

function meal(name, description, notes = '', alternatives = '') {
  return { name, description, notes, alternatives, portion: '1 serving' }
}

let mealPlansStore = [
  {
    id: 'mp-1',
    name: 'Balanced Wellness Meal Plan',
    clientId: 'BF-C1024',
    clientName: 'Alex Perera',
    programme: 'Weight Management Programme',
    goal: 'Support steady energy with warm breakfasts and dairy alternatives',
    description: 'A calm weekly rhythm with simple, nourishing meals.',
    startDate: '2026-09-01',
    endDate: '2026-09-30',
    currentWeek: 2,
    status: 'Review Due',
    lastUpdated: '2026-09-08',
    progress: 48,
    version: 3,
    history: [
      { version: 3, label: 'Current', updated: '2026-09-08' },
      { version: 2, label: 'Previous', updated: '2026-09-01' },
      { version: 1, label: 'Original', updated: '2026-08-20' },
    ],
    days: [
      {
        id: 'day-mon',
        day: 'Monday',
        meals: [
          {
            id: 'm1',
            section: 'Breakfast',
            ...meal(
              'Warm oat bowl with fruit',
              'Oats cooked with dairy alternative, banana and cinnamon.',
              'Serve warm',
              'Use certified dairy-free yogurt alternative',
            ),
          },
          {
            id: 'm2',
            section: 'Mid-morning Snack',
            ...meal('Fruit + seed mix', 'Seasonal fruit with a small seed mix.'),
          },
          {
            id: 'm3',
            section: 'Lunch',
            ...meal(
              'Rice bowl with vegetables and fish',
              'Soft rice, steamed vegetables and lightly seasoned fish.',
            ),
          },
          {
            id: 'm4',
            section: 'Afternoon Snack',
            ...meal('Dairy-free yogurt alternative', 'Plain alternative with berries.'),
          },
          {
            id: 'm5',
            section: 'Dinner',
            ...meal(
              'Lentil and vegetable stew',
              'Slow-cooked lentils with root vegetables and herbs.',
            ),
          },
        ],
      },
      {
        id: 'day-tue',
        day: 'Tuesday',
        meals: [
          {
            id: 't1',
            section: 'Breakfast',
            ...meal('Vegetable omelette wrap', 'Eggs with spinach and tomato in a soft wrap.'),
          },
          {
            id: 't2',
            section: 'Lunch',
            ...meal('Quinoa salad bowl', 'Quinoa, roasted vegetables and lemon dressing.'),
          },
          {
            id: 't3',
            section: 'Dinner',
            ...meal(
              'Chicken and vegetable tray bake',
              'Oven-roasted chicken with colourful vegetables.',
            ),
          },
        ],
      },
    ],
  },
  {
    id: 'mp-2',
    name: 'Recovery Nourish Plan',
    clientId: 'BF-C1088',
    clientName: 'Sahan De Silva',
    programme: 'Complete Wellness Programme',
    goal: 'Support recovery with lighter evening meals',
    description: 'Nourishing day structure with calmer dinners.',
    startDate: '2026-08-20',
    endDate: '2026-09-20',
    currentWeek: 3,
    status: 'Active',
    lastUpdated: '2026-09-03',
    progress: 72,
    version: 2,
    history: [
      { version: 2, label: 'Current', updated: '2026-09-03' },
      { version: 1, label: 'Original', updated: '2026-08-20' },
    ],
    days: [
      {
        id: 'day-wed',
        day: 'Wednesday',
        meals: [
          {
            id: 'w1',
            section: 'Breakfast',
            ...meal('Overnight oats', 'Oats with fruit and a spoon of seeds.'),
          },
          {
            id: 'w2',
            section: 'Lunch',
            ...meal('Herb grilled fish with greens', 'Light fish with mixed greens.'),
          },
          {
            id: 'w3',
            section: 'Dinner',
            ...meal('Vegetable soup with toast', 'Warm soup and wholegrain toast.'),
          },
        ],
      },
    ],
  },
  {
    id: 'mp-3',
    name: 'Gentle Fuel Plan',
    clientId: 'BF-C1102',
    clientName: 'Taylor Kim',
    programme: 'Health Monitoring Pathway',
    goal: 'Simple vegetarian meals with soft textures',
    description: 'Gentle, easy-to-prepare vegetarian options.',
    startDate: '2026-08-25',
    endDate: '2026-10-06',
    currentWeek: 2,
    status: 'Active',
    lastUpdated: '2026-09-07',
    progress: 40,
    version: 1,
    history: [{ version: 1, label: 'Current', updated: '2026-09-07' }],
    days: [
      {
        id: 'day-thu',
        day: 'Thursday',
        meals: [
          {
            id: 'h1',
            section: 'Breakfast',
            ...meal('Soft vegetable porridge', 'Warm porridge with soft vegetables.'),
          },
          {
            id: 'h2',
            section: 'Lunch',
            ...meal('Vegetable dhal with rice', 'Mild dhal and soft rice.'),
          },
          {
            id: 'h3',
            section: 'Dinner',
            ...meal('Steamed vegetables with tofu', 'Soft tofu and steamed vegetables.'),
          },
        ],
      },
    ],
  },
  {
    id: 'mp-4',
    name: 'Everyday Balance Plan',
    clientId: 'BF-C1110',
    clientName: 'Dilani Fernando',
    programme: 'Weight Management Programme',
    goal: 'Build a consistent home-cooked meal rhythm',
    description: 'Practical everyday meals.',
    startDate: '2026-08-18',
    endDate: '2026-10-13',
    currentWeek: 3,
    status: 'Active',
    lastUpdated: '2026-08-22',
    progress: 55,
    version: 1,
    history: [{ version: 1, label: 'Current', updated: '2026-08-22' }],
    days: [
      {
        id: 'day-fri',
        day: 'Friday',
        meals: [
          {
            id: 'f1',
            section: 'Breakfast',
            ...meal('Toast with egg and fruit', 'Simple breakfast plate.'),
          },
          {
            id: 'f2',
            section: 'Lunch',
            ...meal('Rice and curry plate', 'Balanced home-style lunch.'),
          },
          {
            id: 'f3',
            section: 'Dinner',
            ...meal('Vegetable pasta', 'Pasta with tomato and vegetables.'),
          },
        ],
      },
    ],
  },
  {
    id: 'mp-draft',
    name: 'Starter Rhythm Draft',
    clientId: 'BF-C1201',
    clientName: 'Kasuni Abeysekara',
    programme: 'General Wellness',
    goal: 'Introduce a calm weekly meal rhythm',
    description: 'Draft awaiting assignment.',
    startDate: '2026-09-15',
    endDate: '2026-10-15',
    currentWeek: 0,
    status: 'Draft',
    lastUpdated: '2026-09-05',
    progress: 0,
    version: 1,
    history: [{ version: 1, label: 'Current', updated: '2026-09-05' }],
    days: [],
  },
]

function delay(ms = 420) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function getMealPlanClientOptions() {
  return nutritionClients.map((c) => ({
    value: c.id,
    label: `${c.name} (${c.id})`,
    client: c,
  }))
}

export async function fetchMealPlans() {
  if (USE_MOCK) { await delay(); return mealPlansStore.map((p) => ({ ...p })) }
  return apiRequest('/api/nutrition/meal-plans')
}

export async function fetchMealPlanById(id) {
  if (USE_MOCK) {
    await delay()
    const found = mealPlansStore.find((p) => p.id === id)
    if (!found) throw new Error('Not found')
    return structuredClone(found)
  }
  return apiRequest(`/api/nutrition/meal-plans/${id}`)
}

export async function createMealPlan(payload) {
  if (USE_MOCK) {
    await delay(500)
    const created = { id: `mp-${Date.now()}`, ...payload }
    mealPlansStore = [created, ...mealPlansStore]
    return created
  }
  return apiRequest('/api/nutrition/meal-plans', { method: 'POST', body: JSON.stringify(payload) })
}

export async function updateMealPlan(id, payload) {
  if (USE_MOCK) {
    await delay(500)
    mealPlansStore = mealPlansStore.map((p) => (p.id === id ? { ...p, ...payload } : p))
    return mealPlansStore.find((p) => p.id === id)
  }
  return apiRequest(`/api/nutrition/meal-plans/${id}`, { method: 'PUT', body: JSON.stringify(payload) })
}

export async function archiveMealPlan(id) {
  if (USE_MOCK) { await delay(400); return updateMealPlan(id, { status: 'Archived' }) }
  return apiRequest(`/api/nutrition/meal-plans/${id}/archive`, { method: 'PATCH' })
}

export async function duplicateMealPlan(id) {
  if (USE_MOCK) {
    await delay(450)
    const found = mealPlansStore.find((p) => p.id === id)
    const copy = { ...found, id: `mp-${Date.now()}`, name: `${found.name} (copy)` }
    mealPlansStore = [copy, ...mealPlansStore]
    return copy
  }
  return apiRequest(`/api/nutrition/meal-plans/${id}/duplicate`, { method: 'POST' })
}
