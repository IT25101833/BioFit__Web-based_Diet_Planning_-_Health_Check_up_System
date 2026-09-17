import { apiRequest, shouldUseMockData } from '../../../../api/client'
import { hydrateList, persistList } from '../../data/supportMockStore'
export const supportOfficers = [
  { id: 'off-1', name: 'Priya Nair', email: 'amaya.fernando@vitallife.lk', role: 'Customer Experience Officer' },
  { id: 'off-2', name: 'Daniel Perera', email: 'kasun.j@vitallife.lk', role: 'Customer Experience Specialist' },
  { id: 'off-3', name: 'Dilrukshi Silva', email: 'dilrukshi.s@vitallife.lk', role: 'Client Care Representative' },
  { id: 'off-4', name: 'Chamath Perera', email: 'chamath.p@vitallife.lk', role: 'Support Specialist' },
]

export const supportCategories = [
  'Appointment Support',
  'Account Support',
  'Programme Questions',
  'Fitness Support',
  'Nutrition Support',
  'Health Check-up Support',
  'Other',
]

export const supportStatuses = [
  'Open',
  'Assigned',
  'In Progress',
  'Pending Client Reply',
  'Escalated',
  'Resolved',
  'Closed',
]

export const supportPriorities = ['Low', 'Medium', 'High', 'Urgent']

export const escalationDestinations = [
  { label: 'Wellness Centre Manager', role: 'Management & Escalations', relevantCategories: ['Appointment Support', 'Account Support', 'Programme Questions', 'Other'] },
  { label: 'Fitness Coach', role: 'Fitness & Workout Plans', relevantCategories: ['Fitness Support', 'Programme Questions'] },
  { label: 'Nutrition Consultant', role: 'Dietary & Meal Plans', relevantCategories: ['Nutrition Support', 'Programme Questions'] },
  { label: 'Medical Advisor', role: 'Clinical Vitals & Health Safety', relevantCategories: ['Health Check-up Support', 'Nutrition Support', 'Fitness Support', 'Other'] },
  { label: 'Digital Operations / Admin', role: 'Identity & Platform Systems', relevantCategories: ['Account Support', 'Other'] },
]

