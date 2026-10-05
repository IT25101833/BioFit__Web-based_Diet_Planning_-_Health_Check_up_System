import { apiRequest } from '../../../../api/client'

/** Empty dashboard shape — no demo user data. Real values replace nulls when APIs provide them. */
const emptyDashboard = {
  greetingName: null,
  summary: [
    {
      title: 'Current Programme',
      value: null,
      support: null,
      badge: null,
      badgeTone: null,
    },
    {
      title: 'Next Appointment',
      value: null,
      support: null,
      badge: null,
      badgeTone: null,
    },
    {
      title: "Today's Focus",
      value: null,
      support: null,
      badge: null,
      badgeTone: null,
    },
    {
      title: 'Overall Progress',
      value: null,
      support: null,
      badge: null,
      badgeTone: null,
    },
  ],
  programmeName: null,
  programmeWeek: null,
  programmeProgress: null,
  nextAppointmentTitle: null,
  nextAppointmentWhen: null,
  nextAppointmentProfessional: null,
  nextAppointmentStatus: null,
  progress: [],
  health: [
    { label: 'Weight', value: null },
    { label: 'BMI', value: null },
    { label: 'Active alerts', value: null },
    { label: 'Hydration', value: null },
  ],
  upcoming: [],
  notifications: [],
  programme: {
    name: null,
    week: null,
    progressPercent: null,
    remainingWeeks: null,
    status: null,
  },
  appointment: {
    day: null,
    month: null,
    title: null,
    professional: null,
    time: null,
    status: null,
  },
  todayFocus: {
    workoutName: null,
    workoutMeta: null,
    workoutStatus: null,
    mealName: null,
    mealMeta: null,
    mealStatus: null,
  },
  pendingReview: null,
}

function parseAppointmentWhen(when) {
  if (!when) {
    return { day: null, month: null, time: null }
  }
  // Expected: "28 Sep · 9:00 AM – 9:30 AM"
  const [datePart, ...rest] = when.split('·').map((s) => s.trim())
  const time = rest.join(' · ').trim() || null
  const dateBits = (datePart || '').split(/\s+/).filter(Boolean)
  return {
    day: dateBits[0] || null,
    month: dateBits[1] || null,
    time,
  }
}

/** Normalize API / mock payload into a UI-ready dashboard model. */
export function normalizeClientDashboard(raw) {
  const data = { ...emptyDashboard, ...raw }

  const programmeName = data.programmeName ?? null
  const programmeWeek = data.programmeWeek ?? null
  const programmeProgress =
    data.programmeProgress === undefined || data.programmeProgress === null
      ? null
      : data.programmeProgress

  const appointmentWhen = parseAppointmentWhen(data.nextAppointmentWhen)
  const hasAppointment = Boolean(data.nextAppointmentTitle || data.nextAppointmentWhen)
  const appointmentStatus = hasAppointment
    ? data.nextAppointmentStatus ?? data.appointment?.status ?? null
    : null

  const summary =
    Array.isArray(data.summary) && data.summary.length > 0
      ? data.summary
      : emptyDashboard.summary

  return {
    ...data,
    greetingName: data.greetingName ?? null,
    summary,
    programme: {
      name: programmeName,
      week: programmeWeek,
      progressPercent: programmeProgress,
      remainingWeeks: data.programme?.remainingWeeks ?? null,
      status: programmeName ? data.programme?.status ?? 'Active' : null,
    },
    appointment: {
      day: appointmentWhen.day,
      month: appointmentWhen.month,
      title: data.nextAppointmentTitle ?? null,
      professional: data.nextAppointmentProfessional ?? null,
      time: appointmentWhen.time,
      status: appointmentStatus,
    },
    todayFocus: {
      workoutName: data.todayFocus?.workoutName ?? null,
      workoutMeta: data.todayFocus?.workoutMeta ?? null,
      workoutStatus: data.todayFocus?.workoutStatus ?? null,
      mealName: data.todayFocus?.mealName ?? null,
      mealMeta: data.todayFocus?.mealMeta ?? null,
      mealStatus: data.todayFocus?.mealStatus ?? null,
    },
    progress: Array.isArray(data.progress) ? data.progress : [],
    health: Array.isArray(data.health) && data.health.length > 0 ? data.health : emptyDashboard.health,
    upcoming: Array.isArray(data.upcoming) ? data.upcoming : [],
    notifications: Array.isArray(data.notifications) ? data.notifications : [],
    pendingReview: data.pendingReview || null,
  }
}

/** GET /api/client/dashboard */
export async function fetchClientDashboard() {
  const raw = await apiRequest('/api/client/dashboard')
  return normalizeClientDashboard(raw)
}
