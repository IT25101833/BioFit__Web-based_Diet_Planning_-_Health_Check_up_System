import { apiRequest, USE_MOCK } from '../../../../api/client'
export let medicalProfile = {
  id: 'BF-MA01',
  title: 'Dr.',
  firstName: 'Elena',
  lastName: 'Perera',
  email: 'nimali.perera@vitallife.lk',
  contactNumber: '+94 77 512 8830',
  role: 'Medical Advisor',
  specialization: 'Preventive medicine & wellness safety',
  experience: '12 years',
  centre: 'VitalLife Wellness · Colombo',
}

export const medicalDashboard = {
  greetingName: 'Elena',
  stats: {
    clientsUnderReview: { value: 14, hint: '3 new this week' },
    assessmentsPending: { value: 6, hint: '2 due today' },
    activeAlerts: { value: 4, hint: '1 requires follow-up' },
    todaysAppointments: { value: 5, hint: 'Next review at 9:30 AM' },
  },
  todaysAppointments: [
    {
      id: 'ma-apt-1',
      time: '09:30 AM',
      clientId: 'BF-C1024',
      client: 'Alex Perera',
      type: 'Routine Health Check-up',
      programme: 'Weight Management Programme',
      duration: '30 min',
      status: 'Upcoming',
    },
    {
      id: 'ma-apt-2',
      time: '10:45 AM',
      clientId: 'BF-C1102',
      client: 'Taylor Kim',
      type: 'Follow-up Review',
      programme: 'Health Monitoring Pathway',
      duration: '40 min',
      status: 'Upcoming',
    },
    {
      id: 'ma-apt-3',
      time: '12:00 PM',
      clientId: 'BF-C1088',
      client: 'Sahan De Silva',
      type: 'Programme Health Review',
      programme: 'Complete Wellness Programme',
      duration: '35 min',
      status: 'Upcoming',
    },
    {
      id: 'ma-apt-4',
      time: '02:15 PM',
      clientId: 'BF-C1110',
      client: 'Dilani Fernando',
      type: 'Initial Health Assessment',
      programme: 'Weight Management Programme',
      duration: '45 min',
      status: 'Upcoming',
    },
    {
      id: 'ma-apt-5',
      time: '03:30 PM',
      clientId: 'BF-C1201',
      client: 'Kasuni Abeysekara',
      type: 'Follow-up Review',
      programme: 'Complete Wellness Programme',
      duration: '30 min',
      status: 'Upcoming',
    },
  ],
  clientsRequiringReview: [
    {
      id: 'crr-1',
      clientId: 'BF-C1024',
      client: 'Alex Perera',
      reason: 'Assessment pending review',
      detail: 'Routine check-up completed Sep 8',
      actionTo: 'assessment',
      actionId: 'ha-1',
    },
    {
      id: 'crr-2',
      clientId: 'BF-C1102',
      client: 'Taylor Kim',
      reason: 'Active health alert',
      detail: 'Joint comfort guidance — follow-up due',
      actionTo: 'alert',
      actionId: 'HRA-201',
    },
    {
      id: 'crr-3',
      clientId: 'BF-C1201',
      client: 'Kasuni Abeysekara',
      reason: 'Allergy review needed',
      detail: 'Peanut allergy reference updated Sep 6',
      actionTo: 'record',
      actionId: 'hr-6',
    },
    {
      id: 'crr-4',
      clientId: 'BF-C1095',
      client: 'Nimali Silva',
      reason: 'Record update required',
      detail: 'Latest assessment over 6 weeks ago',
      actionTo: 'record',
      actionId: 'hr-2',
    },
  ],
  alertOverview: [
    {
      id: 'HRA-201',
      client: 'Taylor Kim',
      clientId: 'BF-C1102',
      title: 'Joint comfort during activity',
      priority: 'Moderate',
      status: 'Follow-up Required',
      dateRaised: '2026-09-02',
    },
    {
      id: 'HRA-202',
      client: 'Alex Perera',
      clientId: 'BF-C1024',
      title: 'Post-session fatigue note',
      priority: 'Low',
      status: 'Under Review',
      dateRaised: '2026-09-05',
    },
    {
      id: 'HRA-203',
      client: 'Kasuni Abeysekara',
      clientId: 'BF-C1201',
      title: 'Allergy safety reminder',
      priority: 'High',
      status: 'Open',
      dateRaised: '2026-09-06',
    },
    {
      id: 'HRA-204',
      client: 'Sahan De Silva',
      clientId: 'BF-C1088',
      title: 'Recovery pacing guidance',
      priority: 'Moderate',
      status: 'Open',
      dateRaised: '2026-09-07',
    },
  ],
  assessmentTrend: [
    { label: 'Wk 31', completed: 4, pending: 2, followUp: 1 },
    { label: 'Wk 32', completed: 5, pending: 3, followUp: 1 },
    { label: 'Wk 33', completed: 6, pending: 2, followUp: 2 },
    { label: 'Wk 34', completed: 4, pending: 4, followUp: 1 },
    { label: 'Wk 35', completed: 7, pending: 3, followUp: 2 },
    { label: 'Wk 36', completed: 5, pending: 6, followUp: 3 },
  ],
  recentActivity: [
    {
      id: 'ra1',
      text: 'Routine health check-up for Alex Perera marked pending review.',
      at: 'Today · 8:15 AM',
    },
    {
      id: 'ra2',
      text: 'Wellness guidance shared with Coach Maya for Taylor Kim.',
      at: 'Yesterday · 4:40 PM',
    },
    {
      id: 'ra3',
      text: 'Allergy safety reminder raised for Kasuni Abeysekara.',
      at: 'Sep 6 · 10:20 AM',
    },
    {
      id: 'ra4',
      text: 'Programme health review completed for Sahan De Silva.',
      at: 'Sep 5 · 2:05 PM',
    },
    {
      id: 'ra5',
      text: 'Follow-up appointment confirmed with Dilani Fernando.',
      at: 'Sep 4 · 11:30 AM',
    },
  ],
}

function delay(ms = 420) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function fetchMedicalDashboard() {
  if (USE_MOCK) { await delay(); return structuredClone(medicalDashboard) }
  return apiRequest('/api/medical/dashboard')
}

export async function fetchMedicalProfile() {
  if (USE_MOCK) { await delay(); return { ...medicalProfile } }
  return apiRequest('/api/medical/profile')
}

export async function updateMedicalProfile(payload) {
  if (USE_MOCK) { await delay(500); return { ...medicalProfile, ...payload } }
  return apiRequest('/api/medical/profile', { method: 'PATCH', body: JSON.stringify(payload) })
}
