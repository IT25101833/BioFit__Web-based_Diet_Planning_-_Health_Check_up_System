import { apiRequest, shouldUseMockData } from '../../../../api/client'
import {
  getMockClientProfile,
  hydrateList,
  persistList,
  toCxTicketShape,
} from '../../../support/data/supportMockStore'
import { pushSupportNotification } from '../../../support/notifications/data/supportNotificationsData'
import { pushClientNotification } from '../../notifications/data/notificationData'

const CLIENT_TICKET_SEED = [
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
    resolution: {
      resolvedBy: 'Priya Nair',
      resolvedAt: '2026-08-15T13:20:00',
      summary: 'Directed client to My Programmes → View Programme for welcome materials.',
      category: 'Information Provided',
    },
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

export let supportTickets = hydrateList('clientTickets', CLIENT_TICKET_SEED)

export const supportCategories = [
  { value: 'Appointment Support', label: 'Appointments' },
  { value: 'Nutrition Support', label: 'Nutrition' },
  { value: 'Fitness Support', label: 'Fitness' },
  { value: 'Health Check-up Support', label: 'Health' },
  { value: 'Account Support', label: 'Account / Technical' },
  { value: 'Programme Questions', label: 'Programme' },
  { value: 'Other', label: 'General' },
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

function persistClientTickets() {
  persistList('clientTickets', supportTickets)
}

function normalizeClientStatus(status) {
  if (!status) return status
  if (status === 'Pending Client Reply') return 'Pending Reply'
  if (status === 'Assigned' || status === 'Escalated') return 'In Progress'
  if (status === 'Closed') return 'Resolved'
  return status
}

function normalizeTicket(ticket) {
  if (!ticket) return ticket
  const related =
    ticket.relatedService && typeof ticket.relatedService === 'object'
      ? ticket.relatedService.name || ticket.relatedService.label || 'General'
      : ticket.relatedService || 'General'
  const messages = (ticket.messages || []).map((m) => {
    const from = String(m.from || '').toLowerCase()
    const existingRole = String(m.role || '').toLowerCase()
    const isSupportSide =
      existingRole === 'support' ||
      existingRole === 'internal' ||
      existingRole === 'internal_note' ||
      existingRole === 'specialist' ||
      from === 'support' ||
      from === 'internal' ||
      from === 'specialist'
    return {
      ...m,
      role: existingRole || (isSupportSide ? 'support' : 'client'),
      author:
        m.author ||
        (isSupportSide ? 'Support Team' : from === 'client' || !from ? 'You' : m.author || 'You'),
    }
  })
  return {
    ...ticket,
    status: normalizeClientStatus(ticket.status),
    relatedService: related,
    messages,
    resolution: ticket.resolution || null,
  }
}

async function publishTicketToCx(ticket) {
  const profile = getMockClientProfile()
  const cxTicket = toCxTicketShape(
    {
      ...ticket,
      clientId: profile.clientId,
      clientName: profile.name,
    },
    profile,
  )
  const { supportTickets: cxTickets } = await import(
    '../../../support/tickets/data/supportTicketsData'
  )
  const idx = cxTickets.findIndex((t) => t.id === cxTicket.id)
  if (idx >= 0) cxTickets[idx] = cxTicket
  else cxTickets.unshift(cxTicket)
  persistList('tickets', cxTickets)
  return cxTicket
}

/** GET /api/client/support */
export async function fetchClientSupportTickets() {
  if (shouldUseMockData()) {
    await delay()
    supportTickets = hydrateList('clientTickets', CLIENT_TICKET_SEED)
    return supportTickets.map((item) =>
      normalizeTicket({
        ...item,
        messages: (item.messages || []).map((m) => ({ ...m })),
      }),
    )
  }
  const data = await apiRequest('/api/client/support')
  return (Array.isArray(data) ? data : []).map(normalizeTicket)
}

/** GET /api/client/support/:id */
export async function fetchClientSupportTicketById(id) {
  if (shouldUseMockData()) {
    await delay()
    supportTickets = hydrateList('clientTickets', CLIENT_TICKET_SEED)
    const found = supportTickets.find((item) => item.id === id)
    if (!found) throw new Error('Ticket not found')
    return normalizeTicket({
      ...found,
      messages: (found.messages || []).map((m) => ({ ...m })),
    })
  }
  return normalizeTicket(await apiRequest(`/api/client/support/${id}`))
}

/** POST /api/client/support */
export async function createClientSupportTicket(payload) {
  if (shouldUseMockData()) {
    await delay(600)
    const profile = getMockClientProfile()
    const now = new Date().toISOString()
    const created = {
      id: `tkt-${Math.floor(1000 + Math.random() * 9000)}`,
      subject: payload.subject,
      category: payload.category,
      status: 'Open',
      priority: payload.priority || 'Medium',
      relatedService: payload.relatedService || 'General',
      createdAt: now,
      updatedAt: now,
      waitingOn: 'Support',
      clientId: profile.clientId,
      clientName: profile.name,
      messages: [
        {
          id: 'm1',
          author: 'You',
          role: 'client',
          at: now,
          body: payload.description,
        },
      ],
    }
    supportTickets = hydrateList('clientTickets', CLIENT_TICKET_SEED)
    supportTickets.unshift(created)
    persistClientTickets()
    const cxTicket = await publishTicketToCx(created)
    pushSupportNotification({
      type: 'tickets',
      title: `New support ticket ${cxTicket.id}`,
      message: `${profile.name} opened "${created.subject}".`,
      link: `/support/tickets/${cxTicket.id}`,
    })
    return normalizeTicket({
      ...created,
      messages: created.messages.map((m) => ({ ...m })),
    })
  }
  return normalizeTicket(
    await apiRequest('/api/client/support', {
      method: 'POST',
      body: JSON.stringify({
        ...payload,
        message: payload.description,
        body: payload.description,
      }),
    }),
  )
}

/** POST /api/client/support/:id/replies */
export async function replyToClientSupportTicket(id, body) {
  if (shouldUseMockData()) {
    await delay(450)
    supportTickets = hydrateList('clientTickets', CLIENT_TICKET_SEED)
    const ticket = supportTickets.find((item) => item.id === id)
    const message = {
      id: `m-${Date.now()}`,
      author: 'You',
      role: 'client',
      at: new Date().toISOString(),
      body,
    }
    if (ticket) {
      ticket.messages.push(message)
      ticket.updatedAt = message.at
      if (
        ticket.status === 'Pending Reply' ||
        ticket.status === 'Pending Client Reply' ||
        ticket.status === 'Resolved' ||
        ticket.status === 'Open'
      ) {
        ticket.status = 'In Progress'
      }
      ticket.waitingOn = 'Support'
      persistClientTickets()
      await publishTicketToCx(ticket)
      pushSupportNotification({
        type: 'tickets',
        title: `Client replied on ${ticket.id}`,
        message: `Follow-up received on "${ticket.subject}".`,
        link: `/support/tickets/${ticket.id}`,
      })
      return normalizeTicket({
        ...ticket,
        messages: ticket.messages.map((m) => ({ ...m })),
      })
    }
    return normalizeTicket({ id, messages: [message], status: 'In Progress' })
  }
  return normalizeTicket(
    await apiRequest(`/api/client/support/${id}/replies`, {
      method: 'POST',
      body: JSON.stringify({ message: body }),
    }),
  )
}

/** POST /api/client/support/:id/reopen */
export async function reopenClientSupportTicket(id, message) {
  if (shouldUseMockData()) {
    await delay(450)
    supportTickets = hydrateList('clientTickets', CLIENT_TICKET_SEED)
    const ticket = supportTickets.find((item) => item.id === id)
    if (!ticket) throw new Error('Ticket not found')
    if (message?.trim()) {
      ticket.messages.push({
        id: `m-${Date.now()}`,
        author: 'You',
        role: 'client',
        at: new Date().toISOString(),
        body: message.trim(),
      })
    }
    ticket.status = 'In Progress'
    ticket.waitingOn = 'Support'
    ticket.resolution = null
    ticket.updatedAt = new Date().toISOString()
    persistClientTickets()
    await publishTicketToCx(ticket)
    pushSupportNotification({
      type: 'tickets',
      title: `Ticket reopened ${ticket.id}`,
      message: `Client asked to keep "${ticket.subject}" open.`,
      link: `/support/tickets/${ticket.id}`,
    })
    pushClientNotification({
      type: 'support',
      title: 'Ticket kept open',
      body: `Your ticket "${ticket.subject}" was sent back to support.`,
      link: `/client/support/${ticket.id}`,
    })
    return normalizeTicket({
      ...ticket,
      messages: ticket.messages.map((m) => ({ ...m })),
    })
  }
  return normalizeTicket(
    await apiRequest(`/api/client/support/${id}/reopen`, {
      method: 'POST',
      body: JSON.stringify({ message: message || '' }),
    }),
  )
}

export function canClientDeleteTicket(ticket) {
  if (!ticket) return false
  const status = String(ticket.status || '').toLowerCase()
  if (status === 'resolved' || status === 'closed') return false
  if (status !== 'open') return false
  const messages = ticket.messages || []
  return !messages.some((m) => {
    const role = String(m.role || m.from || '').toLowerCase()
    const author = String(m.author || '').toLowerCase()
    if (role === 'client' || role === 'you' || author === 'you') return false
    return (
      role === 'support' ||
      role === 'internal' ||
      role === 'internal_note' ||
      role === 'specialist'
    )
  })
}

/** DELETE /api/client/support/:id — open / mistaken tickets only */
export async function deleteClientSupportTicket(id) {
  const ticketId = encodeURIComponent(String(id || '').trim())
  if (!ticketId) {
    throw new Error('Ticket id is missing.')
  }
  if (shouldUseMockData()) {
    await delay(400)
    supportTickets = hydrateList('clientTickets', CLIENT_TICKET_SEED)
    const idx = supportTickets.findIndex((item) => item.id === id)
    if (idx < 0) throw new Error('Ticket not found')
    const ticket = supportTickets[idx]
    if (!canClientDeleteTicket(normalizeTicket(ticket))) {
      throw new Error('Only open tickets without a support reply can be deleted.')
    }
    supportTickets.splice(idx, 1)
    persistClientTickets()
    try {
      const { supportTickets: cxTickets } = await import(
        '../../../support/tickets/data/supportTicketsData'
      )
      const cxIdx = cxTickets.findIndex((t) => t.id === id)
      if (cxIdx >= 0) {
        cxTickets.splice(cxIdx, 1)
        persistList('tickets', cxTickets)
      }
    } catch {
      // optional CX bridge
    }
    return { id, deleted: true }
  }
  return apiRequest(`/api/client/support/${ticketId}`, {
    method: 'DELETE',
    headers: { Accept: 'application/json' },
  })
}
