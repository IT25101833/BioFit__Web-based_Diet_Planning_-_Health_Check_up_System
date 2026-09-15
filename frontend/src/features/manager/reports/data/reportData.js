import { apiRequest, USE_MOCK } from '../../../../api/client'
export const reportData = {
  overview: {
    activeClients: 186,
    programmeEnrolments: 214,
    appointmentCompletion: 92,
    programmeCompletion: 74,
  },
  enrolmentTrend: [
    { label: 'Apr', value: 18 },
    { label: 'May', value: 22 },
    { label: 'Jun', value: 27 },
    { label: 'Jul', value: 31 },
    { label: 'Aug', value: 29 },
    { label: 'Sep', value: 34 },
  ],
  programmeDistribution: [
    { label: 'Integrated', value: 28 },
    { label: 'Weight Mgmt', value: 22 },
    { label: 'Fitness', value: 18 },
    { label: 'Nutrition', value: 16 },
    { label: 'Monitoring', value: 10 },
    { label: 'General', value: 6 },
  ],
  appointmentActivity: [
    { label: 'Mon', value: 18 },
    { label: 'Tue', value: 22 },
    { label: 'Wed', value: 19 },
    { label: 'Thu', value: 24 },
    { label: 'Fri', value: 21 },
    { label: 'Sat', value: 12 },
  ],
  capacityUtilization: [
    { label: 'Complete Wellness', value: 80 },
    { label: 'Weight Management', value: 72 },
    { label: 'Energy & Recovery', value: 60 },
    { label: 'Health Monitoring', value: 27 },
  ],
}

function delay(ms = 400) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/** GET /api/manager/reports */
export async function fetchManagerReports() {
  if (USE_MOCK) {
    await delay()
    return structuredClone(reportData)
  }
  return apiRequest('/api/manager/reports')
}
