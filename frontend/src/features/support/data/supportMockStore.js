/**
 * Shared durable mock store for support tickets, client tickets,
 * CX notifications, and inquiries. Survives refresh and role switches.
 */
const STORAGE_KEY = 'biofit.support.mock.v2'
export const SUPPORT_MOCK_EVENT = 'biofit:support-mock-updated'

const CATEGORY_MAP = {
  Appointments: 'Appointment Support',
  Appointment: 'Appointment Support',
  Nutrition: 'Nutrition Support',
  Fitness: 'Fitness Support',
  Health: 'Health Check-up Support',
  Technical: 'Account Support',
  Account: 'Account Support',
  Programme: 'Programme Questions',
  General: 'Other',
  Other: 'Other',
}

export function mapClientCategoryToCx(category) {
  if (!category) return 'Other'
  if (Object.values(CATEGORY_MAP).includes(category)) return category
  return CATEGORY_MAP[category] || 'Other'
}

function canUseStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
}

export function readSupportMockStore() {
  if (!canUseStorage()) return {}
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw)
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

export function writeSupportMockStore(patch) {
  if (!canUseStorage()) return readSupportMockStore()
  const next = {
    ...readSupportMockStore(),
    ...patch,
    updatedAt: new Date().toISOString(),
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  window.dispatchEvent(new CustomEvent(SUPPORT_MOCK_EVENT, { detail: next }))
  return next
}

/**
 * First visit: seed becomes store.
 * Later visits: store is source of truth (includes client-created rows).
 */
export function hydrateList(key, seed) {
  const store = readSupportMockStore()
  const stored = store[key]
  if (!Array.isArray(stored)) {
    writeSupportMockStore({ [key]: structuredClone(seed) })
    return seed.map((item) => structuredClone(item))
  }
  return stored.map((item) => structuredClone(item))
}

export function persistList(key, list) {
  writeSupportMockStore({ [key]: structuredClone(list) })
}

export function upsertIntoList(key, item, seedFallback = []) {
  const list = hydrateList(key, seedFallback)
  const idx = list.findIndex((row) => row.id === item.id)
  if (idx >= 0) list[idx] = structuredClone(item)
  else list.unshift(structuredClone(item))
  persistList(key, list)
  return structuredClone(item)
}

export function getMockClientProfile() {
  try {
    const token = window.localStorage.getItem('biofit.accessToken') || ''
    const id = Number(String(token).replace('mock-access-', '')) || 1
    return {
      id,
      clientId: `BF-C${id}`,
      name: id === 1 ? 'Alex Morgan' : `Client ${id}`,
      email: id === 1 ? 'client@biofit.demo' : `client${id}@biofit.demo`,
      phone: '+94 77 100 2001',
      programme: 'Personal Wellness Programme',
    }
  } catch {
    return {
      id: 1,
      clientId: 'BF-C1',
      name: 'Alex Morgan',
      email: 'client@biofit.demo',
      phone: '+94 77 100 2001',
      programme: 'Personal Wellness Programme',
    }
  }
}

export function toCxTicketShape(clientTicket, profile = getMockClientProfile()) {
  const now = clientTicket.updatedAt || clientTicket.createdAt || new Date().toISOString()
  return {
    id: clientTicket.id,
    subject: clientTicket.subject,
    category: mapClientCategoryToCx(clientTicket.category),
    priority: clientTicket.priority === 'Medium' ? 'Normal' : clientTicket.priority || 'Normal',
    status:
      clientTicket.status === 'Pending Reply'
        ? 'Pending Client Reply'
        : clientTicket.status === 'Closed'
          ? 'Closed'
          : clientTicket.status || 'Open',
    assignedTo: clientTicket.assignedTo || null,
    waitingOn: clientTicket.waitingOn || 'Support',
    waitingTimeMinutes: 0,
    createdAt: clientTicket.createdAt || now,
    updatedAt: now,
    lastActivityAt: now,
    client: {
      id: profile.clientId,
      name: profile.name,
      email: profile.email,
      phone: profile.phone,
      programme: profile.programme,
      previousTicketCount: 0,
    },
    relatedService: {
      name:
        typeof clientTicket.relatedService === 'object'
          ? clientTicket.relatedService?.name || 'General'
          : clientTicket.relatedService || 'General',
      type: 'General',
      title:
        typeof clientTicket.relatedService === 'object'
          ? clientTicket.relatedService?.name || 'General'
          : clientTicket.relatedService || 'General',
    },
    messages: (clientTicket.messages || []).map((m) => ({
      id: m.id,
      author: m.author === 'You' ? profile.name : m.author,
      role: m.role === 'client' || m.from === 'client' ? 'client' : m.role || 'support',
      at: m.at,
      body: m.body,
      attachments: m.attachments || [],
    })),
    activityTimeline: clientTicket.activityTimeline || [
      {
        id: `act-${Date.now()}`,
        text: `Ticket created by ${profile.name} via Client Portal`,
        at: 'Just now',
      },
      {
        id: `act-${Date.now() + 1}`,
        text: 'Entered Support Queue',
        at: 'Just now',
      },
    ],
    escalation: clientTicket.escalation || null,
    resolution: clientTicket.resolution || null,
  }
}

export function subscribeSupportMock(handler) {
  if (!canUseStorage()) return () => {}
  const onCustom = () => handler()
  const onStorage = (event) => {
    if (event.key === STORAGE_KEY) handler()
  }
  const onFocus = () => handler()
  window.addEventListener(SUPPORT_MOCK_EVENT, onCustom)
  window.addEventListener('storage', onStorage)
  window.addEventListener('focus', onFocus)
  return () => {
    window.removeEventListener(SUPPORT_MOCK_EVENT, onCustom)
    window.removeEventListener('storage', onStorage)
    window.removeEventListener('focus', onFocus)
  }
}
