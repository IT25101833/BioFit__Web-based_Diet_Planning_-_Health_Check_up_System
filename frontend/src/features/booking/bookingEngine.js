/** Parse "9:00 AM" / "14:30" / "2:30 PM" into minutes from midnight. */
export function parseTimeToMinutes(label) {
  if (!label || typeof label !== 'string') return null
  const trimmed = label.trim()
  const ampm = trimmed.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i)
  if (ampm) {
    let hours = Number(ampm[1])
    const minutes = Number(ampm[2])
    const period = ampm[3].toUpperCase()
    if (period === 'AM' && hours === 12) hours = 0
    if (period === 'PM' && hours !== 12) hours += 12
    return hours * 60 + minutes
  }
  const h24 = trimmed.match(/^(\d{1,2}):(\d{2})$/)
  if (h24) return Number(h24[1]) * 60 + Number(h24[2])
  return null
}

export function formatMinutesToLabel(totalMinutes) {
  const mins = ((totalMinutes % (24 * 60)) + 24 * 60) % (24 * 60)
  let hours = Math.floor(mins / 60)
  const minutes = mins % 60
  const period = hours >= 12 ? 'PM' : 'AM'
  hours = hours % 12
  if (hours === 0) hours = 12
  return `${hours}:${String(minutes).padStart(2, '0')} ${period}`
}

export function parseDurationMinutes(duration) {
  if (typeof duration === 'number' && Number.isFinite(duration)) return duration
  if (!duration) return 45
  const match = String(duration).match(/(\d+)/)
  return match ? Number(match[1]) : 45
}

export function rangesOverlap(aStart, aEnd, bStart, bEnd) {
  return aStart < bEnd && bStart < aEnd
}

/**
 * Build available slots from working hours, blocked windows, and existing bookings.
 * @returns {{ availableSlots, unavailableWindows, workingHours, freeRanges }}
 */
export function computeDayAvailability({
  dateIso,
  weeklyHours,
  blocks = [],
  bookings = [],
  durationMinutes = 45,
  slotStepMinutes = 30,
}) {
  const day = new Date(`${dateIso}T12:00:00`)
  const dayOfWeek = day.getDay() // 0 Sun … 6 Sat
  const dayHours = weeklyHours?.[dayOfWeek] || weeklyHours?.[String(dayOfWeek)] || []

  if (!dayHours.length) {
    return {
      availableSlots: [],
      unavailableWindows: [{ start: '12:00 AM', end: '11:59 PM', reason: 'Closed' }],
      workingHours: null,
      freeRanges: [],
      message: 'This person is not available on this day.',
    }
  }

  const working = dayHours.map((w) => ({
    start: parseTimeToMinutes(w.start),
    end: parseTimeToMinutes(w.end),
  }))

  const dayBlocks = blocks
    .filter((b) => b.date === dateIso)
    .map((b) => ({
      start: parseTimeToMinutes(b.start || b.startTime),
      end: parseTimeToMinutes(b.end || b.endTime),
      reason: b.reason || 'Unavailable',
    }))
    .filter((b) => b.start != null && b.end != null)

  const dayBookings = bookings
    .filter((b) => b.date === dateIso && String(b.status || 'Upcoming').toLowerCase() !== 'cancelled')
    .map((b) => {
      const start = parseTimeToMinutes(b.time || b.startTime)
      const dur = parseDurationMinutes(b.duration)
      return start == null ? null : { start, end: start + dur, reason: 'Booked' }
    })
    .filter(Boolean)

  const occupied = [...dayBlocks, ...dayBookings]

  // Free ranges = working windows minus occupied
  let free = working.map((w) => ({ ...w }))
  for (const occ of occupied) {
    const next = []
    for (const seg of free) {
      if (!rangesOverlap(seg.start, seg.end, occ.start, occ.end)) {
        next.push(seg)
        continue
      }
      if (occ.start > seg.start) next.push({ start: seg.start, end: Math.min(occ.start, seg.end) })
      if (occ.end < seg.end) next.push({ start: Math.max(occ.end, seg.start), end: seg.end })
    }
    free = next.filter((s) => s.end - s.start >= durationMinutes)
  }

  const availableSlots = []
  for (const seg of free) {
    for (let t = seg.start; t + durationMinutes <= seg.end; t += slotStepMinutes) {
      availableSlots.push(formatMinutesToLabel(t))
    }
  }

  const unavailableWindows = occupied
    .sort((a, b) => a.start - b.start)
    .map((o) => ({
      start: formatMinutesToLabel(o.start),
      end: formatMinutesToLabel(o.end),
      reason: o.reason,
    }))

  const workStart = Math.min(...working.map((w) => w.start))
  const workEnd = Math.max(...working.map((w) => w.end))

  return {
    availableSlots,
    unavailableWindows,
    workingHours: {
      start: formatMinutesToLabel(workStart),
      end: formatMinutesToLabel(workEnd),
    },
    freeRanges: free.map((f) => ({
      start: formatMinutesToLabel(f.start),
      end: formatMinutesToLabel(f.end),
    })),
    message: availableSlots.length
      ? null
      : 'No open slots on this day. Try another date.',
  }
}

