import { apiRequest, USE_MOCK } from '../../../../api/client'
export const nutritionProfile = {
  id: 'BF-NC01',
  firstName: 'Maya',
  lastName: 'Silva',
  title: 'Dr.',
  email: 'ruwan.silva@vitallife.lk',
  contactNumber: '+94 77 330 4411',
  role: 'Nutrition Consultant',
  specialization: 'Clinical nutrition & sustainable meal planning',
  experience: '10 years',
  centre: 'VitalLife Wellness · Colombo',
}

export const nutritionDashboard = {
  greetingName: 'Maya',
  stats: {
    assignedClients: { value: 18, hint: '2 newly assigned' },
    plansRequiringReview: { value: 5, hint: '2 due today' },
    todaysAppointments: { value: 4, hint: 'Next consultation at 10:30 AM' },
    dietaryUpdates: { value: 3, hint: 'New client restrictions' },
  },
  todaysAppointments: [
    {
      id: 'na1',
      time: '10:30 AM',
      clientId: 'BF-C1024',
      client: 'Alex Perera',
      type: 'Nutrition Follow-up',
      programme: 'Weight Management Programme',
      duration: '30 min',
      status: 'Upcoming',
    },
    {
      id: 'na2',
      time: '11:30 AM',
      clientId: 'BF-C1088',
      client: 'Sahan De Silva',
      type: 'Meal Plan Review',
      programme: 'Complete Wellness Programme',
      duration: '40 min',
      status: 'Upcoming',
    },
    {
      id: 'na3',
      time: '02:00 PM',
      clientId: 'BF-C1110',
      client: 'Dilani Fernando',
      type: 'Initial Nutrition Consultation',
      programme: 'Weight Management Programme',
      duration: '45 min',
      status: 'Upcoming',
    },
  ],
  mealPlanAttention: [
    {
      id: 'att1',
      clientId: 'BF-C1024',
      client: 'Alex Perera',
      reason: 'Meal Plan Review Due',
      detail: 'Current plan ends Sep 15',
      planId: 'mp-1',
    },
    {
      id: 'att2',
      clientId: 'BF-C1102',
      client: 'Taylor Kim',
      reason: 'Dietary restriction updated',
      detail: 'Review meal alternatives',
      planId: 'mp-3',
    },
    {
      id: 'att3',
      clientId: 'BF-C1088',
      client: 'Sahan De Silva',
      reason: 'Plan ending soon',
      detail: 'Ends Sep 20',
      planId: 'mp-2',
    },
  ],
  dietaryUpdates: [
    {
      id: 'du1',
      client: 'Alex Perera',
      clientId: 'BF-C1024',
      update: 'Lactose preference updated',
      date: '2026-09-08',
    },
    {
      id: 'du2',
      client: 'Taylor Kim',
      clientId: 'BF-C1102',
      update: 'New food preference recorded',
      date: '2026-09-07',
    },
    {
      id: 'du3',
      client: 'Kasuni Abeysekara',
      clientId: 'BF-C1201',
      update: 'Medical allergy referenced for planning',
      date: '2026-09-06',
    },
  ],
  progressTrend: [
    { label: 'Mon', value: 78 },
    { label: 'Tue', value: 82 },
    { label: 'Wed', value: 74 },
    { label: 'Thu', value: 86 },
    { label: 'Fri', value: 80 },
    { label: 'Sat', value: 70 },
    { label: 'Sun', value: 68 },
  ],
  recentActivity: [
    {
      id: 'ra1',
      text: 'Alex Perera completed today’s meal-plan entries.',
      at: 'Today · 8:40 AM',
    },
    {
      id: 'ra2',
      text: 'Taylor Kim’s dietary restriction was updated.',
      at: 'Yesterday · 4:15 PM',
    },
    {
      id: 'ra3',
      text: 'Sahan De Silva’s meal plan was reviewed.',
      at: 'Yesterday · 11:20 AM',
    },
  ],
}

function delay(ms = 400) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function fetchNutritionDashboard() {
  if (USE_MOCK) { await delay(); return structuredClone(nutritionDashboard) }
  return apiRequest('/api/nutrition/dashboard')
}

export async function fetchNutritionProfile() {
  if (USE_MOCK) { await delay(); return { ...nutritionProfile } }
  return apiRequest('/api/nutrition/profile')
}

export async function updateNutritionProfile(payload) {
  if (USE_MOCK) { await delay(500); return { ...nutritionProfile, ...payload } }
  return apiRequest('/api/nutrition/profile', { method: 'PATCH', body: JSON.stringify(payload) })
}
