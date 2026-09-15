import { apiRequest, USE_MOCK } from '../../../../api/client'
export const enrolments = [
  {
    id: 'enr-1',
    clientName: 'Alex Perera',
    clientId: 'BF-C1024',
    programmeId: 'prog-weight',
    programme: 'Weight Management Programme',
    enrolledDate: '2026-07-02',
    period: '1 Jul – 30 Sep 2026',
    coach: 'Daniel Perera',
    progress: 78,
    status: 'Active',
  },
  {
    id: 'enr-2',
    clientName: 'Sahan De Silva',
    clientId: 'BF-C1088',
    programmeId: 'prog-complete',
    programme: 'Complete Wellness Programme',
    enrolledDate: '2026-07-08',
    period: '1 Jul – 31 Dec 2026',
    coach: 'Maya Fernando',
    progress: 64,
    status: 'Active',
  },
  {
    id: 'enr-3',
    clientName: 'Taylor Kim',
    clientId: 'BF-C1102',
    programmeId: 'prog-complete',
    programme: 'Complete Wellness Programme',
    enrolledDate: '2026-07-15',
    period: '1 Jul – 31 Dec 2026',
    coach: 'Maya Fernando',
    progress: 58,
    status: 'Active',
  },
  {
    id: 'enr-4',
    clientName: 'Dilani Fernando',
    clientId: 'BF-C1110',
    programmeId: 'prog-weight',
    programme: 'Weight Management Programme',
    enrolledDate: '2026-07-02',
    period: '1 Jul – 30 Sep 2026',
    coach: 'Daniel Perera',
    progress: 80,
    status: 'Active',
  },
  {
    id: 'enr-5',
    clientName: 'Kasuni Abeysekara',
    clientId: 'BF-C1201',
    programmeId: 'prog-monitor',
    programme: 'Health Monitoring Pathway',
    enrolledDate: '2026-09-01',
    period: '1 Oct – 31 Dec 2026',
    coach: 'Daniel Perera',
    progress: 5,
    status: 'Pending',
  },
  {
    id: 'enr-6',
    clientName: 'Meera Jayasinghe',
    clientId: 'BF-C1215',
    programmeId: 'prog-starter',
    programme: 'Wellness Starter Pathway',
    enrolledDate: '2026-01-12',
    period: '10 Jan – 10 Apr 2026',
    coach: 'Tharindu Perera',
    progress: 100,
    status: 'Completed',
  },
  {
    id: 'enr-7',
    clientName: 'Nuwan Rathnayake',
    clientId: 'BF-C1208',
    programmeId: 'prog-energy',
    programme: 'Energy & Recovery Reset',
    enrolledDate: '2026-08-18',
    period: '15 Aug – 15 Oct 2026',
    coach: 'Maya Fernando',
    progress: 20,
    status: 'Withdrawn',
  },
]

function delay(ms = 400) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/** GET /api/manager/enrolments */
export async function fetchManagerEnrolments() {
  if (USE_MOCK) {
    await delay()
    return enrolments.map((item) => ({ ...item }))
  }
  return apiRequest('/api/manager/enrolments')
}
