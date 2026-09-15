import { apiRequest, USE_MOCK } from '../../../../api/client'
export const mealPlan = {
  id: 'mp-2026-09',
  name: 'Nourishing Daily Rhythm',
  consultant: 'Maya Fernando',
  programme: 'Weight Management Programme',
  considerations: [
    'Prefers warm breakfasts',
    'Mild lactose sensitivity — dairy alternatives offered',
    'Hydration reminder: steady water intake through the day',
  ],
  days: [
    {
      id: 'today',
      label: 'Today',
      meals: [
        {
          type: 'Breakfast',
          name: 'Oat bowl with seasonal fruit',
          description: 'Warm oats, banana, cinnamon, and a spoon of seeds.',
        },
        {
          type: 'Lunch',
          name: 'Herb grilled fish with greens',
          description: 'Lightly seasoned fish, mixed greens, and steamed vegetables.',
        },
        {
          type: 'Dinner',
          name: 'Vegetable lentil stew',
          description: 'Slow-cooked lentils with root vegetables and fresh herbs.',
        },
        {
          type: 'Snacks',
          name: 'Yoghurt alternative & berries',
          description: 'A simple mid-afternoon option to keep energy steady.',
        },
      ],
    },
    {
      id: 'tomorrow',
      label: 'Tomorrow',
      meals: [
        {
          type: 'Breakfast',
          name: 'Vegetable omelette wrap',
          description: 'Eggs with spinach and tomato in a soft wrap.',
        },
        {
          type: 'Lunch',
          name: 'Quinoa salad bowl',
          description: 'Quinoa, roasted vegetables, and lemon dressing.',
        },
        {
          type: 'Dinner',
          name: 'Chicken and vegetable tray bake',
          description: 'Oven-roasted chicken with colourful vegetables.',
        },
        {
          type: 'Snacks',
          name: 'Handful of nuts & herbal tea',
          description: 'A calm evening wind-down option.',
        },
      ],
    },
  ],
}

export const nutritionProgress = {
  participation: 84,
  weeklyConsistency: [
    { label: 'Mon', value: 100 },
    { label: 'Tue', value: 100 },
    { label: 'Wed', value: 75 },
    { label: 'Thu', value: 100 },
    { label: 'Fri', value: 50 },
    { label: 'Sat', value: 75 },
    { label: 'Sun', value: 100 },
  ],
  planStatus: 'On track',
  reviews: [
    {
      id: 'nr-1',
      date: '2026-09-02',
      title: 'Consultant check-in',
      note: 'Meal rhythm looks sustainable. Keep hydration reminders in place.',
    },
    {
      id: 'nr-2',
      date: '2026-08-19',
      title: 'Plan adjustment',
      note: 'Added warmer breakfast options based on your preference.',
    },
  ],
  trends: [
    { label: 'Meal-plan participation', value: 84 },
    { label: 'Hydration habit', value: 72 },
    { label: 'Evening meal timing', value: 68 },
  ],
}

function delay(ms = 420) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/** GET /api/client/meal-plan */
export async function fetchClientMealPlan() {
  if (USE_MOCK) {
    await delay()
    return structuredClone(mealPlan)
  }
  return apiRequest('/api/client/meal-plan')
}

/** GET /api/client/nutrition-progress */
export async function fetchClientNutritionProgress() {
  if (USE_MOCK) {
    await delay()
    return structuredClone(nutritionProgress)
  }
  return apiRequest('/api/client/nutrition-progress')
}