export let supportTickets = [
  {
    id: 'SUP-2048',
    subject: 'Appointment Booking Issue & Rescheduling',
    category: 'Appointment Support',
    priority: 'High',
    status: 'Open',
    assignedTo: null,
    waitingOn: 'Support',
    waitingTimeMinutes: 45,
    createdAt: '2026-09-09T08:30:00',
    updatedAt: '2026-09-09T09:15:00',
    lastActivityAt: '2026-09-09T09:15:00',
    client: {
      id: 'BF-C1024',
      name: 'Alex Perera',
      email: 'alex.perera@email.lk',
      phone: '+94 77 412 8821',
      programme: 'Weight Management Programme',
      previousTicketCount: 3,
    },
    relatedService: {
      type: 'Appointment',
      reference: 'APT-8821',
      title: 'Routine Health Check-up Consultation',
      date: '12 Sep 2026',
      time: '09:30 AM',
      status: 'Confirmed',
    },
    messages: [
      {
        id: 'msg-101',
        author: 'Alex Perera',
        role: 'client',
        at: '2026-09-09T08:30:00',
        body: 'Hello BioFit team, I booked a consultation for Friday 12 Sep at 9:30 AM, but my work schedule shifted unexpectedly. Can I please reschedule this consultation to an afternoon slot or Saturday morning?',
        attachments: [],
      },
      {
        id: 'msg-102',
        author: 'Alex Perera',
        role: 'client',
        at: '2026-09-09T09:15:00',
        body: 'Following up to see if 2:00 PM or 3:30 PM on the same day is open with Elena Costa. Thank you!',
        attachments: [],
      },
    ],
    activityTimeline: [
      { id: 'act-1', text: 'Ticket created by Alex Perera via Client Portal', at: 'Today Â· 08:30 AM' },
      { id: 'act-2', text: 'Entered Support Queue (High Priority)', at: 'Today Â· 08:30 AM' },
      { id: 'act-3', text: 'Client added follow-up message with requested time slots', at: 'Today Â· 09:15 AM' },
    ],
    escalation: null,
    resolution: null,
  },
  {
    id: 'SUP-2047',
    subject: 'Meal Plan Recipe Alternatives for Weekday Dinners',
    category: 'Nutrition Support',
    priority: 'Normal',
    status: 'Pending Client Reply',
    assignedTo: 'Priya Nair',
    waitingOn: 'Client',
    waitingTimeMinutes: 120,
    createdAt: '2026-09-08T14:10:00',
    updatedAt: '2026-09-09T08:45:00',
    lastActivityAt: '2026-09-09T08:45:00',
    client: {
      id: 'BF-C1102',
      name: 'Taylor Kim',
      email: 'ishara.f@email.lk',
      phone: '+94 71 893 2244',
      programme: 'Health Monitoring Pathway',
      previousTicketCount: 2,
    },
    relatedService: {
      type: 'Programme',
      reference: 'PRG-401',
      title: 'Health Monitoring & Nutrition Pathway',
      date: 'Active',
      time: 'Phase 2',
      status: 'Active',
    },
    messages: [
      {
        id: 'msg-201',
        author: 'Taylor Kim',
        role: 'client',
        at: '2026-09-08T14:10:00',
        body: 'Hi, my weekday meal plan has several recipes containing lentils which cause mild digestive discomfort. Could I swap those for grilled fish or tofu options?',
        attachments: [],
      },
      {
        id: 'msg-202',
        author: 'Priya Nair',
        role: 'support',
        at: '2026-09-08T15:20:00',
        body: 'Hello Ishara! Thank you for reaching out. We can certainly accommodate dietary swaps. Are there any specific allergies to soy, fish, or other plant protein alternatives we should note?',
        attachments: [],
      },
      {
        id: 'msg-203',
        author: 'Priya Nair',
        role: 'internal_note',
        at: '2026-09-08T15:25:00',
        body: 'Client has no recorded allergies in basic profile. Awaiting clarification before consulting Nutritionist Maya Fernando.',
        attachments: [],
      },
      {
        id: 'msg-204',
        author: 'Priya Nair',
        role: 'support',
        at: '2026-09-09T08:45:00',
        body: 'Good morning Ishara, just gently following up on your protein preferences so we can update your meal plan smoothly.',
        attachments: [],
      },
    ],
    activityTimeline: [
      { id: 'act-21', text: 'Ticket created by Taylor Kim', at: 'Sep 8 Â· 02:10 PM' },
      { id: 'act-22', text: 'Assigned to Priya Nair', at: 'Sep 8 Â· 02:25 PM' },
      { id: 'act-23', text: 'Initial response sent to client', at: 'Sep 8 Â· 03:20 PM' },
      { id: 'act-24', text: 'Internal note recorded regarding allergy verification', at: 'Sep 8 Â· 03:25 PM' },
      { id: 'act-25', text: 'Follow-up sent; marked as Pending Client Reply', at: 'Today Â· 08:45 AM' },
    ],
    escalation: null,
    resolution: null,
  },
  {
    id: 'SUP-2045',
    subject: 'Workout Plan Exercise Substitution for Knee Strain',
    category: 'Fitness Support',
    priority: 'Normal',
    status: 'In Progress',
    assignedTo: 'Priya Nair',
    waitingOn: 'Support',
    waitingTimeMinutes: 25,
    createdAt: '2026-09-08T11:00:00',
    updatedAt: '2026-09-09T09:00:00',
    lastActivityAt: '2026-09-09T09:00:00',
    client: {
      id: 'BF-C1088',
      name: 'Sahan De Silva',
      email: 'sahan.ds@email.lk',
      phone: '+94 77 992 1100',
      programme: 'Complete Wellness Programme',
      previousTicketCount: 1,
    },
    relatedService: {
      type: 'Programme',
      reference: 'PRG-102',
      title: 'Complete Wellness Programme Â· Fitness Track',
      date: 'Active',
      time: 'Week 4',
      status: 'Active',
    },
    messages: [
      {
        id: 'msg-301',
        author: 'Sahan De Silva',
        role: 'client',
        at: '2026-09-08T11:00:00',
        body: 'I felt mild tension in my right knee during bodyweight lunges yesterday. Is there a lower impact exercise I can do instead until my check-in?',
        attachments: [],
      },
      {
        id: 'msg-302',
        author: 'Priya Nair',
        role: 'support',
        at: '2026-09-08T11:45:00',
        body: 'Hello Sahan, thank you for letting us know immediately. Please pause weighted or deep lunges. We recommend gentle glute bridges and stationary bike cardio at low resistance while we confirm with Coach Maya Fernando.',
        attachments: [],
      },
      {
        id: 'msg-303',
        author: 'Priya Nair',
        role: 'internal_note',
        at: '2026-09-08T11:50:00',
        body: 'Checked with Coach Maya during morning standup. Maya suggested wall squats and seated leg extensions with resistance bands.',
        attachments: [],
      },
    ],
    activityTimeline: [
      { id: 'act-31', text: 'Ticket created by Sahan De Silva', at: 'Sep 8 Â· 11:00 AM' },
      { id: 'act-32', text: 'Assigned to Priya Nair', at: 'Sep 8 Â· 11:15 AM' },
      { id: 'act-33', text: 'First response provided with knee safety guidance', at: 'Sep 8 Â· 11:45 AM' },
      { id: 'act-34', text: 'In Progress: coach recommendations being synthesized', at: 'Today Â· 09:00 AM' },
    ],
    escalation: null,
    resolution: null,
  },
  {
    id: 'SUP-2041',
    subject: 'Health Assessment Date Reschedule Confirmation',
    category: 'Health Check-up Support',
    priority: 'Normal',
    status: 'Resolved',
    assignedTo: 'Daniel Perera',
    waitingOn: 'Support',
    waitingTimeMinutes: 0,
    createdAt: '2026-09-07T10:15:00',
    updatedAt: '2026-09-08T16:20:00',
    lastActivityAt: '2026-09-08T16:20:00',
    client: {
      id: 'BF-C1110',
      name: 'Dilani Fernando',
      email: 'dilani.f@email.lk',
      phone: '+94 76 331 4455',
      programme: 'Weight Management Programme',
      previousTicketCount: 4,
    },
    relatedService: {
      type: 'Appointment',
      reference: 'APT-7410',
      title: 'Routine Health Check-up Consultation',
      date: '10 Sep 2026',
      time: '11:00 AM',
      status: 'Confirmed',
    },
    messages: [
      {
        id: 'msg-401',
        author: 'Dilani Fernando',
        role: 'client',
        at: '2026-09-07T10:15:00',
        body: 'Could I shift my routine health check-up from 8th September to 10th September at 11:00 AM?',
        attachments: [],
      },
      {
        id: 'msg-402',
        author: 'Daniel Perera',
        role: 'support',
        at: '2026-09-07T11:00:00',
        body: 'Certainly Dilani. We have rescheduled your appointment to Thursday 10th September at 11:00 AM with Elena Costa. An SMS and email notification have been sent.',
        attachments: [],
      },
      {
        id: 'msg-403',
        author: 'Dilani Fernando',
        role: 'client',
        at: '2026-09-07T11:30:00',
        body: 'Received the confirmation! Thank you very much for the prompt help.',
        attachments: [],
      },
    ],
    activityTimeline: [
      { id: 'act-41', text: 'Ticket created by Dilani Fernando', at: 'Sep 7 Â· 10:15 AM' },
      { id: 'act-42', text: 'Assigned to Daniel Perera', at: 'Sep 7 Â· 10:20 AM' },
      { id: 'act-43', text: 'Rescheduled and confirmation delivered', at: 'Sep 7 Â· 11:00 AM' },
      { id: 'act-44', text: 'Ticket successfully resolved', at: 'Sep 8 Â· 04:20 PM' },
    ],
    escalation: null,
    resolution: {
      resolvedBy: 'Daniel Perera',
      resolvedAt: '2026-09-08T16:20:00',
      summary: 'Appointment rescheduled to 10 Sep 11:00 AM and acknowledged by client.',
      category: 'Appointment Updated',
    },
  },
  {
    id: 'SUP-2039',
    subject: 'Medication Allergy Pre-Check Query for Health Check-up',
    category: 'Health Check-up Support',
    priority: 'High',
    status: 'Escalated',
    assignedTo: 'Priya Nair',
    waitingOn: 'Specialist',
    waitingTimeMinutes: 180,
    createdAt: '2026-09-07T09:00:00',
    updatedAt: '2026-09-08T14:30:00',
    lastActivityAt: '2026-09-08T14:30:00',
    client: {
      id: 'BF-C1145',
      name: 'Kasuni Abeysekara',
      email: 'kasuni.a@email.lk',
      phone: '+94 77 128 9901',
      programme: 'Health Monitoring Pathway',
      previousTicketCount: 2,
    },
    relatedService: {
      type: 'Appointment',
      reference: 'APT-6029',
      title: 'Initial Health Assessment',
      date: '14 Sep 2026',
      time: '10:00 AM',
      status: 'Confirmed',
    },
    messages: [
      {
        id: 'msg-501',
        author: 'Kasuni Abeysekara',
        role: 'client',
        at: '2026-09-07T09:00:00',
        body: 'I have a penicillin and NSAID sensitivity. Does the upcoming comprehensive health screening involve any topical disinfectants or test reagents I should be cautious about?',
        attachments: [],
      },
      {
        id: 'msg-502',
        author: 'Priya Nair',
        role: 'support',
        at: '2026-09-07T09:40:00',
        body: 'Dear Kasuni, thank you for proactively highlighting your sensitivity. For your absolute safety, I have escalated this question directly to our Medical Advisor, Elena Costa, who will review the clinical screening protocol and provide tailored advice.',
        attachments: [],
      },
      {
        id: 'msg-503',
        author: 'Priya Nair',
        role: 'internal_note',
        at: '2026-09-07T09:45:00',
        body: 'Escalated to Medical Advisor Elena Costa. High priority safety check prior to assessment on 14 Sep.',
        attachments: [],
      },
      {
        id: 'msg-504',
        author: 'Elena Costa (Medical Advisor)',
        role: 'specialist',
        at: '2026-09-08T14:30:00',
        body: 'The standard assessment protocol does not use NSAIDs or penicillin derivatives. Skin preparation uses hypoallergenic chlorhexidine. Client is cleared for the 14 Sep assessment with standard allergy tags.',
        attachments: [],
      },
    ],
    activityTimeline: [
      { id: 'act-51', text: 'Ticket created by Kasuni Abeysekara', at: 'Sep 7 Â· 09:00 AM' },
      { id: 'act-52', text: 'Assigned to Priya Nair', at: 'Sep 7 Â· 09:10 AM' },
      { id: 'act-53', text: 'Escalated to Medical Advisor Elena Costa', at: 'Sep 7 Â· 09:45 AM' },
      { id: 'act-54', text: 'Specialist guidance recorded; awaiting final officer client communication', at: 'Sep 8 Â· 02:30 PM' },
    ],
    escalation: {
      escalatedTo: 'Medical Advisor',
      escalatedBy: 'Priya Nair',
      escalatedAt: '2026-09-07T09:45:00',
      reason: 'Clinical allergy screening verification required before on-site assessment.',
      additionalContext: 'Client indicated penicillin and NSAID sensitivities.',
      status: 'Specialist Responded',
      specialistResponse: 'The standard assessment protocol does not use NSAIDs or penicillin derivatives. Skin preparation uses hypoallergenic chlorhexidine. Client is cleared for the 14 Sep assessment with standard allergy tags.',
    },
    resolution: null,
  },
  {
    id: 'SUP-2035',
    subject: 'Biometric Watch Sync Disconnected from BioFit Dashboard',
    category: 'Account Support',
    priority: 'Normal',
    status: 'In Progress',
    assignedTo: 'Dilrukshi Silva',
    waitingOn: 'Support',
    waitingTimeMinutes: 50,
    createdAt: '2026-09-06T15:20:00',
    updatedAt: '2026-09-08T11:10:00',
    lastActivityAt: '2026-09-08T11:10:00',
    client: {
      id: 'BF-C1055',
      name: 'Dinesh Wickramasinghe',
      email: 'dinesh.w@email.lk',
      phone: '+94 77 881 2299',
      programme: 'Complete Wellness Programme',
      previousTicketCount: 1,
    },
    relatedService: {
      type: 'Account',
      reference: 'ACC-1055',
      title: 'Biometric Wearable Integration',
      date: 'Connected Aug 2026',
      time: 'Garmin Sync',
      status: 'Disconnected',
    },
    messages: [
      {
        id: 'msg-601',
        author: 'Dinesh Wickramasinghe',
        role: 'client',
        at: '2026-09-06T15:20:00',
        body: 'My Garmin watch stopped syncing heart rate and daily steps to my BioFit dashboard since yesterday morning. I re-logged in but the status is still inactive.',
        attachments: [],
      },
      {
        id: 'msg-602',
        author: 'Dilrukshi Silva',
        role: 'support',
        at: '2026-09-06T16:10:00',
        body: 'Hi Dinesh, we are investigating the sync token refresh with our digital integrations team. Please ensure Bluetooth sharing permissions are toggled on in the mobile app settings.',
        attachments: [],
      },
    ],
    activityTimeline: [
      { id: 'act-61', text: 'Ticket created by Dinesh Wickramasinghe', at: 'Sep 6 Â· 03:20 PM' },
      { id: 'act-62', text: 'Assigned to Dilrukshi Silva', at: 'Sep 6 Â· 03:40 PM' },
      { id: 'act-63', text: 'Initial troubleshooting instructions provided', at: 'Sep 6 Â· 04:10 PM' },
      { id: 'act-64', text: 'Digital Operations consulted regarding OAuth refresh', at: 'Sep 8 Â· 11:10 AM' },
    ],
    escalation: null,
    resolution: null,
  },
  {
    id: 'SUP-2031',
    subject: 'Membership Tier Upgrade and Additional Consultation Credits',
    category: 'Programme Questions',
    priority: 'Low',
    status: 'Open',
    assignedTo: null,
    waitingOn: 'Support',
    waitingTimeMinutes: 15,
    createdAt: '2026-09-09T08:55:00',
    updatedAt: '2026-09-09T08:55:00',
    lastActivityAt: '2026-09-09T08:55:00',
    client: {
      id: 'BF-C1170',
      name: 'Chris Almeida',
      email: 'ravindu.g@email.lk',
      phone: '+94 71 552 3311',
      programme: 'Weight Management Programme',
      previousTicketCount: 0,
    },
    relatedService: {
      type: 'Programme',
      reference: 'PRG-101',
      title: 'Weight Management Programme (Standard)',
      date: 'Enrolled Aug 2026',
      time: 'Month 2',
      status: 'Active',
    },
    messages: [
      {
        id: 'msg-701',
        author: 'Chris Almeida',
        role: 'client',
        at: '2026-09-09T08:55:00',
        body: 'Hi there! I am interested in upgrading to the Comprehensive VitalLife Tier to get fortnightly 1-on-1 consultations with both Nutrition and Fitness coaches. How does billing and credit adjustment work?',
        attachments: [],
      },
    ],
    activityTimeline: [
      { id: 'act-71', text: 'Ticket created by Chris Almeida', at: 'Today Â· 08:55 AM' },
      { id: 'act-72', text: 'Placed in Support Ticket Queue (Low Priority)', at: 'Today Â· 08:55 AM' },
    ],
    escalation: null,
    resolution: null,
  },
  {
    id: 'SUP-2028',
    subject: 'Trainer Session Check-in Inquiry for Virtual Coaching',
    category: 'Fitness Support',
    priority: 'Normal',
    status: 'Assigned',
    assignedTo: 'Chamath Perera',
    waitingOn: 'Support',
    waitingTimeMinutes: 30,
    createdAt: '2026-09-09T08:15:00',
    updatedAt: '2026-09-09T08:40:00',
    lastActivityAt: '2026-09-09T08:40:00',
    client: {
      id: 'BF-C1092',
      name: 'Kaveesha Bandara',
      email: 'kaveesha.b@email.lk',
      phone: '+94 77 220 4488',
      programme: 'Complete Wellness Programme',
      previousTicketCount: 1,
    },
    relatedService: {
      type: 'Appointment',
      reference: 'APT-9102',
      title: 'Virtual Fitness Coaching Check-in',
      date: '11 Sep 2026',
      time: '04:00 PM',
      status: 'Scheduled',
    },
    messages: [
      {
        id: 'msg-801',
        author: 'Kaveesha Bandara',
        role: 'client',
        at: '2026-09-09T08:15:00',
        body: 'Is the virtual session link generated inside the BioFit portal or emailed prior to the meeting? Just wanted to make sure before Friday.',
        attachments: [],
      },
    ],
    activityTimeline: [
      { id: 'act-81', text: 'Ticket created by Kaveesha Bandara', at: 'Today Â· 08:15 AM' },
      { id: 'act-82', text: 'Assigned to Chamath Perera', at: 'Today Â· 08:40 AM' },
    ],
    escalation: null,
    resolution: null,
  },
  {
    id: 'SUP-2022',
    subject: 'Clarification on Micronutrient Intake Supplement Guide',
    category: 'Nutrition Support',
    priority: 'Low',
    status: 'Closed',
    assignedTo: 'Priya Nair',
    waitingOn: 'Support',
    waitingTimeMinutes: 0,
    createdAt: '2026-08-30T10:00:00',
    updatedAt: '2026-09-02T16:00:00',
    lastActivityAt: '2026-09-02T16:00:00',
    client: {
      id: 'BF-C1024',
      name: 'Alex Perera',
      email: 'alex.perera@email.lk',
      phone: '+94 77 412 8821',
      programme: 'Weight Management Programme',
      previousTicketCount: 3,
    },
    relatedService: {
      type: 'Programme',
      reference: 'PRG-101',
      title: 'Weight Management Nutrition Track',
      date: 'Active',
      time: 'Month 1',
      status: 'Active',
    },
    messages: [
      {
        id: 'msg-901',
        author: 'Alex Perera',
        role: 'client',
        at: '2026-08-30T10:00:00',
        body: 'Where can I access the recommended vitamin D3 supplement brand list from my consultation?',
        attachments: [],
      },
      {
        id: 'msg-902',
        author: 'Priya Nair',
        role: 'support',
        at: '2026-08-30T10:30:00',
        body: 'Hi Alex! It has been attached to your Meal Plan Documents under My Meal Plan â†’ Supplements. Let us know if you need anything else.',
        attachments: [],
      },
      {
        id: 'msg-903',
        author: 'Alex Perera',
        role: 'client',
        at: '2026-08-30T11:00:00',
        body: 'Found it, thank you!',
        attachments: [],
      },
    ],
    activityTimeline: [
      { id: 'act-91', text: 'Ticket created by Alex Perera', at: 'Aug 30 Â· 10:00 AM' },
      { id: 'act-92', text: 'Assigned to Priya Nair', at: 'Aug 30 Â· 10:10 AM' },
      { id: 'act-93', text: 'Guidance provided by Priya Nair', at: 'Aug 30 Â· 10:30 AM' },
      { id: 'act-94', text: 'Resolved and confirmed by client', at: 'Aug 30 Â· 11:00 AM' },
      { id: 'act-95', text: 'Closed after 72-hour grace period', at: 'Sep 2 Â· 04:00 PM' },
    ],
    escalation: null,
    resolution: {
      resolvedBy: 'Priya Nair',
      resolvedAt: '2026-08-30T11:00:00',
      summary: 'Guided client to supplemental guide in My Meal Plan.',
      category: 'Information Provided',
    },
  },
]

