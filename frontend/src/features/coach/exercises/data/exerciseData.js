import { apiRequest, USE_MOCK } from '../../../../api/client'
export const exerciseCategories = [
  'Strength',
  'Cardio',
  'Flexibility',
  'Mobility',
  'Balance',
  'Warm-up',
  'Cool-down',
]

export const difficulties = ['Beginner', 'Intermediate', 'Advanced']

export const targetAreas = [
  'Full Body',
  'Upper Body',
  'Lower Body',
  'Core',
  'Shoulders',
  'Hips',
  'Cardio System',
]

let exercisesStore = [
  {
    id: 'ex-1',
    name: 'Bodyweight Squat',
    category: 'Strength',
    difficulty: 'Beginner',
    targetArea: 'Lower Body',
    equipment: 'No Equipment',
    instructions:
      'Stand with feet shoulder-width apart. Lower with control, then return to standing.',
    startingPosition: 'Feet shoulder-width, chest tall, arms forward for balance.',
    movement: 'Bend hips and knees, lower until thighs are roughly parallel.',
    completion: 'Stand tall without locking knees aggressively.',
    safetyNotes: 'Keep knees tracking over toes; avoid bouncing.',
    sets: 3,
    reps: 12,
    duration: '',
    rest: '60 sec',
  },
  {
    id: 'ex-2',
    name: 'Incline Push-up',
    category: 'Strength',
    difficulty: 'Beginner',
    targetArea: 'Upper Body',
    equipment: 'Bench or sturdy surface',
    instructions: 'Hands on an elevated surface. Lower chest toward the surface, then press up.',
    startingPosition: 'Hands on incline, body in a straight line.',
    movement: 'Lower with control, elbows about 45 degrees from torso.',
    completion: 'Press back to start without sagging hips.',
    safetyNotes: 'Choose a height that keeps form comfortable.',
    sets: 3,
    reps: 10,
    duration: '',
    rest: '60 sec',
  },
  {
    id: 'ex-3',
    name: 'Brisk Walk',
    category: 'Cardio',
    difficulty: 'Beginner',
    targetArea: 'Cardio System',
    equipment: 'None',
    instructions: 'Walk at a pace that feels purposeful but conversational.',
    startingPosition: 'Upright posture, relaxed shoulders.',
    movement: 'Steady rhythmic walking.',
    completion: 'Gradually slow to an easy pace.',
    safetyNotes: 'Choose flat or gentle terrain if joints feel sensitive.',
    sets: 1,
    reps: '',
    duration: '15–20 min',
    rest: '',
  },
  {
    id: 'ex-4',
    name: 'Hip Opener Stretch',
    category: 'Flexibility',
    difficulty: 'Beginner',
    targetArea: 'Hips',
    equipment: 'Mat',
    instructions: 'Move gently into a comfortable stretch and breathe steadily.',
    startingPosition: 'Seated or kneeling with support as needed.',
    movement: 'Ease into stretch without forcing range.',
    completion: 'Release slowly and reset posture.',
    safetyNotes: 'Stop short of sharp discomfort.',
    sets: 2,
    reps: '',
    duration: '45 sec / side',
    rest: '15 sec',
  },
  {
    id: 'ex-5',
    name: 'Single-leg Balance Hold',
    category: 'Balance',
    difficulty: 'Beginner',
    targetArea: 'Full Body',
    equipment: 'None',
    instructions: 'Stand on one leg with a soft knee and steady gaze.',
    startingPosition: 'Near a wall or chair for support if needed.',
    movement: 'Hold balance while breathing calmly.',
    completion: 'Switch sides with control.',
    safetyNotes: 'Use support early; progress gradually.',
    sets: 2,
    reps: '',
    duration: '20–30 sec / side',
    rest: '20 sec',
  },
  {
    id: 'ex-6',
    name: 'Band Row',
    category: 'Strength',
    difficulty: 'Intermediate',
    targetArea: 'Upper Body',
    equipment: 'Resistance band',
    instructions: 'Pull band toward torso, squeeze shoulder blades, return slowly.',
    startingPosition: 'Tall posture, band anchored at mid-chest height.',
    movement: 'Pull elbows back without shrugging.',
    completion: 'Extend arms with control.',
    safetyNotes: 'Keep shoulders down and neck relaxed.',
    sets: 3,
    reps: 12,
    duration: '',
    rest: '60 sec',
  },
]

function delay(ms = 400) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function fetchExercises() {
  if (USE_MOCK) {
    await delay()
    return exercisesStore.map((e) => ({ ...e }))
  }
  return apiRequest('/api/coach/exercises')
}

export async function fetchExerciseById(id) {
  if (USE_MOCK) {
    await delay()
    const found = exercisesStore.find((e) => e.id === id)
    if (!found) throw new Error('Not found')
    return { ...found }
  }
  return apiRequest(`/api/coach/exercises/${id}`)
}

export async function createExercise(payload) {
  if (USE_MOCK) {
    await delay(450)
    const created = { id: `ex-${Date.now()}`, ...payload }
    exercisesStore = [created, ...exercisesStore]
    return created
  }
  return apiRequest('/api/coach/exercises', { method: 'POST', body: JSON.stringify(payload) })
}

export async function updateExercise(id, payload) {
  if (USE_MOCK) {
    await delay(450)
    exercisesStore = exercisesStore.map((e) => (e.id === id ? { ...e, ...payload } : e))
    return exercisesStore.find((e) => e.id === id)
  }
  return apiRequest(`/api/coach/exercises/${id}`, { method: 'PUT', body: JSON.stringify(payload) })
}

export async function removeExercise(id) {
  if (USE_MOCK) {
    await delay(350)
    exercisesStore = exercisesStore.filter((e) => e.id !== id)
    return { success: true }
  }
  return apiRequest(`/api/coach/exercises/${id}`, { method: 'DELETE' })
}
