import { apiRequest } from '../../../../api/client'

/** UI enum labels only — not business records. */
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

export async function fetchExercises() {
  return apiRequest('/api/coach/exercises')
}

export async function fetchExerciseById(id) {
  return apiRequest(`/api/coach/exercises/${id}`)
}

export async function createExercise(payload) {
  return apiRequest('/api/coach/exercises', { method: 'POST', body: JSON.stringify(payload) })
}

export async function updateExercise(id, payload) {
  return apiRequest(`/api/coach/exercises/${id}`, { method: 'PUT', body: JSON.stringify(payload) })
}

export async function removeExercise(id) {
  return apiRequest(`/api/coach/exercises/${id}`, { method: 'DELETE' })
}
