import { useEffect, useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import PageHeader from '../../components/ui/PageHeader'
import SectionCard from '../../components/ui/SectionCard'
import Select from '../../components/ui/Select'
import Toast from '../../components/ui/Toast'
import { defaultWeeklyHours, formatMinutesToLabel, parseTimeToMinutes } from './bookingEngine'
import { apiRequest } from '../../api/client'
import { fetchBookingCatalog } from '../client/appointments/data/appointmentData'

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
  return apiRequest(`/api/staff/availability?professionalId=${encodeURIComponent(professionalId)}`)
}

async function persistWeekly(professionalId, weeklyHours) {
  return apiRequest('/api/staff/availability/hours', {
    method: 'PUT',
    body: JSON.stringify({ professionalId, weeklyHours }),
  })
}

async function persistBlock(block) {
  return apiRequest('/api/staff/availability/blocks', {
    method: 'POST',
    body: JSON.stringify(block),
  })
}

async function deleteBlock(id) {
  return apiRequest(`/api/staff/availability/blocks/${id}`, { method: 'DELETE' })
}

export default function AvailabilityManager({
  professionalId: forcedId,
  title = 'My Availability',
  description = 'Set the hours you accept bookings, and block times when you are unavailable.',
  allowProfessionalPick = false,
}) {
  const [pickOptions, setPickOptions] = useState([])
  const [professionalId, setProfessionalId] = useState(forcedId || '')
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
    if (forcedId) {
      setProfessionalId(forcedId)
      return
    }
    let cancelled = false
    fetchBookingCatalog('STAFF')
      .then((catalog) => {
        if (cancelled) return
        const pros = Array.isArray(catalog?.professionals) ? catalog.professionals : []
        const options = pros.map((p) => ({
          value: p.id || p.professionalId || (p.userId != null ? `user-${p.userId}` : ''),
          label: `${p.name || 'Staff'}${p.role ? ` · ${p.role}` : ''}`,
        })).filter((o) => o.value)
        setPickOptions(options)
        setProfessionalId((prev) => prev || options[0]?.value || '')
      })
      .catch(() => {
        if (!cancelled) setPickOptions([])
      })
    return () => {
      cancelled = true
    }
  }, [forcedId])

  useEffect(() => {
    if (!professionalId) return undefined
    let cancelled = false
    fetchProfile(professionalId)
      .then((profile) => {
        if (cancelled) return
        setWeeklyHours(profile.weeklyHours || defaultWeeklyHours())
        setBlocks(profile.blocks || [])
      })
      .catch(() => {
        if (!cancelled) {
          setWeeklyHours(defaultWeeklyHours())
          setBlocks([])
        }
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
    if (!professionalId) {
      setToast('Select a staff member first.')
      return
    }
    await persistWeekly(professionalId, weeklyHours)
    setToast('Availability hours saved. Booking slots update automatically.')
  }

  async function handleAddBlock() {
    if (!professionalId) {
      setToast('Select a staff member first.')
      return
    }
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
            placeholder={pickOptions.length ? 'Select staff' : 'No staff found'}
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
                  {open ? 'Open' : 'Closed'}
                </div>
              </div>
            )
          })}
        </div>
        <div className="mt-4">
          <Button onClick={handleSaveHours}>Save weekly hours</Button>
        </div>
      </SectionCard>

      <SectionCard title="Unavailable blocks">
        <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Input
            label="Date"
            type="date"
            value={blockForm.date}
            onChange={(e) => setBlockForm((f) => ({ ...f, date: e.target.value }))}
          />
          <Input
            label="Start"
            value={blockForm.start}
            onChange={(e) => setBlockForm((f) => ({ ...f, start: e.target.value }))}
          />
          <Input
            label="End"
            value={blockForm.end}
            onChange={(e) => setBlockForm((f) => ({ ...f, end: e.target.value }))}
          />
          <Input
            label="Reason"
            value={blockForm.reason}
            onChange={(e) => setBlockForm((f) => ({ ...f, reason: e.target.value }))}
          />
        </div>
        <Button onClick={handleAddBlock}>
          <Plus className="h-4 w-4" />
          Add block
        </Button>
        <ul className="mt-4 space-y-2">
          {blocks.map((block) => (
            <li
              key={block.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-[var(--bf-border)] px-3 py-2 text-sm"
            >
              <span>
                {block.date} · {block.start}–{block.end}
                {block.reason ? ` · ${block.reason}` : ''}
              </span>
              <button
                type="button"
                className="text-[var(--bf-muted)] hover:text-[#b45309]"
                onClick={() => handleRemoveBlock(block.id)}
                aria-label="Remove block"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      </SectionCard>

      <Toast open={Boolean(toast)} message={toast} onClose={() => setToast('')} />
    </div>
  )
}
