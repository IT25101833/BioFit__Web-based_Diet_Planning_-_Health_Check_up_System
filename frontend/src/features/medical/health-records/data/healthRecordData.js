import { apiRequest, shouldUseMockData } from '../../../../api/client'
export function formatMedicalDate(iso) {
  if (!iso) return '—'
  const date = new Date(iso.includes('T') ? iso : `${iso}T12:00:00`)
  if (Number.isNaN(date.getTime())) return iso
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export const clientOptions = [
  {
    value: 'BF-C1024',
    label: 'Alex Perera (BF-C1024)',
    programme: 'Weight Management Programme',
  },
  {
    value: 'BF-C1095',
    label: 'Nimali Silva (BF-C1095)',
    programme: 'Health Monitoring Pathway',
  },
  {
    value: 'BF-C1088',
    label: 'Sahan De Silva (BF-C1088)',
    programme: 'Complete Wellness Programme',
  },
  {
    value: 'BF-C1110',
    label: 'Dilani Fernando (BF-C1110)',
    programme: 'Weight Management Programme',
  },
  {
    value: 'BF-C1102',
    label: 'Taylor Kim (BF-C1102)',
    programme: 'Health Monitoring Pathway',
  },
  {
    value: 'BF-C1201',
    label: 'Kasuni Abeysekara (BF-C1201)',
    programme: 'Complete Wellness Programme',
  },
]

let store = [
  {
    id: 'hr-1',
    clientId: 'BF-C1024',
    clientName: 'Alex Perera',
    programme: 'Weight Management Programme',
    recordStatus: 'Up to Date',
    latestAssessment: '2026-09-08',
    activeRiskAlerts: 1,
    nextCheckup: '2026-09-12',
    reviewStatus: 'Review Required',
    assignedCoach: 'Maya Fernando',
    assignedNutrition: 'Maya Fernando',
    lastUpdated: '2026-09-08',
    medicalHistory: {
      conditions: ['Mild seasonal rhinitis'],
      allergies: ['None recorded'],
      healthConsiderations: [
        'Prefer low-impact activity options',
        'Monitor post-session fatigue',
      ],
      previousNotes: [
        'Aug 2026: Steady progress on Weight Management Programme.',
        'Jul 2026: Baseline wellness markers within expected ranges.',
      ],
      emergencyContact: {
        name: 'Priya Perera',
        relation: 'Spouse',
        phone: '+94 77 210 5544',
      },
    },
    wellnessGuidance: {
      fitness:
        'Continue gradual strength work with low-impact alternatives when fatigue is noted.',
      nutrition:
        'Support dairy-aware meal planning; keep hydration reminders during warmer days.',
      status: 'Active',
      lastUpdated: '2026-09-08',
      sharedWith: ['Maya Fernando', 'Maya Fernando'],
      updatedBy: 'Elena Costa',
    },
    history: [
      {
        id: 'h1-1',
        text: 'Routine health check-up recorded and pending review.',
        at: '2026-09-08T16:10:00',
      },
      {
        id: 'h1-2',
        text: 'Post-session fatigue note raised for care-team awareness.',
        at: '2026-09-05T11:20:00',
      },
      {
        id: 'h1-3',
        text: 'Wellness guidance updated for coach and nutrition teams.',
        at: '2026-08-28T14:00:00',
      },
    ],
    assessments: [
      { id: 'ha-1', date: '2026-09-08', type: 'Routine Health Check-up', status: 'Pending Review' },
      { id: 'ha-7', date: '2026-08-12', type: 'Programme Health Review', status: 'Completed' },
    ],
    alerts: [
      { id: 'HRA-202', title: 'Post-session fatigue note', priority: 'Low', status: 'Under Review' },
    ],
    appointments: [
      { id: 'ma-apt-1', date: '2026-09-09', time: '09:30 AM', type: 'Routine Health Check-up', status: 'Upcoming' },
      { id: 'ma-apt-7', date: '2026-09-12', time: '11:00 AM', type: 'Follow-up Review', status: 'Upcoming' },
    ],
  },
  {
    id: 'hr-2',
    clientId: 'BF-C1095',
    clientName: 'Nimali Silva',
    programme: 'Health Monitoring Pathway',
    recordStatus: 'Update Required',
    latestAssessment: '2026-07-22',
    activeRiskAlerts: 0,
    nextCheckup: '2026-09-10',
    reviewStatus: 'Review Required',
    assignedCoach: 'Maya Fernando',
    assignedNutrition: 'Maya Fernando',
    lastUpdated: '2026-08-20',
    medicalHistory: {
      conditions: ['History of mild anaemia (managed)'],
      allergies: ['None recorded'],
      healthConsiderations: [
        'Schedule regular wellness check-ins',
        'Avoid abrupt intensity increases',
      ],
      previousNotes: [
        'Jul 2026: Initial pathway assessment completed.',
        'Aug 2026: Follow-up noted steady energy with regular meals.',
      ],
      emergencyContact: {
        name: 'Rohan Silva',
        relation: 'Brother',
        phone: '+94 71 445 8890',
      },
    },
    wellnessGuidance: {
      fitness: 'Maintain light-to-moderate activity with scheduled rest days.',
      nutrition: 'Emphasise iron-rich meal variety within client preferences.',
      status: 'Needs Update',
      lastUpdated: '2026-08-20',
      sharedWith: ['Maya Fernando'],
      updatedBy: 'Elena Costa',
    },
    history: [
      {
        id: 'h2-1',
        text: 'Record flagged for update — latest assessment older than six weeks.',
        at: '2026-09-08T09:00:00',
      },
      {
        id: 'h2-2',
        text: 'Follow-up review completed; next check-up scheduled.',
        at: '2026-08-20T10:15:00',
      },
    ],
    assessments: [
      { id: 'ha-5', date: '2026-07-22', type: 'Initial Health Assessment', status: 'Completed' },
    ],
    alerts: [],
    appointments: [
      { id: 'ma-apt-6', date: '2026-09-10', time: '09:00 AM', type: 'Routine Health Check-up', status: 'Upcoming' },
      { id: 'ma-apt-12', date: '2026-08-20', time: '09:45 AM', type: 'Follow-up Review', status: 'Completed' },
    ],
  },
  {
    id: 'hr-3',
    clientId: 'BF-C1088',
    clientName: 'Sahan De Silva',
    programme: 'Complete Wellness Programme',
    recordStatus: 'Up to Date',
    latestAssessment: '2026-09-03',
    activeRiskAlerts: 1,
    nextCheckup: '2026-10-03',
    reviewStatus: 'Up to Date',
    assignedCoach: 'Maya Fernando',
    assignedNutrition: 'Maya Fernando',
    lastUpdated: '2026-09-07',
    medicalHistory: {
      conditions: ['None significant'],
      allergies: ['Shellfish (mild)'],
      healthConsiderations: [
        'Recovery-focused pacing during busy weeks',
        'Shellfish avoidance for nutrition planning',
      ],
      previousNotes: [
        'Sep 2026: Programme health review supportive of current load.',
        'Aug 2026: Energy recovery pathway progressing well.',
      ],
      emergencyContact: {
        name: 'Anusha De Silva',
        relation: 'Sister',
        phone: '+94 76 330 2211',
      },
    },
    wellnessGuidance: {
      fitness: 'Keep recovery emphasis; gentle progression only when energy is steady.',
      nutrition: 'Continue Recovery Nourish Plan; avoid shellfish-containing meals.',
      status: 'Active',
      lastUpdated: '2026-09-07',
      sharedWith: ['Maya Fernando', 'Maya Fernando'],
      updatedBy: 'Elena Costa',
    },
    history: [
      {
        id: 'h3-1',
        text: 'Recovery pacing guidance alert opened.',
        at: '2026-09-07T13:40:00',
      },
      {
        id: 'h3-2',
        text: 'Programme health review completed.',
        at: '2026-09-03T14:30:00',
      },
    ],
    assessments: [
      { id: 'ha-3', date: '2026-09-03', type: 'Programme Health Review', status: 'Completed' },
    ],
    alerts: [
      { id: 'HRA-204', title: 'Recovery pacing guidance', priority: 'Moderate', status: 'Open' },
    ],
    appointments: [
      { id: 'ma-apt-3', date: '2026-09-09', time: '12:00 PM', type: 'Programme Health Review', status: 'Upcoming' },
      { id: 'ma-apt-8', date: '2026-09-03', time: '02:00 PM', type: 'Programme Health Review', status: 'Completed' },
    ],
  },
  {
    id: 'hr-4',
    clientId: 'BF-C1110',
    clientName: 'Dilani Fernando',
    programme: 'Weight Management Programme',
    recordStatus: 'Up to Date',
    latestAssessment: '2026-08-22',
    activeRiskAlerts: 0,
    nextCheckup: '2026-09-09',
    reviewStatus: 'Follow-up Required',
    assignedCoach: 'Maya Fernando',
    assignedNutrition: 'Maya Fernando',
    lastUpdated: '2026-09-04',
    medicalHistory: {
      conditions: ['None recorded'],
      allergies: ['None recorded'],
      healthConsiderations: [
        'New to structured wellness programming',
        'Build consistency before intensity',
      ],
      previousNotes: [
        'Aug 2026: Pre-enrolment wellness screening completed.',
      ],
      emergencyContact: {
        name: 'Malith Fernando',
        relation: 'Husband',
        phone: '+94 77 880 1122',
      },
    },
    wellnessGuidance: {
      fitness: 'Beginner-friendly full-body sessions; avoid high-impact intervals initially.',
      nutrition: 'Support Everyday Balance Plan with consistent meal timing.',
      status: 'Active',
      lastUpdated: '2026-09-04',
      sharedWith: ['Maya Fernando', 'Maya Fernando'],
      updatedBy: 'Elena Costa',
    },
    history: [
      {
        id: 'h4-1',
        text: 'Initial health assessment appointment confirmed for Sep 9.',
        at: '2026-09-04T11:30:00',
      },
      {
        id: 'h4-2',
        text: 'Baseline wellness notes recorded.',
        at: '2026-08-22T15:00:00',
      },
    ],
    assessments: [
      { id: 'ha-6', date: '2026-08-22', type: 'Initial Health Assessment', status: 'Follow-up Required' },
    ],
    alerts: [],
    appointments: [
      { id: 'ma-apt-4', date: '2026-09-09', time: '02:15 PM', type: 'Initial Health Assessment', status: 'Upcoming' },
      { id: 'ma-apt-11', date: '2026-08-28', time: '11:30 AM', type: 'Routine Health Check-up', status: 'Cancelled' },
    ],
  },
  {
    id: 'hr-5',
    clientId: 'BF-C1102',
    clientName: 'Taylor Kim',
    programme: 'Health Monitoring Pathway',
    recordStatus: 'Up to Date',
    latestAssessment: '2026-09-02',
    activeRiskAlerts: 1,
    nextCheckup: '2026-09-09',
    reviewStatus: 'Follow-up Required',
    assignedCoach: 'Maya Fernando',
    assignedNutrition: 'Maya Fernando',
    lastUpdated: '2026-09-08',
    medicalHistory: {
      conditions: ['Occasional knee discomfort'],
      allergies: ['None recorded'],
      healthConsiderations: [
        'Joint-friendly movement preferred',
        'Soft texture meal preference for comfort',
        'Medical review before intensity increases',
      ],
      previousNotes: [
        'Sep 2026: Follow-up review — continue joint-aware guidance.',
        'Aug 2026: Pathway enrolment and initial screening.',
      ],
      emergencyContact: {
        name: 'Tharindu Fonseka',
        relation: 'Brother',
        phone: '+94 71 990 3344',
      },
    },
    wellnessGuidance: {
      fitness:
        'Review Recommended — keep sessions low-impact; avoid prolonged high-intensity intervals.',
      nutrition:
        'Guidance Available — gentle vegetarian options with soft textures preferred.',
      status: 'Active',
      lastUpdated: '2026-09-08',
      sharedWith: ['Maya Fernando', 'Maya Fernando'],
      updatedBy: 'Elena Costa',
    },
    history: [
      {
        id: 'h5-1',
        text: 'Wellness guidance shared with coach and nutrition teams.',
        at: '2026-09-08T16:40:00',
      },
      {
        id: 'h5-2',
        text: 'Joint comfort alert follow-up scheduled.',
        at: '2026-09-02T11:00:00',
      },
      {
        id: 'h5-3',
        text: 'Follow-up review completed.',
        at: '2026-09-02T10:35:00',
      },
    ],
    assessments: [
      { id: 'ha-2', date: '2026-09-02', type: 'Follow-up Review', status: 'Follow-up Required' },
      { id: 'ha-8', date: '2026-08-10', type: 'Initial Health Assessment', status: 'Completed' },
    ],
    alerts: [
      {
        id: 'HRA-201',
        title: 'Joint comfort during activity',
        priority: 'Moderate',
        status: 'Follow-up Required',
      },
    ],
    appointments: [
      { id: 'ma-apt-2', date: '2026-09-09', time: '10:45 AM', type: 'Follow-up Review', status: 'Upcoming' },
      { id: 'ma-apt-9', date: '2026-09-02', time: '10:00 AM', type: 'Follow-up Review', status: 'Completed' },
    ],
  },
  {
    id: 'hr-6',
    clientId: 'BF-C1201',
    clientName: 'Kasuni Abeysekara',
    programme: 'Complete Wellness Programme',
    recordStatus: 'Update Required',
    latestAssessment: '2026-09-01',
    activeRiskAlerts: 1,
    nextCheckup: '2026-09-09',
    reviewStatus: 'Review Required',
    assignedCoach: 'Maya Fernando',
    assignedNutrition: 'Maya Fernando',
    lastUpdated: '2026-09-06',
    medicalHistory: {
      conditions: ['None significant'],
      allergies: ['Peanut allergy'],
      healthConsiderations: [
        'Strict peanut avoidance for meal planning',
        'Confirm cross-contact notes with nutrition team',
      ],
      previousNotes: [
        'Sep 2026: Allergy reference confirmed for centre teams.',
        'Sep 2026: Initial health assessment completed on enrolment.',
      ],
      emergencyContact: {
        name: 'Dinithi Abeysekara',
        relation: 'Mother',
        phone: '+94 77 660 7788',
      },
    },
    wellnessGuidance: {
      fitness: 'No Change — standard Complete Wellness activity guidance applies.',
      nutrition:
        'Review Recommended — peanut-free meal planning with clear kitchen notes.',
      status: 'Active',
      lastUpdated: '2026-09-06',
      sharedWith: ['Maya Fernando', 'Maya Fernando'],
      updatedBy: 'Elena Costa',
    },
    history: [
      {
        id: 'h6-1',
        text: 'Allergy safety reminder raised and shared with nutrition.',
        at: '2026-09-06T10:20:00',
      },
      {
        id: 'h6-2',
        text: 'Initial health assessment completed.',
        at: '2026-09-01T15:40:00',
      },
    ],
    assessments: [
      { id: 'ha-4', date: '2026-09-01', type: 'Initial Health Assessment', status: 'Reviewed' },
    ],
    alerts: [
      { id: 'HRA-203', title: 'Allergy safety reminder', priority: 'High', status: 'Open' },
    ],
    appointments: [
      { id: 'ma-apt-5', date: '2026-09-09', time: '03:30 PM', type: 'Follow-up Review', status: 'Upcoming' },
      { id: 'ma-apt-10', date: '2026-09-01', time: '03:00 PM', type: 'Initial Health Assessment', status: 'Completed' },
    ],
  },
]

function delay(ms = 420) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function toListItem(record) {
  return {
    id: record.id,
    clientId: record.clientId,
    clientName: record.clientName,
    programme: record.programme,
    recordStatus: record.recordStatus,
    latestAssessment: record.latestAssessment,
    activeRiskAlerts: record.activeRiskAlerts,
    nextCheckup: record.nextCheckup,
    reviewStatus: record.reviewStatus,
    assignedCoach: record.assignedCoach,
    assignedNutrition: record.assignedNutrition,
    lastUpdated: record.lastUpdated,
  }
}

export async function fetchHealthRecords() {
  if (shouldUseMockData()) { await delay(); return store.map((r) => toListItem(r)) }
  return apiRequest('/api/medical/health-records')
}

export async function fetchHealthRecordById(id) {
  if (shouldUseMockData()) {
    await delay()
    const found = store.find((r) => r.id === id)
    if (!found) throw new Error('Not found')
    return structuredClone(found)
  }
  const numeric = String(id).startsWith('hr-') ? String(id).slice(3) : id
  return apiRequest(`/api/medical/health-records/${numeric}`)
}

export async function createHealthRecord(payload) {
  if (shouldUseMockData()) {
    await delay(450)
    const created = { id: `hr-${Date.now()}`, ...payload }
    store = [created, ...store]
    return structuredClone(created)
  }
  return apiRequest('/api/medical/health-records', { method: 'POST', body: JSON.stringify(payload) })
}

export async function updateHealthRecord(id, payload) {
  if (shouldUseMockData()) {
    await delay(450)
    store = store.map((r) => (r.id === id ? { ...r, ...payload } : r))
    return structuredClone(store.find((r) => r.id === id))
  }
  const numeric = String(id).startsWith('hr-') ? String(id).slice(3) : id
  return apiRequest(`/api/medical/health-records/${numeric}`, { method: 'PUT', body: JSON.stringify(payload) })
}
