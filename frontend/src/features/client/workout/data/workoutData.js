import { apiRequest, USE_MOCK } from '../../../../api/client'
export const workoutPlan = {
  id: 'wp-2026-09',
  name: 'Balanced Movement Week',
  coach: 'Maya Fernando',
  programme: 'Weight Management Programme',
  weekLabel: 'Week 10 · 1–7 September',
  completionPercent: 62,
  days: [
    {
      id: 'mon',
      day: 'Monday',
      focus: 'Mobility & breath',
      completed: true,
      exercises: [
        { name: 'Gentle joint mobility', detail: '10 min', completed: true },
        { name: 'Breathing reset', detail: '5 min', completed: true },
        { name: 'Light walk', detail: '20 min', completed: true },
      ],
    },
    {
      id: 'tue',
      day: 'Tuesday',
      focus: 'Strength foundations',
      completed: true,
      exercises: [
        { name: 'Bodyweight squat', detail: '3 × 10', completed: true },
        { name: 'Wall push-up', detail: '3 × 8', completed: true },
        { name: 'Glute bridge', detail: '3 × 12', completed: true },
      ],
    },
    {
      id: 'wed',
      day: 'Wednesday',
      focus: 'Recovery day',
      completed: true,
      exercises: [
        { name: 'Stretch sequence', detail: '15 min', completed: true },
        { name: 'Optional stroll', detail: '15–20 min', completed: false },
      ],
    },
    {
      id: 'thu',
      day: 'Thursday',
      focus: 'Steady cardio',
      completed: false,
      exercises: [
        { name: 'Brisk walk or cycle', detail: '25 min', completed: false },
        { name: 'Core stability holds', detail: '3 × 20 sec', completed: false },
      ],
    },
    {
      id: 'fri',
      day: 'Friday',
      focus: 'Full-body ease',
      completed: false,
      exercises: [
        { name: 'Resistance band rows', detail: '3 × 12', completed: false },
        { name: 'Step-ups', detail: '3 × 8 / side', completed: false },
        { name: 'Cool-down stretch', detail: '8 min', completed: false },
      ],
    },
    {
      id: 'sat',
      day: 'Saturday',
      focus: 'Outdoor movement',
      completed: false,
      exercises: [
        { name: 'Nature walk', detail: '30–40 min', completed: false },
      ],
    },
    {
      id: 'sun',
      day: 'Sunday',
      focus: 'Rest & reset',
      completed: false,
      exercises: [
        { name: 'Rest or light mobility', detail: 'As needed', completed: false },
      ],
    },
  ],
}

export const fitnessProgress = {
  participation: 78,
  completedSessions: 24,
  plannedSessions: 32,
  programmeProgress: 78,
  monthly: [
    { label: 'May', value: 55 },
    { label: 'Jun', value: 62 },
    { label: 'Jul', value: 70 },
    { label: 'Aug', value: 74 },
    { label: 'Sep', value: 78 },
  ],
  assessments: [
    {
      id: 'fa-1',
      date: '2026-08-28',
      type: 'Movement comfort review',
      summary: 'Steady improvement in mobility and session consistency.',
    },
    {
      id: 'fa-2',
      date: '2026-07-30',
      type: 'Baseline fitness check-in',
      summary: 'Comfortable starting point with room for gradual progression.',
    },
  ],
}

function delay(ms = 420) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/** GET /api/client/workout-plan */
export async function fetchClientWorkoutPlan() {
  if (USE_MOCK) {
    await delay()
    return structuredClone(workoutPlan)
  }
  return apiRequest('/api/client/workout-plan')
}

/** GET /api/client/fitness-progress */
export async function fetchClientFitnessProgress() {
  if (USE_MOCK) {
    await delay()
    return structuredClone(fitnessProgress)
  }
  return apiRequest('/api/client/fitness-progress')
}
