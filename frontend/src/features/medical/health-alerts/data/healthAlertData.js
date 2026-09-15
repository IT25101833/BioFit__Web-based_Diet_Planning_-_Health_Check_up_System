import { apiRequest, USE_MOCK } from '../../../../api/client'
let store = [
  {
    id: 'HRA-201',
    clientId: 'BF-C1102',
    clientName: 'Taylor Kim',
    title: 'Joint comfort during activity',
    dateRaised: '2026-09-02',
    priority: 'Moderate',
    status: 'Follow-up Required',
    followUp: {
      required: true,
      dueDate: '2026-09-09',
      notes: 'Reassess knee comfort after recent low-impact sessions.',
      status: 'Due',
      relatedAppointmentId: 'ma-apt-2',
    },
    assignedAdvisor: 'Elena Costa',
    relatedAssessmentId: 'ha-2',
    reason:
      'Client reported occasional knee discomfort during longer walking intervals on the Health Monitoring Pathway.',
    reviewNotes:
      'Under active follow-up. Coach advised to keep sessions joint-friendly until today’s review.',
    wellnessImpact: {
      fitness: 'Review Recommended',
      nutrition: 'Guidance Available',
    },
    guidance: {
      fitness:
        'Prefer low-impact movement; avoid prolonged high-intensity intervals and hard landings.',
      nutrition:
        'Continue Gentle Fuel Plan with soft textures; no change required for allergy status.',
      status: 'Shared',
      lastUpdated: '2026-09-08',
      sharedWith: ['Maya Fernando', 'Maya Fernando'],
    },
    activity: [
      {
        id: 'act-201-1',
        text: 'Follow-up marked due for today’s appointment.',
        at: '2026-09-09T07:05:00',
      },
      {
        id: 'act-201-2',
        text: 'Wellness guidance shared with coach and nutrition.',
        at: '2026-09-08T16:40:00',
      },
      {
        id: 'act-201-3',
        text: 'Alert raised after follow-up review.',
        at: '2026-09-02T11:05:00',
      },
    ],
    resolvedDate: null,
    resolvedBy: null,
    resolutionNotes: null,
  },
  {
    id: 'HRA-202',
    clientId: 'BF-C1024',
    clientName: 'Alex Perera',
    title: 'Post-session fatigue note',
    dateRaised: '2026-09-05',
    priority: 'Low',
    status: 'Under Review',
    followUp: {
      required: true,
      dueDate: '2026-09-12',
      notes: 'Check fatigue pattern at follow-up review.',
      status: 'Scheduled',
      relatedAppointmentId: 'ma-apt-7',
    },
    assignedAdvisor: 'Elena Costa',
    relatedAssessmentId: 'ha-1',
    reason:
      'Mild post-session fatigue noted after denser training days on Weight Management Programme.',
    reviewNotes: 'Review in progress alongside pending routine check-up sign-off.',
    wellnessImpact: {
      fitness: 'Review Recommended',
      nutrition: 'No Change',
    },
    guidance: {
      fitness: 'Offer low-impact alternatives when fatigue is elevated; keep progression gradual.',
      nutrition: 'Maintain current dairy-aware meal plan and hydration reminders.',
      status: 'Draft',
      lastUpdated: '2026-09-05',
      sharedWith: [],
    },
    activity: [
      {
        id: 'act-202-1',
        text: 'Linked to routine health check-up pending review.',
        at: '2026-09-08T16:15:00',
      },
      {
        id: 'act-202-2',
        text: 'Alert opened for care-team awareness.',
        at: '2026-09-05T11:25:00',
      },
    ],
    resolvedDate: null,
    resolvedBy: null,
    resolutionNotes: null,
  },
  {
    id: 'HRA-203',
    clientId: 'BF-C1201',
    clientName: 'Kasuni Abeysekara',
    title: 'Allergy safety reminder',
    dateRaised: '2026-09-06',
    priority: 'High',
    status: 'Open',
    followUp: {
      required: true,
      dueDate: '2026-09-09',
      notes: 'Confirm peanut-free kitchen and meal-plan notes with nutrition.',
      status: 'Pending',
      relatedAppointmentId: 'ma-apt-5',
    },
    assignedAdvisor: 'Elena Costa',
    relatedAssessmentId: 'ha-4',
    reason:
      'Documented peanut allergy requires clear avoidance and cross-contact notes across centre teams.',
    reviewNotes: '',
    wellnessImpact: {
      fitness: 'No Change',
      nutrition: 'Review Recommended',
    },
    guidance: {
      fitness: 'Standard Complete Wellness activity guidance applies.',
      nutrition:
        'Use peanut-free meal planning only; document kitchen cross-contact precautions.',
      status: 'Shared',
      lastUpdated: '2026-09-06',
      sharedWith: ['Maya Fernando', 'Maya Fernando'],
    },
    activity: [
      {
        id: 'act-203-1',
        text: 'Guidance shared with nutrition and coaching teams.',
        at: '2026-09-06T10:35:00',
      },
      {
        id: 'act-203-2',
        text: 'High-priority allergy safety reminder raised.',
        at: '2026-09-06T10:20:00',
      },
    ],
    resolvedDate: null,
    resolvedBy: null,
    resolutionNotes: null,
  },
  {
    id: 'HRA-204',
    clientId: 'BF-C1088',
    clientName: 'Sahan De Silva',
    title: 'Recovery pacing guidance',
    dateRaised: '2026-09-07',
    priority: 'Moderate',
    status: 'Open',
    followUp: {
      required: false,
      dueDate: null,
      notes: '',
      status: 'Not Required',
      relatedAppointmentId: null,
    },
    assignedAdvisor: 'Elena Costa',
    relatedAssessmentId: 'ha-3',
    reason:
      'Busy-week recovery pacing needs light monitoring within Complete Wellness Programme.',
    reviewNotes: '',
    wellnessImpact: {
      fitness: 'Review Recommended',
      nutrition: 'No Change',
    },
    guidance: {
      fitness: 'Keep recovery emphasis; defer intensity increases when energy dips.',
      nutrition: 'Continue Recovery Nourish Plan; shellfish avoidance unchanged.',
      status: 'Shared',
      lastUpdated: '2026-09-07',
      sharedWith: ['Maya Fernando'],
    },
    activity: [
      {
        id: 'act-204-1',
        text: 'Pacing guidance shared with Coach Maya.',
        at: '2026-09-07T14:00:00',
      },
      {
        id: 'act-204-2',
        text: 'Alert opened after programme health review.',
        at: '2026-09-07T13:40:00',
      },
    ],
    resolvedDate: null,
    resolvedBy: null,
    resolutionNotes: null,
  },
  {
    id: 'HRA-205',
    clientId: 'BF-C1024',
    clientName: 'Alex Perera',
    title: 'Hydration reminder',
    dateRaised: '2026-08-18',
    priority: 'Low',
    status: 'Resolved',
    followUp: {
      required: false,
      dueDate: '2026-08-28',
      notes: 'Hydration habits improved at follow-up.',
      status: 'Completed',
      relatedAppointmentId: null,
    },
    assignedAdvisor: 'Elena Costa',
    relatedAssessmentId: 'ha-7',
    reason: 'Seasonal hydration reminder during warmer training weeks.',
    reviewNotes: 'Client reported steadier water intake; closed after programme review.',
    wellnessImpact: {
      fitness: 'No Change',
      nutrition: 'Guidance Available',
    },
    guidance: {
      fitness: 'No Change — continue current plan.',
      nutrition: 'Keep simple hydration reminders with meals and sessions.',
      status: 'Archived',
      lastUpdated: '2026-08-28',
      sharedWith: ['Maya Fernando'],
    },
    activity: [
      {
        id: 'act-205-1',
        text: 'Alert resolved after improved hydration habits.',
        at: '2026-08-28T15:10:00',
      },
      {
        id: 'act-205-2',
        text: 'Hydration reminder raised.',
        at: '2026-08-18T09:30:00',
      },
    ],
    resolvedDate: '2026-08-28',
    resolvedBy: 'Elena Costa',
    resolutionNotes: 'Habits improved; no ongoing medical action required.',
  },
]

