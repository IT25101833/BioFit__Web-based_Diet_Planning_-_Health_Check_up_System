import { apiRequest, USE_MOCK } from '../../../../api/client'
export const programmeTypes = [
  'General Wellness',
  'Fitness',
  'Nutrition',
  'Weight Management',
  'Health Monitoring',
  'Integrated Wellness',
]

export const staffOptions = {
  coaches: [
    { value: 'maya', label: 'Maya Fernando' },
    { value: 'kasun', label: 'Daniel Perera' },
    { value: 'tharindu', label: 'Tharindu Perera' },
  ],
  nutrition: [
    { value: 'ruwan', label: 'Maya Fernando' },
    { value: 'amaya', label: 'Nova Dias' },
  ],
  medical: [
    { value: 'none', label: 'Not required' },
    { value: 'nimali', label: 'Elena Costa' },
  ],
}

export const managerProgrammes = [
  {
    id: 'prog-complete',
    name: 'Complete Wellness Programme',
    type: 'Integrated Wellness',
    description:
      'A comprehensive pathway combining movement, nutrition guidance, and scheduled wellness reviews.',
    status: 'Active',
    startDate: '2026-07-01',
    endDate: '2026-12-31',
    durationWeeks: 26,
    capacity: 30,
    enrolled: 24,
    coachId: 'maya',
    coachName: 'Maya Fernando',
    nutritionId: 'ruwan',
    nutritionName: 'Maya Fernando',
    medicalId: 'nimali',
    medicalName: 'Elena Costa',
    goals: 'Support sustainable lifestyle habits across fitness, nutrition, and recovery.',
    includedServices: 'Fitness consultations, meal-plan reviews, monthly wellness check-ins',
    notes: 'Priority programme for Q3–Q4 capacity planning.',
    progress: 62,
    lastUpdated: '2026-09-06',
  },
  {
    id: 'prog-weight',
    name: 'Weight Management Programme',
    type: 'Weight Management',
    description:
      'A balanced 12-week plan focused on gentle movement, nourishing meals, and regular check-ins.',
    status: 'Active',
    startDate: '2026-07-01',
    endDate: '2026-09-30',
    durationWeeks: 12,
    capacity: 25,
    enrolled: 18,
    coachId: 'kasun',
    coachName: 'Daniel Perera',
    nutritionId: 'amaya',
    nutritionName: 'Nova Dias',
    medicalId: '',
    medicalName: '',
    goals: 'Build sustainable habits without restrictive messaging.',
    includedServices: 'Coach sessions, nutrition consultations, progress reviews',
    notes: '',
    progress: 78,
    lastUpdated: '2026-09-04',
  },
  {
    id: 'prog-energy',
    name: 'Energy & Recovery Reset',
    type: 'Fitness',
    description: 'Shorter recovery-focused pathway for sleep quality, mobility, and steady energy.',
    status: 'Active',
    startDate: '2026-08-15',
    endDate: '2026-10-15',
    durationWeeks: 8,
    capacity: 20,
    enrolled: 12,
    coachId: 'maya',
    coachName: 'Maya Fernando',
    nutritionId: 'ruwan',
    nutritionName: 'Maya Fernando',
    medicalId: '',
    medicalName: '',
    goals: 'Improve recovery routines and daily energy.',
    includedServices: 'Mobility sessions, nutrition check-ins',
    notes: '',
    progress: 42,
    lastUpdated: '2026-09-02',
  },
  {
    id: 'prog-starter',
    name: 'Wellness Starter Pathway',
    type: 'General Wellness',
    description: 'Introductory pathway covering movement basics and meal rhythm.',
    status: 'Completed',
    startDate: '2026-01-10',
    endDate: '2026-04-10',
    durationWeeks: 12,
    capacity: 30,
    enrolled: 28,
    coachId: 'tharindu',
    coachName: 'Tharindu Perera',
    nutritionId: 'amaya',
    nutritionName: 'Nova Dias',
    medicalId: '',
    medicalName: '',
    goals: 'Introduce wellness foundations.',
    includedServices: 'Orientation, starter fitness and nutrition sessions',
    notes: '',
    progress: 100,
    lastUpdated: '2026-04-12',
  },
  {
    id: 'prog-monitor',
    name: 'Health Monitoring Pathway',
    type: 'Health Monitoring',
    description: 'Operational pathway coordinating scheduled check-ups and wellness reviews.',
    status: 'Upcoming',
    startDate: '2026-10-01',
    endDate: '2026-12-31',
    durationWeeks: 13,
    capacity: 15,
    enrolled: 4,
    coachId: 'kasun',
    coachName: 'Daniel Perera',
    nutritionId: 'ruwan',
    nutritionName: 'Maya Fernando',
    medicalId: 'nimali',
    medicalName: 'Elena Costa',
    goals: 'Coordinate routine wellness monitoring appointments.',
    includedServices: 'Health check-ups, medical reviews',
    notes: 'Draft staffing confirmed.',
    progress: 8,
    lastUpdated: '2026-09-01',
  },
  {
    id: 'prog-draft',
    name: 'Mindful Movement Draft',
    type: 'Fitness',
    description: 'Draft programme concept for low-intensity group movement.',
    status: 'Draft',
    startDate: '2026-11-01',
    endDate: '2027-01-31',
    durationWeeks: 13,
    capacity: 16,
    enrolled: 0,
    coachId: 'maya',
    coachName: 'Maya Fernando',
    nutritionId: '',
    nutritionName: '',
    medicalId: '',
    medicalName: '',
    goals: 'Support gentle group movement.',
    includedServices: 'Group mobility sessions',
    notes: 'Awaiting capacity confirmation.',
    progress: 0,
    lastUpdated: '2026-08-28',
  },
]

