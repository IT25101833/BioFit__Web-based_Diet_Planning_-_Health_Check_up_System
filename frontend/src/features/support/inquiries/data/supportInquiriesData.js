import { apiRequest, USE_MOCK } from '../../../../api/client'
export let clientInquiries = [
  {
    id: 'INQ-101',
    client: 'Alex Perera',
    clientId: 'BF-C1024',
    email: 'alex.perera@email.lk',
    phone: '+94 77 412 8821',
    subject: 'Can I reschedule my wellness appointment to the weekend?',
    category: 'Appointment Support',
    receivedAt: '2026-09-09T08:50:00',
    status: 'New',
    assignedTo: null,
    message: 'Hello, I have an appointment scheduled for Friday morning, but I may have a company presentation. Are there open slots on Saturday morning or Friday afternoon?',
    responses: [],
  },
  {
    id: 'INQ-102',
    client: 'Kaveesha Bandara',
    clientId: 'BF-C1092',
    email: 'kaveesha.b@email.lk',
    phone: '+94 77 220 4488',
    subject: 'Where can I access the virtual fitness session link?',
    category: 'Fitness Support',
    receivedAt: '2026-09-09T08:15:00',
    status: 'Assigned',
    assignedTo: 'Priya Nair',
    message: 'Good morning! I registered for the virtual fitness coaching session this Friday. Will the video link be posted inside the portal or sent by email?',
    responses: [],
  },
  {
    id: 'INQ-103',
    client: 'Chris Almeida',
    clientId: 'BF-C1170',
    email: 'ravindu.g@email.lk',
    phone: '+94 71 552 3311',
    subject: 'How does consultation credit rollover work at month end?',
    category: 'Programme Questions',
    receivedAt: '2026-09-09T07:45:00',
    status: 'Responded',
    assignedTo: 'Daniel Perera',
    message: 'If I do not use both of my monthly nutrition check-up tokens, do they roll over to the following month or expire?',
    responses: [
      {
        id: 'ir-1',
        author: 'Daniel Perera',
        at: '2026-09-09T08:30:00',
        text: 'Hi Alex! Up to one unused consultation token rolls over into the next 30-day billing cycle automatically.',
      },
    ],
  },
  {
    id: 'INQ-104',
    client: 'Nilmini Jayasinghe',
    clientId: 'BF-C1198',
    email: 'nilmini.j@email.lk',
    phone: '+94 76 881 4422',
    subject: 'Updating secondary emergency guardian contact phone number',
    category: 'Account Support',
    receivedAt: '2026-09-08T16:30:00',
    status: 'Responded',
    assignedTo: 'Dilrukshi Silva',
    message: 'I recently changed my secondary emergency contact number. Can this be updated from the client profile page or does it require support assistance?',
    responses: [
      {
        id: 'ir-2',
        author: 'Dilrukshi Silva',
        at: '2026-09-08T17:15:00',
        text: 'Hello Nilmini, you can update emergency contact details directly in My Profile → Emergency Contact. We have also verified your record on file.',
      },
    ],
  },
  {
    id: 'INQ-105',
    client: 'Maneesha Karunaratne',
    clientId: 'BF-C1205',
    email: 'maneesha.k@email.lk',
    phone: '+94 77 334 1199',
    subject: 'Is fasting blood glucose test mandatory before first visit?',
    category: 'Health Check-up Support',
    receivedAt: '2026-09-07T14:20:00',
    status: 'Closed',
    assignedTo: 'Priya Nair',
    message: 'My appointment is at 10:00 AM on Monday. Should I maintain a 10-hour fast for the routine vitals check-up?',
    responses: [
      {
        id: 'ir-3',
        author: 'Priya Nair',
        at: '2026-09-07T15:10:00',
        text: 'Dear Maneesha, for routine fitness check-ups fasting is not required unless specified as a comprehensive metabolic panel. We have marked this in your booking instructions.',
      },
    ],
  },
]

function delay(ms = 350) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function fetchClientInquiries() {
  if (USE_MOCK) { await delay(); return clientInquiries.map((i) => structuredClone(i)) }
  return apiRequest('/api/support/inquiries')
}

export async function respondToInquiry(id, payload) {
  if (USE_MOCK) {
    await delay(400)
    return { id, status: 'Responded', ...payload }
  }
  return apiRequest(`/api/support/inquiries/${id}/respond`, { method: 'POST', body: JSON.stringify(payload) })
}

export async function convertInquiryToTicket(id) {
  if (USE_MOCK) {
    await delay(450)
    return { id: `tkt-${Date.now()}`, fromInquiry: id }
  }
  return apiRequest(`/api/support/inquiries/${id}/convert`, { method: 'POST' })
}