let alertSeq = 206

function delay(ms = 420) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function pushActivity(alert, text) {
  const entry = {
    id: `act-${alert.id}-${Date.now()}`,
    text,
    at: new Date().toISOString(),
  }
  return [entry, ...(alert.activity || [])]
}

export function findSimilarActiveAlert(clientId, title) {
  const normalised = String(title || '')
    .trim()
    .toLowerCase()
  if (!clientId || !normalised) return null
  return (
    store.find(
      (item) =>
        item.clientId === clientId &&
        item.status !== 'Resolved' &&
        String(item.title).trim().toLowerCase() === normalised,
    ) || null
  )
}

export async function fetchHealthAlerts() {
  if (USE_MOCK) { await delay(); return store.map((a) => structuredClone(a)) }
  return apiRequest('/api/medical/health-alerts')
}

export async function fetchHealthAlertById(id) {
  if (USE_MOCK) {
    await delay()
    const found = store.find((a) => a.id === id)
    if (!found) throw new Error('Not found')
    return structuredClone(found)
  }
  return apiRequest(`/api/medical/health-alerts/${id}`)
}

export async function createHealthAlert(payload) {
  if (USE_MOCK) {
    await delay(450)
    const created = { id: `alert-${Date.now()}`, ...payload }
    store = [created, ...store]
    return structuredClone(created)
  }
  return apiRequest('/api/medical/health-alerts', { method: 'POST', body: JSON.stringify(payload) })
}

