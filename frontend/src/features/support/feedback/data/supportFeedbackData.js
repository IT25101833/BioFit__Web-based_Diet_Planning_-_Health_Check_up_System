import { apiRequest, shouldUseMockData } from '../../../../api/client'
export let feedbackItems = [
  {
    id: 'FB-501',
    client: 'Nimali Silva',
    clientId: 'BF-C1030',
    type: 'Positive Feedback',
    subject: 'The nutrition consultation was very helpful and practical.',
    message: 'Consultant Maya Fernando listened patiently to my digestive complaints and offered realistic meal swaps that I can prepare during busy workdays. Truly impressed with the care.',
    date: '2026-09-09T08:15:00',
    status: 'Acknowledged',
    assignedTo: 'Priya Nair',
    relatedService: 'Nutrition Consultation',
    notes: ['Acknowledged and shared with Maya Fernando in weekly appreciation digest.'],
    complaintLifecycle: null,
  },
  {
    id: 'FB-502',
    client: 'Tharindu Mendis',
    clientId: 'BF-C1064',
    type: 'Complaint',
    subject: 'Waiting time for lab check-up was 25 minutes past my booked slot.',
    message: 'I arrived 10 minutes early for my 9:00 AM check-up, but the phlebotomy room was occupied and I was only attended to at 9:35 AM. This caused me to be late for an office meeting.',
    date: '2026-09-08T15:40:00',
    status: 'Under Review',
    assignedTo: 'Priya Nair',
    relatedService: 'Clinical Lab Vitals Check-up',
    notes: [
      'Reviewed clinic schedule with Centre Manager Sarah Williams.',
      'A prior emergency blood draw created the delay.',
    ],
    complaintLifecycle: {
      step: 'Under Review',
      steps: ['Received', 'Under Review', 'Escalated if Needed', 'Response Provided', 'Resolved'],
      managerNotified: true,
      clientContacted: true,
    },
  },
  {
    id: 'FB-503',
    client: 'Hansi Rathnayake',
    clientId: 'BF-C1112',
    type: 'Suggestion',
    subject: 'Request for downloadable weekly grocery list in the meal planner.',
    message: 'It would save so much time on Sunday market trips if the 7-day meal plan had a one-click PDF grocery checklist categorized by produce and pantry staples.',
    date: '2026-09-07T11:20:00',
    status: 'Acknowledged',
    assignedTo: 'Daniel Perera',
    relatedService: 'Meal Plan Portal Feature',
    notes: ['Passed feature recommendation to product design team.'],
    complaintLifecycle: null,
  },
  {
    id: 'FB-504',
    client: 'Roshan Alwis',
    clientId: 'BF-C1185',
    type: 'Complaint',
    subject: 'Knee tension during assessment was not recorded in initial summary.',
    message: 'I mentioned knee stiffness to the assistant during body measurements, but my exported PDF does not mention it under physical observations.',
    date: '2026-09-06T14:10:00',
    status: 'Resolved',
    assignedTo: 'Priya Nair',
    relatedService: 'Fitness Assessment',
    notes: [
      'Escalated to Coach Maya Fernando.',
      'Coach updated observation sheet and re-issued client report.',
      'Client contacted and confirmed updated document is visible.',
    ],
    complaintLifecycle: {
      step: 'Resolved',
      steps: ['Received', 'Under Review', 'Escalated if Needed', 'Response Provided', 'Resolved'],
      managerNotified: true,
      clientContacted: true,
    },
  },
  {
    id: 'FB-505',
    client: 'Chamari Wickramasinghe',
    clientId: 'BF-C1220',
    type: 'Positive Feedback',
    subject: 'Seamless onboarding and friendly front desk reception at Colombo centre.',
    message: 'Every staff member was polite and warm. The biometric locker system and wellness consultation area felt like a world-class retreat.',
    date: '2026-09-05T16:45:00',
    status: 'Acknowledged',
    assignedTo: 'Dilrukshi Silva',
    relatedService: 'Wellness Centre Facility',
    notes: ['Shared with front-of-house operations.'],
    complaintLifecycle: null,
  },
]

function delay(ms = 350) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function fetchSupportFeedback() {
  if (shouldUseMockData()) { await delay(); return feedbackItems.map((f) => structuredClone(f)) }
  return apiRequest('/api/support/feedback')
}

export async function updateFeedbackStatus(id, status) {
  if (shouldUseMockData()) {
    await delay(350)
    feedbackItems = feedbackItems.map((f) => (f.id === id ? { ...f, status } : f))
    return feedbackItems.find((f) => f.id === id)
  }
  return apiRequest(`/api/support/feedback/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) })
}

export async function addFeedbackNote(id, note) {
  if (shouldUseMockData()) {
    await delay(350)
    return { id, note }
  }
  return apiRequest(`/api/support/feedback/${id}`, { method: 'PATCH', body: JSON.stringify({ note }) })
}

export async function resolveFeedback(id, payload = {}) {
  if (shouldUseMockData()) {
    await delay(400)
    return { id, status: 'Resolved', ...payload }
  }
  return apiRequest(`/api/support/feedback/${id}`, { method: 'PATCH', body: JSON.stringify({ status: 'Resolved', ...payload }) })
}
