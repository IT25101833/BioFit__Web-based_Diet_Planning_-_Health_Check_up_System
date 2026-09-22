/**
 * Helpers for Medical Advisor in-portal navigation (existing App.jsx routes only).
 */

export function indexHealthRecordsByClient(records = []) {
  const map = {}
  for (const record of records) {
    if (!record?.id) continue
    if (record.userId != null) map[String(record.userId)] = record.id
    if (record.clientId) map[String(record.clientId)] = record.id
    const digits = String(record.clientId || '').replace(/\D+/g, '')
    if (digits) map[digits] = record.id
  }
  return map
}

/** Path to an existing record, or create page with clientUserId when missing. */
export function healthRecordHref(recordIndex, { userId, clientId } = {}) {
  const keys = [userId, clientId, clientId ? String(clientId).replace(/\D+/g, '') : null]
    .filter((v) => v != null && String(v).trim() !== '')
    .map(String)
  for (const key of keys) {
    if (recordIndex[key]) return `/medical/health-records/${recordIndex[key]}`
  }
  if (userId != null && String(userId).trim() !== '') {
    return `/medical/health-records/create?clientUserId=${encodeURIComponent(String(userId))}`
  }
  return '/medical/health-records'
}

export function reviewItemHref(item) {
  if (item?.actionTo === 'assessment' && item.actionId) {
    return `/medical/assessments/${item.actionId}`
  }
  if (item?.actionTo === 'alert' && item.actionId) {
    return `/medical/health-alerts/${item.actionId}`
  }
  return null
}

export function readClientUserIdParam(searchParams) {
  return (
    searchParams.get('clientUserId') ||
    searchParams.get('client') ||
    ''
  ).trim()
}

export function findClientOption(clients, clientUserId) {
  if (clientUserId == null || clientUserId === '') return null
  const key = String(clientUserId)
  return (
    clients.find(
      (c) =>
        String(c.userId) === key ||
        String(c.id) === key ||
        String(c.value) === key ||
        String(c.clientId) === key ||
        String(c.clientId) === `BF-C${key}`,
    ) || null
  )
}

export function isPendingAssessmentStatus(status) {
  const s = String(status || '')
  return (
    /pending/i.test(s) ||
    /follow/i.test(s) ||
    (s && !/^completed$/i.test(s) && !/^reviewed$/i.test(s))
  )
}

/** Only follow notification links that look like medical portal routes. */
export function safeMedicalNotificationLink(link) {
  if (!link || typeof link !== 'string') return null
  const path = link.startsWith('http') ? null : link
  if (!path || !path.startsWith('/medical/')) return null
  return path
}
