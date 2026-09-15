import { apiRequest, USE_MOCK } from '../../../../api/client'
export const nutritionAppointments = [
  {
    id: 'na1',
    clientId: 'BF-C1024',
    client: 'Alex Perera',
    type: 'Nutrition Follow-up',
    date: '2026-09-10',
    time: '10:30 AM',
    duration: '30 min',
    status: 'Upcoming',
    programme: 'Weight Management Programme',
  },
  {
    id: 'na2',
    clientId: 'BF-C1088',
    client: 'Sahan De Silva',
    type: 'Meal Plan Review',
    date: '2026-09-11',
    time: '11:30 AM',
    duration: '40 min',
    status: 'Upcoming',
    programme: 'Complete Wellness Programme',
  },
  {
    id: 'na3',
    clientId: 'BF-C1110',
    client: 'Dilani Fernando',
    type: 'Initial Nutrition Consultation',
    date: '2026-09-10',
    time: '02:00 PM',
    duration: '45 min',
    status: 'Upcoming',
    programme: 'Weight Management Programme',
  },
  {
    id: 'na4',
    clientId: 'BF-C1102',
    client: 'Taylor Kim',
    type: 'Nutrition Follow-up',
    date: '2026-09-05',
    time: '09:15 AM',
    duration: '30 min',
    status: 'Completed',
    programme: 'Health Monitoring Pathway',
  },
  {
    id: 'na5',
    clientId: 'BF-C1201',
    client: 'Kasuni Abeysekara',
    type: 'Initial Nutrition Consultation',
    date: '2026-09-03',
    time: '03:00 PM',
    duration: '45 min',
    status: 'Cancelled',
    programme: 'General Wellness',
  },
]

function delay(ms = 350) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function fetchNutritionAppointments() {
  if (USE_MOCK) { await delay(); return nutritionAppointments.map((a) => ({ ...a })) }
  return apiRequest('/api/nutrition/appointments')
}