export async function updateHealthAlert(id, payload) {
  if (USE_MOCK) {
    await delay(450)
    store = store.map((a) => (a.id === id ? { ...a, ...payload } : a))
    return structuredClone(store.find((a) => a.id === id))
  }
  return apiRequest(`/api/medical/health-alerts/${id}`, { method: 'PUT', body: JSON.stringify(payload) })
}

export async function startAlertReview(id, payload = {}) {
  if (USE_MOCK) {
    await delay(350)
    const found = store.find((a) => a.id === id)
    if (!found) throw new Error('Not found')
    Object.assign(found, typeof payload === 'object' ? payload : {})
    return structuredClone(found)
  }
  return apiRequest(`/api/medical/health-alerts/${id}`, { method: 'PATCH', body: JSON.stringify({ action: 'startAlertReview', ...(typeof payload === 'object' ? payload : {}) }) })
}

export async function resolveAlert(id, payload = {}) {
  if (USE_MOCK) {
    await delay(350)
    const found = store.find((a) => a.id === id)
    if (!found) throw new Error('Not found')
    Object.assign(found, typeof payload === 'object' ? payload : {})
    return structuredClone(found)
  }
  return apiRequest(`/api/medical/health-alerts/${id}`, { method: 'PATCH', body: JSON.stringify({ action: 'resolveAlert', ...(typeof payload === 'object' ? payload : {}) }) })
}

export async function addFollowUp(id, payload = {}) {
  if (USE_MOCK) {
    await delay(350)
    const found = store.find((a) => a.id === id)
    if (!found) throw new Error('Not found')
    Object.assign(found, typeof payload === 'object' ? payload : {})
    return structuredClone(found)
  }
  return apiRequest(`/api/medical/health-alerts/${id}`, { method: 'PATCH', body: JSON.stringify({ action: 'addFollowUp', ...(typeof payload === 'object' ? payload : {}) }) })
}

export async function completeFollowUp(id, payload = {}) {
  if (USE_MOCK) {
    await delay(350)
    const found = store.find((a) => a.id === id)
    if (!found) throw new Error('Not found')
    Object.assign(found, typeof payload === 'object' ? payload : {})
    return structuredClone(found)
  }
  return apiRequest(`/api/medical/health-alerts/${id}`, { method: 'PATCH', body: JSON.stringify({ action: 'completeFollowUp', ...(typeof payload === 'object' ? payload : {}) }) })
}

export async function updateGuidance(id, payload = {}) {
  if (USE_MOCK) {
    await delay(350)
    const found = store.find((a) => a.id === id)
    if (!found) throw new Error('Not found')
    Object.assign(found, typeof payload === 'object' ? payload : {})
    return structuredClone(found)
  }
  return apiRequest(`/api/medical/health-alerts/${id}`, { method: 'PATCH', body: JSON.stringify({ action: 'updateGuidance', ...(typeof payload === 'object' ? payload : {}) }) })
}
