import { apiRequest, USE_MOCK } from '../../../../api/client'
export const supportTickets = [
  {
    id: 'tkt-1042',
    subject: 'Reschedule nutrition consultation',
    category: 'Appointments',
    status: 'Open',
    relatedService: 'Nutrition Consultation',
    createdAt: '2026-09-07T09:20:00',
    updatedAt: '2026-09-07T09:20:00',
    messages: [
      {
        id: 'm1',
        author: 'You',
        role: 'client',
        at: '2026-09-07T09:20:00',
        body: 'I would like to move my nutrition consultation to a later afternoon slot if possible.',
      },
    ],
  },
  {
    id: 'tkt-1031',
    subject: 'Meal plan preference update',
    category: 'Nutrition',
    status: 'In Progress',
    relatedService: 'Meal Plan',
    createdAt: '2026-09-03T14:10:00',
    updatedAt: '2026-09-05T11:00:00',
    messages: [
      {
        id: 'm1',
        author: 'You',
        role: 'client',
        at: '2026-09-03T14:10:00',
        body: 'Could breakfast options lean warmer during the week?',
      },
      {
        id: 'm2',
        author: 'Support Team',
        role: 'support',
        at: '2026-09-04T10:15:00',
        body: 'Thanks for sharing. We have forwarded this preference to your nutrition consultant.',
      },
      {
        id: 'm3',
        author: 'Support Team',
        role: 'support',
        at: '2026-09-05T11:00:00',
        body: 'Your consultant has acknowledged the request and will reflect it in the next plan update.',
      },
    ],
  },
  {
    id: 'tkt-1018',
    subject: 'App notification timing',
    category: 'Technical',
    status: 'Pending Reply',
    relatedService: 'General',
    createdAt: '2026-08-28T16:40:00',
    updatedAt: '2026-08-29T09:05:00',
    messages: [
      {
        id: 'm1',
        author: 'You',
        role: 'client',
        at: '2026-08-28T16:40:00',
        body: 'Reminders are arriving later than expected on my phone.',
      },
      {
        id: 'm2',
        author: 'Support Team',
        role: 'support',
        at: '2026-08-29T09:05:00',
        body: 'Could you confirm which device and browser you are using?',
      },
    ],
  },
  {
    id: 'tkt-1002',
    subject: 'Welcome pack clarification',
    category: 'General',
    status: 'Resolved',
    relatedService: 'Programme',
    createdAt: '2026-08-14T11:00:00',
    updatedAt: '2026-08-15T13:20:00',
    messages: [
      {
        id: 'm1',
        author: 'You',
        role: 'client',
        at: '2026-08-14T11:00:00',
        body: 'Where can I find the welcome materials for my programme?',
      },
      {
        id: 'm2',
        author: 'Support Team',
        role: 'support',
        at: '2026-08-15T13:20:00',
        body: 'You can find them under My Programmes → View Programme. Closing this ticket as resolved.',
      },
    ],
  },
]

export const supportCategories = [
  { value: 'Appointments', label: 'Appointments' },
  { value: 'Nutrition', label: 'Nutrition' },
  { value: 'Fitness', label: 'Fitness' },
  { value: 'Health', label: 'Health' },
  { value: 'Technical', label: 'Technical' },
  { value: 'General', label: 'General' },
]

export const relatedServices = [
  { value: '', label: 'None' },
  { value: 'Programme', label: 'Programme' },
  { value: 'Appointment', label: 'Appointment' },
  { value: 'Meal Plan', label: 'Meal Plan' },
  { value: 'Workout Plan', label: 'Workout Plan' },
  { value: 'General', label: 'General' },
]

function delay(ms = 420) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/** GET /api/client/support */
export async function fetchClientSupportTickets() {
  if (USE_MOCK) {
    await delay()
    return supportTickets.map((item) => ({
      ...item,
      messages: item.messages.map((m) => ({ ...m })),
    }))
  }
  return apiRequest('/api/client/support')
}

/** GET /api/client/support/:id */
export async function fetchClientSupportTicketById(id) {
  if (USE_MOCK) {
    await delay()
    const found = supportTickets.find((item) => item.id === id)
    if (!found) throw new Error('Ticket not found')
    return {
      ...found,
      messages: found.messages.map((m) => ({ ...m })),
    }
  }
  return apiRequest(`/api/client/support/${id}`)
}

/** POST /api/client/support */
export async function createClientSupportTicket(payload) {
  if (USE_MOCK) {
    await delay(600)
    return {
      id: `tkt-${Math.floor(1000 + Math.random() * 9000)}`,
      status: 'Open',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: [
        {
          id: 'm1',
          author: 'You',
          role: 'client',
          at: new Date().toISOString(),
          body: payload.description,
        },
      ],
      ...payload,
    }
  }
  return apiRequest('/api/client/support', { method: 'POST', body: JSON.stringify(payload) })
}

/** POST /api/client/support/:id/replies */
export async function replyToClientSupportTicket(id, body) {
  if (USE_MOCK) {
    await delay(450)
    return {
      id: `m-${Date.now()}`,
      author: 'You',
      role: 'client',
      at: new Date().toISOString(),
      body,
    }
  }
  return apiRequest(`/api/client/support/${id}/replies`, { method: 'POST', body: JSON.stringify({ message: body }) })
}