export function validateBookingSlot({
  dateIso,
  timeLabel,
  durationMinutes,
  weeklyHours,
  blocks,
  bookings,
}) {
  const start = parseTimeToMinutes(timeLabel)
  if (start == null) {
    return { ok: false, message: 'Please choose a valid time.' }
  }
  const end = start + durationMinutes
  const day = computeDayAvailability({
    dateIso,
    weeklyHours,
    blocks,
    bookings,
    durationMinutes,
  })

  if (!day.workingHours) {
    return { ok: false, message: 'This person is not available on this day.' }
  }

  for (const block of day.unavailableWindows) {
    const bStart = parseTimeToMinutes(block.start)
    const bEnd = parseTimeToMinutes(block.end)
    if (bStart != null && bEnd != null && rangesOverlap(start, end, bStart, bEnd)) {
      if (block.reason === 'Booked') {
        return {
          ok: false,
          message: `This slot is already booked (${block.start}–${block.end}). Please try another time.`,
        }
      }
      return {
        ok: false,
        message: `Not available from ${block.start} to ${block.end}. Please choose another time.`,
      }
    }
  }

  const fits = day.freeRanges.some((r) => {
    const rStart = parseTimeToMinutes(r.start)
    const rEnd = parseTimeToMinutes(r.end)
    return rStart != null && rEnd != null && start >= rStart && end <= rEnd
  })

  if (!fits) {
    return {
      ok: false,
      message: `That time is outside available hours (${day.workingHours.start}–${day.workingHours.end}).`,
    }
  }

  return { ok: true }
}

export function buildUpcomingDates(days = 21, { skipSundays = true } = {}) {
  const dates = []
  const today = localTodayIso()
  const start = parseLocalIsoDate(today)
  for (let i = 0; i < days; i += 1) {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    if (skipSundays && d.getDay() === 0) continue
    dates.push(toLocalIsoDate(d))
  }
  return dates
}

/** Local calendar date as YYYY-MM-DD (avoids UTC off-by-one). */
export function toLocalIsoDate(date = new Date()) {
  const d = date instanceof Date ? date : new Date(date)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function localTodayIso() {
  return toLocalIsoDate(new Date())
}

export function parseLocalIsoDate(iso) {
  if (!iso) return null
  const [y, m, d] = String(iso).slice(0, 10).split('-').map(Number)
  if (!y || !m || !d) return null
  return new Date(y, m - 1, d, 12, 0, 0, 0)
}

export function isDateBeforeToday(iso, todayIso = localTodayIso()) {
  if (!iso) return false
  return String(iso).slice(0, 10) < String(todayIso).slice(0, 10)
}

export function isDateTodayOrFuture(iso, todayIso = localTodayIso()) {
  if (!iso) return false
  return String(iso).slice(0, 10) >= String(todayIso).slice(0, 10)
}

export const PAST_DATE_MESSAGE =
  'Please select today or a future date. Past dates are not allowed.'

/** Drop already-passed start times when the selected day is today. */
export function filterAvailableSlotsForDate(slots, dateIso, now = new Date()) {
  const list = Array.isArray(slots) ? slots : []
  if (!dateIso || dateIso !== toLocalIsoDate(now)) return list
  const nowMinutes = now.getHours() * 60 + now.getMinutes()
  return list.filter((slot) => {
    const mins = parseTimeToMinutes(slot)
    return mins != null && mins > nowMinutes
  })
}

/** Default Mon–Sat 09:00–17:00 */
export function defaultWeeklyHours(start = '9:00 AM', end = '5:00 PM') {
  const hours = {}
  for (let d = 1; d <= 6; d += 1) {
    hours[d] = [{ start, end }]
  }
  hours[0] = []
  return hours
}
