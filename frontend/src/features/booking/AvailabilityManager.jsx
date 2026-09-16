import { useEffect, useMemo, useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import PageHeader from '../../components/ui/PageHeader'
import SectionCard from '../../components/ui/SectionCard'
import Select from '../../components/ui/Select'
import Toast from '../../components/ui/Toast'
import { defaultWeeklyHours, formatMinutesToLabel, parseTimeToMinutes } from './bookingEngine'
import {
  BOOKABLE_PROFESSIONALS,
  addAvailabilityBlock,
  getAvailabilityProfile,
  removeAvailabilityBlock,
  saveWeeklyHours,
} from './bookingStore'
import { apiRequest, USE_MOCK } from '../../api/client'

const DAY_LABELS = [
  { value: '0', label: 'Sunday' },
  { value: '1', label: 'Monday' },
  { value: '2', label: 'Tuesday' },
  { value: '3', label: 'Wednesday' },
  { value: '4', label: 'Thursday' },
  { value: '5', label: 'Friday' },
  { value: '6', label: 'Saturday' },
]

async function fetchProfile(professionalId) {
  if (USE_MOCK) {
    return getAvailabilityProfile(professionalId)
  }
  return apiRequest(`/api/staff/availability?professionalId=${encodeURIComponent(professionalId)}`)
}

async function persistWeekly(professionalId, weeklyHours) {
  if (USE_MOCK) return saveWeeklyHours(professionalId, weeklyHours)
  return apiRequest('/api/staff/availability/hours', {
    method: 'PUT',
    body: JSON.stringify({ professionalId, weeklyHours }),
  })
}

async function persistBlock(block) {
  if (USE_MOCK) return addAvailabilityBlock(block)
  return apiRequest('/api/staff/availability/blocks', {
    method: 'POST',
    body: JSON.stringify(block),
  })
}

async function deleteBlock(id) {
  if (USE_MOCK) return removeAvailabilityBlock(id)
  return apiRequest(`/api/staff/availability/blocks/${id}`, { method: 'DELETE' })
}

export default function AvailabilityManager({
  professionalId: forcedId,
  title = 'My Availability',
  description = 'Set the hours you accept bookings, and block times when you are unavailable.',
  allowProfessionalPick = false,
}) {
  const pickOptions = useMemo(
    () =>
      BOOKABLE_PROFESSIONALS.map((p) => ({
        value: p.id,
        label: `${p.name} · ${p.role}`,
      })),
    [],
  )

  const [professionalId, setProfessionalId] = useState(
    forcedId || pickOptions[0]?.value || 'coach-daniel',
  )
  const [weeklyHours, setWeeklyHours] = useState(defaultWeeklyHours())
  const [blocks, setBlocks] = useState([])
  const [toast, setToast] = useState('')
  const [blockForm, setBlockForm] = useState({
    date: '',
    start: '2:00 PM',
    end: '3:00 PM',
    reason: 'Unavailable',
  })

  useEffect(() => {
    if (forcedId) setProfessionalId(forcedId)
  }, [forcedId])

  useEffect(() => {
    let cancelled = false
    fetchProfile(professionalId).then((profile) => {
      if (cancelled) return
      setWeeklyHours(profile.weeklyHours || defaultWeeklyHours())
      setBlocks(profile.blocks || [])
    })
    return () => {
      cancelled = true
    }
  }, [professionalId])

  function updateDayHours(day, field, value) {
    setWeeklyHours((prev) => {
      const current = prev[day]?.[0] || { start: '9:00 AM', end: '5:00 PM' }
      const nextDay = [{ ...current, [field]: value }]
      return { ...prev, [day]: nextDay }
    })
  }

  function toggleClosed(day) {
    setWeeklyHours((prev) => {
      const closed = !prev[day]?.length
      return {
        ...prev,
        [day]: closed ? [{ start: '9:00 AM', end: '5:00 PM' }] : [],
      }
    })
  }

  async function handleSaveHours() {
    await persistWeekly(professionalId, weeklyHours)
    setToast('Availability hours saved. Booking slots update automatically.')
  }

  async function handleAddBlock() {
    const start = parseTimeToMinutes(blockForm.start)
    const end = parseTimeToMinutes(blockForm.end)
    if (!blockForm.date || start == null || end == null || end <= start) {
      setToast('Enter a valid date and time range.')
      return
    }
    const created = await persistBlock({
      professionalId,
      date: blockForm.date,
      start: blockForm.start,
      end: blockForm.end,
      reason: blockForm.reason || 'Unavailable',
    })
    setBlocks((prev) => [...prev, created])
    setToast(`Blocked ${formatMinutesToLabel(start)}–${formatMinutesToLabel(end)} on ${blockForm.date}.`)
  }

  async function handleRemoveBlock(id) {
    await deleteBlock(id)
    setBlocks((prev) => prev.filter((b) => b.id !== id))
    setToast('Unavailable block removed.')
  }

  return (
    <div>
      <PageHeader title={title} description={description} />

      {allowProfessionalPick ? (
        <SectionCard className="mb-4">
          <Select
            label="Staff member"
            value={professionalId}
            onChange={(e) => setProfessionalId(e.target.value)}
            options={pickOptions}
          />
        </SectionCard>
      ) : null}

      <SectionCard className="mb-4">
        <h3 className="mb-4 font-display text-base font-semibold text-[var(--bf-ink)]">
          Weekly working hours
        </h3>
        <div className="space-y-3">
          {DAY_LABELS.map((day) => {
            const open = Boolean(weeklyHours[day.value]?.length)
            const hours = weeklyHours[day.value]?.[0] || { start: '9:00 AM', end: '5:00 PM' }
            return (
              <div
                key={day.value}
                className="grid gap-3 rounded-2xl border border-[var(--bf-border)] bg-[var(--bf-surface)] px-4 py-3 md:grid-cols-[140px_1fr_1fr_auto]"
              >
                <label className="flex items-center gap-2 text-sm font-semibold text-[var(--bf-ink)]">
                  <input
                    type="checkbox"
                    className="bf-checkbox"
                    checked={open}
                    onChange={() => toggleClosed(day.value)}
                  />
                  {day.label}
                </label>
                <Input
                  label="From"
                  value={hours.start}
                  disabled={!open}
                  onChange={(e) => updateDayHours(day.value, 'start', e.target.value)}
                  placeholder="9:00 AM"
                />
                <Input
                  label="To"
                  value={hours.end}
                  disabled={!open}
                  onChange={(e) => updateDayHours(day.value, 'end', e.target.value)}
                  placeholder="5:00 PM"
                />
                <div className="flex items-end text-xs text-[var(--bf-muted)]">
                  {open ? 'Bookable' : 'Closed'}
                </div>
              </div>
            )
          })}
        </div>
        <div className="mt-4">
          <Button onClick={handleSaveHours} className="!bg-[var(--bf-primary)] !text-white">
            Save hours
          </Button>
        </div>
      </SectionCard>

      <SectionCard>
        <h3 className="mb-1 font-display text-base font-semibold text-[var(--bf-ink)]">
          Unavailable blocks
        </h3>
        <p className="mb-4 text-sm text-[var(--bf-muted)]">
          Example: block 2:00 PM–3:00 PM on a specific day. Clients will see that window as
          unavailable and cannot book over it.
        </p>

        <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Input
            label="Date"
            type="date"
            value={blockForm.date}
            onChange={(e) => setBlockForm((f) => ({ ...f, date: e.target.value }))}
          />
          <Input
            label="From"
            value={blockForm.start}
            onChange={(e) => setBlockForm((f) => ({ ...f, start: e.target.value }))}
            placeholder="2:00 PM"
          />
          <Input
            label="To"
            value={blockForm.end}
            onChange={(e) => setBlockForm((f) => ({ ...f, end: e.target.value }))}
            placeholder="3:00 PM"
          />
          <Input
            label="Reason"
            value={blockForm.reason}
            onChange={(e) => setBlockForm((f) => ({ ...f, reason: e.target.value }))}
          />
        </div>

        <Button onClick={handleAddBlock} className="mb-6 !bg-[var(--bf-primary)] !text-white">
          <Plus className="h-4 w-4" />
          Add unavailable block
        </Button>

        <div className="space-y-2">
          {blocks.length === 0 ? (
            <p className="text-sm text-[var(--bf-muted)]">No unavailable blocks yet.</p>
          ) : (
            blocks.map((block) => (
              <div
                key={block.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[var(--bf-border)] px-4 py-3"
              >
                <div>
                  <p className="text-sm font-semibold text-[var(--bf-ink)]">
                    {block.date} · {block.start || block.startTime}–{block.end || block.endTime}
                  </p>
                  <p className="text-xs text-[var(--bf-muted)]">{block.reason}</p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => handleRemoveBlock(block.id)}
                  className="!border-[var(--bf-border)] !text-[var(--bf-muted)]"
                >
                  <Trash2 className="h-4 w-4" />
                  Remove
                </Button>
              </div>
            ))
          )}
        </div>
      </SectionCard>

      <Toast open={Boolean(toast)} message={toast} onClose={() => setToast('')} />
    </div>
  )
}
