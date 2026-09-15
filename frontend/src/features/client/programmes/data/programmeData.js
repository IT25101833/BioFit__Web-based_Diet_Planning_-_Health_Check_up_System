import { apiRequest, USE_MOCK } from '../../../../api/client'
export const programmes = [
  {
    id: 'prog-wm-2026',
    title: 'Weight Management Programme',
    status: 'Active',
    type: 'Lifestyle Wellness',
    description:
      'A balanced 12-week plan combining gentle movement, nourishing meals, and regular wellness check-ins to support sustainable habits.',
    coach: 'Maya Fernando',
    nutritionConsultant: 'Maya Fernando',
    startDate: '2026-07-01',
    endDate: '2026-09-30',
    currentWeek: 10,
    totalWeeks: 12,
    progress: 78,
    appointmentsUpcoming: 2,
  },
  {
    id: 'prog-energy-2026',
    title: 'Energy & Recovery Reset',
    status: 'Active',
    type: 'Recovery Focus',
    description:
      'A shorter programme focused on sleep quality, mobility, and steady energy through the day.',
    coach: 'Daniel Perera',
    nutritionConsultant: 'Maya Fernando',
    startDate: '2026-08-15',
    endDate: '2026-10-15',
    currentWeek: 4,
    totalWeeks: 8,
    progress: 42,
    appointmentsUpcoming: 1,
  },
  {
    id: 'prog-starter-2025',
    title: 'Wellness Starter Pathway',
    status: 'Completed',
    type: 'Foundations',
    description:
      'An introductory pathway covering movement basics, meal rhythm, and health awareness.',
    coach: 'Maya Fernando',
    nutritionConsultant: 'Nova Dias',
    startDate: '2026-01-10',
    endDate: '2026-04-10',
    currentWeek: 12,
    totalWeeks: 12,
    progress: 100,
    appointmentsUpcoming: 0,
  },
]

function delay(ms = 420) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function formatProgrammeDate(isoDate) {
  if (!isoDate) return ''
  return new Date(`${isoDate}T00:00:00`).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

/** GET /api/client/programmes */
export async function fetchClientProgrammes() {
  if (USE_MOCK) {
    await delay()
    return programmes.map((item) => ({ ...item }))
  }
  return apiRequest('/api/client/programmes')
}

/** GET /api/client/programmes/:id */
export async function fetchClientProgrammeById(id) {
  if (USE_MOCK) {
    await delay()
    const found = programmes.find((item) => item.id === id)
    if (!found) throw new Error('Programme not found')
    return {
      ...found,
      professionals: [
        { role: 'Fitness Coach', name: found.coach },
        { role: 'Nutrition Consultant', name: found.nutritionConsultant },
      ],
      progressOverview: [
        { label: 'Workout participation', value: Math.min(100, found.progress + 4) },
        { label: 'Meal-plan consistency', value: Math.max(40, found.progress - 8) },
        { label: 'Appointment attendance', value: 90 },
      ],
      upcomingAppointments: [
        {
          id: 'apt-1',
          title: 'Fitness Consultation',
          date: '2026-09-12',
          time: '10:00 AM',
          professional: found.coach,
        },
        {
          id: 'apt-2',
          title: 'Nutrition Consultation',
          date: '2026-09-18',
          time: '2:30 PM',
          professional: found.nutritionConsultant,
        },
      ].slice(0, found.appointmentsUpcoming || 0),
    }
  }
  return apiRequest(`/api/client/programmes/${id}`)
}
