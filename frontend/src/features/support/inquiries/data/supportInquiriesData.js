import { apiRequest, shouldUseMockData } from '../../../../api/client'
import { hydrateList, persistList, getMockClientProfile } from '../../data/supportMockStore'
import { pushSupportNotification } from '../../notifications/data/supportNotificationsData'

const INQUIRY_SEED = [
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

export let clientInquiries = hydrateList('inquiries', INQUIRY_SEED)

function delay(ms = 350) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function persistInquiries() {
  persistList('inquiries', clientInquiries)
}

export async function fetchClientInquiries() {
  if (shouldUseMockData()) {
    await delay()
    clientInquiries = hydrateList('inquiries', INQUIRY_SEED)
    return clientInquiries.map((i) => structuredClone(i))
  }
  return apiRequest('/api/support/inquiries')
}

export async function respondToInquiry(id, payload) {
  if (shouldUseMockData()) {
    await delay(400)
    clientInquiries = hydrateList('inquiries', INQUIRY_SEED)
    const inquiry = clientInquiries.find((i) => i.id === id)
    if (!inquiry) throw new Error('Inquiry not found')
    const text = typeof payload === 'string' ? payload : payload?.message || payload?.text || ''
    inquiry.responses = inquiry.responses || []
    inquiry.responses.push({
      id: `ir-${Date.now()}`,
      author: 'Priya Nair',
      at: new Date().toISOString(),
      text,
    })
    inquiry.status = 'Responded'
    inquiry.assignedTo = inquiry.assignedTo || 'Priya Nair'
    persistInquiries()
    return structuredClone(inquiry)
  }
  const body = typeof payload === 'string' ? { message: payload } : payload
  return apiRequest(`/api/support/inquiries/${id}/respond`, {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export async function convertInquiryToTicket(id) {
  if (shouldUseMockData()) {
    await delay(450)
    clientInquiries = hydrateList('inquiries', INQUIRY_SEED)
    const inquiry = clientInquiries.find((i) => i.id === id)
    if (!inquiry) throw new Error('Inquiry not found')

    const now = new Date().toISOString()
    const ticketId = `tkt-${Math.floor(1000 + Math.random() * 9000)}`
    const ticket = {
      id: ticketId,
      subject: inquiry.subject,
      category: inquiry.category || 'Other',
      priority: 'Normal',
      status: 'Open',
      assignedTo: null,
      waitingOn: 'Support',
      waitingTimeMinutes: 0,
      createdAt: now,
      updatedAt: now,
      lastActivityAt: now,
      client: {
        id: inquiry.clientId,
        name: inquiry.client,
        email: inquiry.email,
        phone: inquiry.phone,
        programme: 'Personal Wellness Programme',
        previousTicketCount: 0,
      },
      relatedService: { name: 'Inquiry conversion', type: 'General', title: 'Inquiry conversion' },
      messages: [
        {
          id: 'msg-1',
          author: inquiry.client,
          role: 'client',
          at: now,
          body: inquiry.message,
          attachments: [],
        },
      ],
      activityTimeline: [
        { id: `act-${Date.now()}`, text: `Converted from inquiry ${inquiry.id}`, at: 'Just now' },
      ],
      escalation: null,
      resolution: null,
    }

    const { supportTickets: cxTickets } = await import('../../tickets/data/supportTicketsData')
    cxTickets.unshift(ticket)
    persistList('tickets', cxTickets)

    inquiry.status = 'Converted'
    persistInquiries()

    pushSupportNotification({
      type: 'tickets',
      title: `Inquiry converted to ${ticketId}`,
      message: `${inquiry.client}: "${inquiry.subject}"`,
      link: `/support/tickets/${ticketId}`,
    })

    return { ticketId, inquiry: structuredClone(inquiry), ticket: structuredClone(ticket) }
  }
  const data = await apiRequest(`/api/support/inquiries/${id}/convert`, { method: 'POST' })
  // Backend may return ticket summary; normalize for UI
  if (data?.ticketId) return data
  return {
    ticketId: data?.id,
    inquiry: data?.inquiry || { id, status: 'Converted' },
    ticket: data,
  }
}

/** Client-facing: raise a general inquiry that appears in CX inquiries list */
export async function createClientInquiry(payload) {
  if (shouldUseMockData()) {
    await delay(500)
    const profile = getMockClientProfile()
    const now = new Date().toISOString()
    const created = {
      id: `INQ-${Math.floor(100 + Math.random() * 900)}`,
      client: profile.name,
      clientId: profile.clientId,
      email: profile.email,
      phone: profile.phone,
      subject: payload.subject,
      category: payload.category || 'Other',
      receivedAt: now,
      status: 'New',
      assignedTo: null,
      message: payload.message || payload.description || '',
      responses: [],
    }
    clientInquiries = hydrateList('inquiries', INQUIRY_SEED)
    clientInquiries.unshift(created)
    persistInquiries()
    pushSupportNotification({
      type: 'tickets',
      title: `New client inquiry ${created.id}`,
      message: `${profile.name}: "${created.subject}"`,
      link: '/support/inquiries',
    })
    return structuredClone(created)
  }
  return apiRequest('/api/client/inquiries', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}
