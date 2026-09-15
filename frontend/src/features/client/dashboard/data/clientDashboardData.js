import { apiRequest, USE_MOCK } from '../../../../api/client'

const mockDashboard = {
  greetingName: 'Alex',
  summary: [
    {
      title: 'Current Programme',
      value: 'Weight Management',
      support: 'Week 4 of 12',
      badge: 'Active',
      badgeTone: 'green',
    },
    {
      title: 'Next Appointment',
      value: '25 Sep',
      support: 'Medical Review · 9:00 AM',
      badge: 'Confirmed',
      badgeTone: 'teal',
    },
    {
      title: "Today's Focus",
      value: 'Upper Body',
      support: '6 exercises · ~45 min',
      badge: 'Not Started',
      badgeTone: 'amber',
    },
    {
      title: 'Overall Progress',
      value: '78%',
      support: 'On track this month',
      badge: 'Good',
      badgeTone: 'green',
    },
  ],
  programmeName: 'Weight Management',
  programmeWeek: 'Week 4 of 12',
  programmeProgress: 78,
  nextAppointmentTitle: 'Medical Review',
  nextAppointmentWhen: '25 Sep · 9:00 AM',
  nextAppointmentProfessional: 'Elena Costa',
  progress: [
    { label: 'Programme consistency', value: 78, detail: 'Steady this month' },
    { label: 'Meal participation', value: 84, detail: 'Good weekly rhythm' },
    { label: 'Workout completion', value: 76, detail: '3 of 4 sessions' },
  ],
  health: [
    { label: 'Weight', value: '72.5 kg' },
    { label: 'BMI', value: '25.1' },
    { label: 'Active alerts', value: '1' },
    { label: 'Hydration', value: '2.1 L today' },
  ],
  upcoming: [
    { day: '25', month: 'Sep', title: 'Medical review', time: '09:00 AM' },
    { day: '27', month: 'Sep', title: 'Nutrition follow-up', time: '10:30 AM' },
    { day: '29', month: 'Sep', title: 'Coach check-in', time: '04:00 PM' },
  ],
  notifications: [
    {
      icon: 'health',
      title: 'Health update available',
      detail: 'Your latest wellness summary is ready to review.',
      time: '2h ago',
      tone: 'green',
    },
    {
      icon: 'appointment',
      title: 'Appointment reminder',
      detail: 'Medical review on 25 Sep at 9:00 AM.',
      time: 'Yesterday',
      tone: 'teal',
    },
  ],
}

function delay(ms = 350) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/** GET /api/client/dashboard */
export async function fetchClientDashboard() {
  if (USE_MOCK) {
    await delay()
    return structuredClone(mockDashboard)
  }
  return apiRequest('/api/client/dashboard')
}