export const programmeEnrolments = {
  'prog-complete': [
    {
      id: 'en-1',
      clientId: 'BF-C1024',
      clientName: 'Alex Perera',
      enrolledDate: '2026-07-03',
      status: 'Active',
      coachName: 'Maya Fernando',
      nutritionName: 'Maya Fernando',
      progress: 72,
    },
    {
      id: 'en-2',
      clientId: 'BF-C1088',
      clientName: 'Sahan De Silva',
      enrolledDate: '2026-07-08',
      status: 'Active',
      coachName: 'Maya Fernando',
      nutritionName: 'Maya Fernando',
      progress: 64,
    },
    {
      id: 'en-3',
      clientId: 'BF-C1102',
      clientName: 'Taylor Kim',
      enrolledDate: '2026-07-15',
      status: 'Active',
      coachName: 'Maya Fernando',
      nutritionName: 'Maya Fernando',
      progress: 58,
    },
  ],
  'prog-weight': [
    {
      id: 'en-4',
      clientId: 'BF-C1110',
      clientName: 'Dilani Fernando',
      enrolledDate: '2026-07-02',
      status: 'Active',
      coachName: 'Daniel Perera',
      nutritionName: 'Nova Dias',
      progress: 80,
    },
  ],
}

export const eligibleClients = [
  { id: 'BF-C1201', name: 'Kasuni Abeysekara', status: 'Eligible' },
  { id: 'BF-C1208', name: 'Nuwan Rathnayake', status: 'Eligible' },
  { id: 'BF-C1215', name: 'Meera Jayasinghe', status: 'On waitlist' },
]

let programmesStore = managerProgrammes.map((item) => ({ ...item }))

function delay(ms = 420) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function formatManagerDate(iso) {
  if (!iso) return '—'
  return new Date(`${iso}T00:00:00`).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function weeksBetween(start, end) {
  if (!start || !end) return ''
  const ms = new Date(`${end}T00:00:00`) - new Date(`${start}T00:00:00`)
  if (Number.isNaN(ms) || ms < 0) return ''
  return Math.max(1, Math.round(ms / (7 * 24 * 60 * 60 * 1000)))
}

/** GET /api/manager/programmes */
export async function fetchManagerProgrammes() {
  if (USE_MOCK) {
    await delay()
    return programmesStore.map((item) => ({ ...item }))
  }
  return apiRequest('/api/manager/programmes')
}

/** GET /api/manager/programmes/:id */
export async function fetchManagerProgrammeById(id) {
  if (USE_MOCK) {
    await delay()
    const found = programmesStore.find((item) => item.id === id)
    if (!found) throw new Error('Not found')
    return {
      ...found,
      enrolments: (programmeEnrolments[id] || []).map((item) => ({ ...item })),
    }
  }
  return apiRequest(`/api/manager/programmes/${id}`)
}

/** POST /api/manager/programmes */
export async function createManagerProgramme(payload) {
  if (USE_MOCK) {
    await delay(550)
    const created = {
      id: `prog-${Date.now()}`,
      enrolled: 0,
      progress: 0,
      lastUpdated: new Date().toISOString().slice(0, 10),
      ...payload,
    }
    programmesStore = [created, ...programmesStore]
    return { ...created }
  }
  return apiRequest('/api/manager/programmes', { method: 'POST', body: JSON.stringify(payload) })
}

/** PUT /api/manager/programmes/:id */
export async function updateManagerProgramme(id, payload) {
  if (USE_MOCK) {
    await delay(550)
    programmesStore = programmesStore.map((item) =>
      item.id === id
        ? { ...item, ...payload, lastUpdated: new Date().toISOString().slice(0, 10) }
        : item,
    )
    return programmesStore.find((item) => item.id === id)
  }
  return apiRequest(`/api/manager/programmes/${id}`, { method: 'PUT', body: JSON.stringify(payload) })
}

/** PATCH /api/manager/programmes/:id/deactivate */
export async function deactivateManagerProgramme(id) {
  if (USE_MOCK) {
    await delay(450)
    return updateManagerProgramme(id, { status: 'Inactive' })
  }
  return apiRequest(`/api/manager/programmes/${id}/deactivate`, { method: 'PATCH' })
}

/** GET eligible clients for enrolment */
export async function fetchEligibleClients() {
  await delay(300)
  return eligibleClients.map((item) => ({ ...item }))
}

/** POST enrolment */
export async function addProgrammeEnrolment(programmeId, client) {
  await delay(450)
  const entry = {
    id: `en-${Date.now()}`,
    clientId: client.id,
    clientName: client.name,
    enrolledDate: new Date().toISOString().slice(0, 10),
    status: 'Active',
    coachName: programmesStore.find((p) => p.id === programmeId)?.coachName || '—',
    nutritionName: programmesStore.find((p) => p.id === programmeId)?.nutritionName || '—',
    progress: 0,
  }
  programmeEnrolments[programmeId] = [entry, ...(programmeEnrolments[programmeId] || [])]
  programmesStore = programmesStore.map((item) =>
    item.id === programmeId ? { ...item, enrolled: (item.enrolled || 0) + 1 } : item,
  )
  return entry
}

/** DELETE enrolment (soft remove) */
export async function removeProgrammeEnrolment(programmeId, enrolmentId) {
  await delay(400)
  programmeEnrolments[programmeId] = (programmeEnrolments[programmeId] || []).filter(
    (item) => item.id !== enrolmentId,
  )
  programmesStore = programmesStore.map((item) =>
    item.id === programmeId
      ? { ...item, enrolled: Math.max(0, (item.enrolled || 0) - 1) }
      : item,
  )
  return { success: true }
}