supportTickets = hydrateList('tickets', supportTickets)

function persistTickets() {
  persistList('tickets', supportTickets)
}

function delay(ms = 350) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function fetchSupportTickets() {
  if (shouldUseMockData()) {
    await delay()
    supportTickets = hydrateList('tickets', supportTickets)
    return supportTickets.map((t) => structuredClone(t))
  }
  return apiRequest('/api/support/tickets')
}

export async function fetchSupportTicketById(id) {
  if (shouldUseMockData()) {
    await delay()
    supportTickets = hydrateList('tickets', supportTickets)
    const found = supportTickets.find((t) => t.id === id)
    if (!found) throw new Error('Not found')
    return structuredClone(found)
  }
  return apiRequest(`/api/support/tickets/${id}`)
}

export async function assignSupportTicket(id, officerName) {
  if (shouldUseMockData()) {
    await delay(400)
    const ticket = supportTickets.find((t) => t.id === id)
    if (!ticket) throw new Error('Ticket not found')
    ticket.assignedTo = officerName
    if (ticket.status === 'Open' || !ticket.status) ticket.status = 'Assigned'
    ticket.updatedAt = new Date().toISOString()
    ticket.activityTimeline.unshift({ id: `act-${Date.now()}`, text: `Assigned to ${officerName}`, at: 'Just now' })
    persistTickets()
    return structuredClone(ticket)
  }
  return apiRequest(`/api/support/tickets/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({
      assignedTo: officerName,
      status: 'Assigned',
      activity: `Assigned to ${officerName}`,
    }),
  })
}

export async function startTicketProgress(id) {
  if (shouldUseMockData()) {
    await delay(350)
    const ticket = supportTickets.find((t) => t.id === id)
    if (!ticket) throw new Error('Ticket not found')
    ticket.status = 'In Progress'
    ticket.updatedAt = new Date().toISOString()
    ticket.activityTimeline.unshift({ id: `act-${Date.now()}`, text: 'Work started; status changed to In Progress', at: 'Just now' })
    persistTickets()
    return structuredClone(ticket)
  }
  return apiRequest(`/api/support/tickets/${id}`, { method: 'PATCH', body: JSON.stringify({ status: 'In Progress', activity: 'Work started' }) })
}

export async function updateSupportTicketStatus(id, newStatus) {
  if (shouldUseMockData()) {
    await delay(350)
    const ticket = supportTickets.find((t) => t.id === id)
    if (!ticket) throw new Error('Ticket not found')
    ticket.status = newStatus
    ticket.updatedAt = new Date().toISOString()
    ticket.activityTimeline.unshift({ id: `act-${Date.now()}`, text: `Status updated to ${newStatus}`, at: 'Just now' })
    persistTickets()
    return structuredClone(ticket)
  }
  return apiRequest(`/api/support/tickets/${id}`, { method: 'PATCH', body: JSON.stringify({ status: newStatus, activity: `Status updated to ${newStatus}` }) })
}

export async function updateSupportTicketPriority(id, newPriority) {
  if (shouldUseMockData()) {
    await delay(300)
    const ticket = supportTickets.find((t) => t.id === id)
    if (!ticket) throw new Error('Ticket not found')
    ticket.priority = newPriority
    ticket.updatedAt = new Date().toISOString()
    ticket.activityTimeline.unshift({ id: `act-${Date.now()}`, text: `Priority updated to ${newPriority}`, at: 'Just now' })
    persistTickets()
    return structuredClone(ticket)
  }
  return apiRequest(`/api/support/tickets/${id}`, { method: 'PATCH', body: JSON.stringify({ priority: newPriority, activity: `Priority updated to ${newPriority}` }) })
}

export async function updateSupportTicketCategory(id, newCategory) {
  if (shouldUseMockData()) {
    await delay(300)
    const ticket = supportTickets.find((t) => t.id === id)
    if (!ticket) throw new Error('Ticket not found')
    ticket.category = newCategory
    ticket.updatedAt = new Date().toISOString()
    ticket.activityTimeline.unshift({ id: `act-${Date.now()}`, text: `Category updated to ${newCategory}`, at: 'Just now' })
    persistTickets()
    return structuredClone(ticket)
  }
  return apiRequest(`/api/support/tickets/${id}`, { method: 'PATCH', body: JSON.stringify({ category: newCategory, activity: `Category updated to ${newCategory}` }) })
}

export async function sendTicketReply(id, messageBody) {
  if (shouldUseMockData()) {
    await delay(450)
    const ticket = supportTickets.find((t) => t.id === id)
    if (!ticket) throw new Error('Ticket not found')
    ticket.messages.push({ id: `msg-${Date.now()}`, author: 'Priya Nair', role: 'support', at: new Date().toISOString(), body: messageBody, attachments: [] })
    ticket.status = 'Pending Client Reply'
    ticket.waitingOn = 'Client'
    ticket.updatedAt = new Date().toISOString()
    ticket.activityTimeline.unshift({ id: `act-${Date.now()}`, text: 'Response sent to client', at: 'Just now' })
    try {
      const { pushClientNotification } = await import('../../../client/notifications/data/notificationData')
      const { supportTickets: clientTickets } = await import('../../../client/support/data/supportData')
      const clientTicket = clientTickets.find((t) => t.id === id)
      if (clientTicket) {
        clientTicket.messages.push({
          id: `m-${Date.now()}`,
          author: 'Support Team',
          role: 'support',
          at: new Date().toISOString(),
          body: messageBody,
        })
        clientTicket.status = 'Pending Reply'
        clientTicket.updatedAt = ticket.updatedAt
      }
      pushClientNotification({
        type: 'support',
        title: 'Support replied to your ticket',
        body: `Support replied on "${ticket.subject}". Please review and respond if needed.`,
        link: `/client/support/${ticket.id}`,
      })
    } catch {
      // optional mock bridge
    }
    persistTickets()
    return structuredClone(ticket)
  }
  return apiRequest(`/api/support/tickets/${id}`, { method: 'PATCH', body: JSON.stringify({ message: messageBody, status: 'Pending Client Reply', waitingOn: 'Client', author: 'Support', activity: 'Response sent to client' }) })
}

export async function addTicketInternalNote(id, noteBody) {
  if (shouldUseMockData()) {
    await delay(350)
    const ticket = supportTickets.find((t) => t.id === id)
    if (!ticket) throw new Error('Ticket not found')
    ticket.messages.push({ id: `msg-${Date.now()}`, author: 'Priya Nair', role: 'internal_note', at: new Date().toISOString(), body: noteBody, attachments: [] })
    ticket.updatedAt = new Date().toISOString()
    ticket.activityTimeline.unshift({ id: `act-${Date.now()}`, text: 'Internal note added', at: 'Just now' })
    persistTickets()
    return structuredClone(ticket)
  }
  return apiRequest(`/api/support/tickets/${id}`, { method: 'PATCH', body: JSON.stringify({ note: noteBody, internal: true, author: 'Support', activity: 'Internal note added' }) })
}

export async function escalateSupportTicket(id, { escalateTo, reason, additionalContext }) {
  if (shouldUseMockData()) {
    await delay(500)
    const ticket = supportTickets.find((t) => t.id === id)
    if (!ticket) throw new Error('Ticket not found')
    ticket.status = 'Escalated'
    ticket.waitingOn = 'Specialist'
    ticket.escalation = { escalatedTo: escalateTo, escalatedBy: 'Priya Nair', escalatedAt: new Date().toISOString(), reason, additionalContext: additionalContext || '', status: 'Under Review', specialistResponse: null }
    ticket.updatedAt = new Date().toISOString()
    ticket.activityTimeline.unshift({ id: `act-${Date.now()}`, text: `Ticket escalated to ${escalateTo}`, at: 'Just now' })
    persistTickets()
    return structuredClone(ticket)
  }
  return apiRequest(`/api/support/tickets/${id}`, { method: 'PATCH', body: JSON.stringify({ status: 'Escalated', waitingOn: 'Specialist', escalation: { escalatedTo: escalateTo, reason, additionalContext }, activity: `Escalated to ${escalateTo}` }) })
}

export async function resolveSupportTicket(id, { summary, category }) {
  if (shouldUseMockData()) {
    await delay(450)
    const ticket = supportTickets.find((t) => t.id === id)
    if (!ticket) throw new Error('Ticket not found')
    ticket.status = 'Resolved'
    ticket.waitingOn = 'Support'
    ticket.resolution = { resolvedBy: 'Priya Nair', resolvedAt: new Date().toISOString(), summary, category: category || 'General Resolution' }
    ticket.updatedAt = new Date().toISOString()
    ticket.activityTimeline.unshift({ id: `act-${Date.now()}`, text: `Ticket resolved: ${summary}`, at: 'Just now' })
    try {
      const { pushClientNotification } = await import('../../../client/notifications/data/notificationData')
      const { supportTickets: clientTickets } = await import('../../../client/support/data/supportData')
      const clientTicket = clientTickets.find((t) => t.id === id)
      if (clientTicket) {
        clientTicket.status = 'Resolved'
        clientTicket.resolution = ticket.resolution
        clientTicket.updatedAt = ticket.updatedAt
      }
      pushClientNotification({
        type: 'support',
        title: 'Support ticket resolved',
        body: `Your ticket "${ticket.subject}" was marked resolved. You can reopen it if something is still outstanding.`,
        link: `/client/support/${ticket.id}`,
      })
    } catch {
      // optional mock bridge
    }
    persistTickets()
    return structuredClone(ticket)
  }
  return apiRequest(`/api/support/tickets/${id}`, { method: 'PATCH', body: JSON.stringify({ status: 'Resolved', resolution: { summary, category }, activity: `Resolved: ${summary}` }) })
}

export async function closeSupportTicket(id) {
  if (shouldUseMockData()) {
    await delay(400)
    const ticket = supportTickets.find((t) => t.id === id)
    if (!ticket) throw new Error('Ticket not found')
    ticket.status = 'Closed'
    ticket.updatedAt = new Date().toISOString()
    ticket.activityTimeline.unshift({ id: `act-${Date.now()}`, text: 'Ticket closed', at: 'Just now' })
    try {
      const { pushClientNotification } = await import('../../../client/notifications/data/notificationData')
      const { supportTickets: clientTickets } = await import('../../../client/support/data/supportData')
      const clientTicket = clientTickets.find((t) => t.id === id)
      if (clientTicket) {
        clientTicket.status = 'Closed'
        clientTicket.updatedAt = ticket.updatedAt
      }
      pushClientNotification({
        type: 'support',
        title: 'Support ticket closed',
        body: `Your ticket "${ticket.subject}" has been closed.`,
        link: `/client/support/${ticket.id}`,
      })
    } catch {
      // optional mock bridge
    }
    persistTickets()
    return structuredClone(ticket)
  }
  return apiRequest(`/api/support/tickets/${id}`, { method: 'PATCH', body: JSON.stringify({ status: 'Closed', activity: 'Ticket closed' }) })
}

export async function fetchClientSupportHistory(clientId) {
  if (shouldUseMockData()) {
    await delay(300)
    return structuredClone(supportTickets.filter((t) => t.client.id === clientId))
  }
  return apiRequest(`/api/support/tickets/client/${clientId}`)
}

