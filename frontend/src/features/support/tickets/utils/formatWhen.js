export function formatWhen(value, { style = 'datetime' } = {}) {
  if (!value) return '—'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value

  if (style === 'time') {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  if (style === 'date') {
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  return date.toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}
