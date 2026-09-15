import { apiRequest, USE_MOCK } from '../../../../api/client'
let store = [
  {
    id: 'ha-1',
    clientId: 'BF-C1024',
    clientName: 'Alex Perera',
    date: '2026-09-08',
    type: 'Routine Health Check-up',
    advisor: 'Elena Costa',
    status: 'Pending Review',
    followUpRequired: true,
    nextReview: '2026-09-12',
    observations: {
      general: 'Overall wellness markers remain within expected programme ranges.',
      concerns: 'Mild post-session fatigue reported after denser training days.',
      restrictions: 'Prefer low-impact alternatives when fatigue is elevated.',
      allergyReview: 'No new allergies reported.',
      safety: 'Continue gradual progression; share fatigue note with coach.',
    },
    professionalNotes:
      'Pending formal sign-off. Coordinate follow-up with Coach Maya before intensity changes.',
    relatedAlertId: 'HRA-202',
  },
  {
    id: 'ha-2',
    clientId: 'BF-C1102',
    clientName: 'Taylor Kim',
    date: '2026-09-02',
    type: 'Follow-up Review',
    advisor: 'Elena Costa',
    status: 'Follow-up Required',
    followUpRequired: true,
    nextReview: '2026-09-09',
    observations: {
      general: 'Pathway participation is steady with conservative session lengths.',
      concerns: 'Occasional knee discomfort during longer walking intervals.',
      restrictions: 'Avoid prolonged high-intensity intervals and hard landings.',
      allergyReview: 'No allergies recorded.',
      safety: 'Joint-aware guidance remains active until follow-up today.',
    },
    professionalNotes:
      'Follow-up due with coach coordination. Soft-texture meal preference already shared with nutrition.',
    relatedAlertId: 'HRA-201',
  },
  {
    id: 'ha-3',
    clientId: 'BF-C1088',
    clientName: 'Sahan De Silva',
    date: '2026-09-03',
    type: 'Programme Health Review',
    advisor: 'Elena Costa',
    status: 'Completed',
    followUpRequired: false,
    nextReview: '2026-10-03',
    observations: {
      general: 'Complete Wellness Programme progress remains supportive.',
      concerns: 'Busy-week recovery pacing needs light monitoring.',
      restrictions: 'None beyond shellfish avoidance for meals.',
      allergyReview: 'Shellfish (mild) — nutrition team aware.',
      safety: 'Recovery emphasis appropriate; no urgent concerns.',
    },
    professionalNotes: 'Review completed. Optional pacing alert opened for care-team awareness.',
    relatedAlertId: 'HRA-204',
  },
  {
    id: 'ha-4',
    clientId: 'BF-C1201',
    clientName: 'Kasuni Abeysekara',
    date: '2026-09-01',
    type: 'Initial Health Assessment',
    advisor: 'Elena Costa',
    status: 'Reviewed',
    followUpRequired: true,
    nextReview: '2026-09-09',
    observations: {
      general: 'Fit for Complete Wellness Programme with allergy precautions.',
      concerns: 'Peanut allergy requires clear kitchen and meal-plan notes.',
      restrictions: 'Strict peanut avoidance including cross-contact awareness.',
      allergyReview: 'Peanut allergy confirmed and documented.',
      safety: 'High-priority safety reminder shared with nutrition and coaching teams.',
    },
    professionalNotes: 'Assessment reviewed. Allergy safety alert remains open until follow-up.',
    relatedAlertId: 'HRA-203',
  },
  {
    id: 'ha-5',
    clientId: 'BF-C1095',
    clientName: 'Nimali Silva',
    date: '2026-07-22',
    type: 'Initial Health Assessment',
    advisor: 'Elena Costa',
    status: 'Completed',
    followUpRequired: false,
    nextReview: '2026-09-10',
    observations: {
      general: 'Suitable for Health Monitoring Pathway with regular check-ins.',
      concerns: 'History of mild anaemia — monitor energy and meal consistency.',
      restrictions: 'Avoid abrupt intensity increases.',
      allergyReview: 'No allergies recorded.',
      safety: 'Schedule periodic wellness reviews every 6–8 weeks.',
    },
    professionalNotes: 'Baseline assessment complete. Record now overdue for routine update.',
    relatedAlertId: null,
  },
  {
    id: 'ha-6',
    clientId: 'BF-C1110',
    clientName: 'Dilani Fernando',
    date: '2026-08-22',
    type: 'Initial Health Assessment',
    advisor: 'Elena Costa',
    status: 'Follow-up Required',
    followUpRequired: true,
    nextReview: '2026-09-09',
    observations: {
      general: 'New enrollee — baseline wellness within expected ranges.',
      concerns: 'Limited prior structured activity experience.',
      restrictions: 'Start with beginner-friendly, low-impact sessions.',
      allergyReview: 'No allergies recorded.',
      safety: 'Confirm programme readiness at initial assessment appointment.',
    },
    professionalNotes: 'Follow-up assessment scheduled for Sep 9 to finalise programme guidance.',
    relatedAlertId: null,
  },
  {
    id: 'ha-7',
    clientId: 'BF-C1024',
    clientName: 'Alex Perera',
    date: '2026-08-12',
    type: 'Programme Health Review',
    advisor: 'Elena Costa',
    status: 'Completed',
    followUpRequired: false,
    nextReview: '2026-09-08',
    observations: {
      general: 'Weight Management Programme participation remains consistent.',
      concerns: 'None significant at time of review.',
      restrictions: 'Continue low-impact options as preferred.',
      allergyReview: 'No change.',
      safety: 'Cleared to continue current plan with routine monitoring.',
    },
    professionalNotes: 'Completed without outstanding medical actions.',
    relatedAlertId: null,
  },
  {
    id: 'ha-8',
    clientId: 'BF-C1102',
    clientName: 'Taylor Kim',
    date: '2026-08-10',
    type: 'Initial Health Assessment',
    advisor: 'Elena Costa',
    status: 'Completed',
    followUpRequired: true,
    nextReview: '2026-09-02',
    observations: {
      general: 'Enrolled on Health Monitoring Pathway with conservative start.',
      concerns: 'Knee comfort preference noted early.',
      restrictions: 'Avoid high-impact intervals initially.',
      allergyReview: 'No allergies recorded.',
      safety: 'Medical review required before intensity increases.',
    },
    professionalNotes: 'Initial pathway clearance granted with joint-aware guidance.',
    relatedAlertId: null,
  },
]

function delay(ms = 420) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function getAssessmentSummaryStats(list = store) {
  const counts = {
    total: list.length,
    pendingReview: 0,
    reviewed: 0,
    followUpRequired: 0,
    completed: 0,
  }
  for (const item of list) {
    if (item.status === 'Pending Review') counts.pendingReview += 1
    else if (item.status === 'Reviewed') counts.reviewed += 1
    else if (item.status === 'Follow-up Required') counts.followUpRequired += 1
    else if (item.status === 'Completed') counts.completed += 1
  }
  return counts
}

export async function fetchAssessments() {
  if (USE_MOCK) { await delay(); return store.map((a) => structuredClone(a)) }
  return apiRequest('/api/medical/assessments')
}

export async function fetchAssessmentById(id) {
  if (USE_MOCK) {
    await delay()
    const found = store.find((a) => a.id === id)
    if (!found) throw new Error('Not found')
    return structuredClone(found)
  }
  return apiRequest(`/api/medical/assessments/${id}`)
}

export async function createAssessment(payload) {
  if (USE_MOCK) {
    await delay(450)
    const created = { id: `ha-${Date.now()}`, ...payload }
    store = [created, ...store]
    return structuredClone(created)
  }
  return apiRequest('/api/medical/assessments', { method: 'POST', body: JSON.stringify(payload) })
}

export async function updateAssessment(id, payload) {
  if (USE_MOCK) {
    await delay(450)
    store = store.map((a) => (a.id === id ? { ...a, ...payload } : a))
    return structuredClone(store.find((a) => a.id === id))
  }
  return apiRequest(`/api/medical/assessments/${id}`, { method: 'PUT', body: JSON.stringify(payload) })
}
