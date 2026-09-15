import { useEffect, useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import Avatar from '../../../components/ui/Avatar'
import Button from '../../../components/ui/Button'
import ConfirmDialog from '../../../components/ui/ConfirmDialog'
import EmptyState from '../../../components/ui/EmptyState'
import ErrorState from '../../../components/ui/ErrorState'
import Input from '../../../components/ui/Input'
import LoadingSkeleton from '../../../components/ui/LoadingSkeleton'
import Modal from '../../../components/ui/Modal'
import PageHeader from '../../../components/ui/PageHeader'
import SectionCard from '../../../components/ui/SectionCard'
import Select from '../../../components/ui/Select'
import StatusBadge from '../../../components/ui/StatusBadge'
import TextArea from '../../../components/ui/TextArea'
import Toast from '../../../components/ui/Toast'
import {
  cancelStaffSchedule,
  fetchStaffSchedules,
  saveStaffSchedule,
} from './data/scheduleData'

const views = [
  { value: 'day', label: 'Day' },
  { value: 'week', label: 'Week' },
  { value: 'month', label: 'Month' },
]

function startOfWeek(date) {
  const d = new Date(date)
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diff)
  d.setHours(0, 0, 0, 0)
  return d
}

function toIso(date) {
  return date.toISOString().slice(0, 10)
}

function addDays(date, amount) {
  const d = new Date(date)
  d.setDate(d.getDate() + amount)
  return d
}

const emptyForm = {
  id: '',
  staffId: '',
  service: '',
  date: '',
  startTime: '',
  endTime: '',
  programme: '',
  client: '',
  notes: '',
  status: 'Scheduled',
}

export default function StaffScheduling() {
  const [staff, setStaff] = useState([])
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [view, setView] = useState('week')
  const [anchor, setAnchor] = useState(new Date('2026-09-09T00:00:00'))
  const [roleFilter, setRoleFilter] = useState('')
  const [staffFilter, setStaffFilter] = useState('')
  const [serviceFilter, setServiceFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [cancelId, setCancelId] = useState('')
  const [toast, setToast] = useState('')

  async function load() {
    setLoading(true)
    setError('')
    try {
      const data = await fetchStaffSchedules()
      setStaff(data.staff)
      setEvents(data.events)
    } catch {
      setError('We couldn’t load staff schedules.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const weekDays = useMemo(() => {
    const start = startOfWeek(anchor)
    return Array.from({ length: 7 }, (_, index) => addDays(start, index))
  }, [anchor])

  const visibleDates = useMemo(() => {
    if (view === 'day') return [toIso(anchor)]
    if (view === 'week') return weekDays.map(toIso)
    const monthStart = new Date(anchor.getFullYear(), anchor.getMonth(), 1)
    const days = []
    const cursor = new Date(monthStart)
    while (cursor.getMonth() === anchor.getMonth()) {
      days.push(toIso(cursor))
      cursor.setDate(cursor.getDate() + 1)
    }
    return days
  }, [view, anchor, weekDays])

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      if (!visibleDates.includes(event.date)) return false
      if (roleFilter && event.role !== roleFilter) return false
      if (staffFilter && event.staffId !== staffFilter) return false
      if (serviceFilter && event.service !== serviceFilter) return false
      if (statusFilter && event.status !== statusFilter) return false
      return true
    })
  }, [events, visibleDates, roleFilter, staffFilter, serviceFilter, statusFilter])

  function openCreate(dateIso) {
    setForm({ ...emptyForm, date: dateIso || toIso(anchor) })
    setFormOpen(true)
  }

  function openEdit(event) {
    setForm({ ...emptyForm, ...event })
    setFormOpen(true)
  }

  async function handleSave() {
    const member = staff.find((item) => item.id === form.staffId)
    await saveStaffSchedule({
      ...form,
      staffName: member?.name || form.staffName,
      role: member?.role || form.role,
    })
    setFormOpen(false)
    setToast(form.id ? 'Schedule updated.' : 'Schedule saved.')
    await load()
  }

  async function handleCancel() {
    await cancelStaffSchedule(cancelId)
    setCancelId('')
    setToast('Schedule cancelled.')
    await load()
  }

  function shift(amount) {
    if (view === 'day') setAnchor(addDays(anchor, amount))
    else if (view === 'week') setAnchor(addDays(anchor, amount * 7))
    else setAnchor(new Date(anchor.getFullYear(), anchor.getMonth() + amount, 1))
  }

  if (loading) return <LoadingSkeleton rows={5} />
  if (error) {
    return <ErrorState title="We couldn’t load staff schedules." onRetry={load} />
  }

  const rangeLabel =
    view === 'day'
      ? anchor.toLocaleDateString('en-GB', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
        })
      : view === 'week'
        ? `${weekDays[0].toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} – ${weekDays[6].toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`
        : anchor.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })

  return (
    <div>
      <PageHeader
        title="Staff Scheduling"
        description="Manage staff availability, sessions and wellness service schedules."
        actions={
          <Button
            onClick={() => openCreate()}
            className="!bg-[#005a40] !text-white hover:!bg-[#004833]"
          >
            + Add Schedule
          </Button>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Button variant="outline" onClick={() => setAnchor(new Date('2026-09-09T00:00:00'))}>
          Today
        </Button>
        <button
          type="button"
          onClick={() => shift(-1)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[#e8ecf1] bg-white"
          aria-label="Previous"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => shift(1)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[#e8ecf1] bg-white"
          aria-label="Next"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
        <p className="text-sm font-semibold text-[#111827]">{rangeLabel}</p>
        <div className="ml-auto flex gap-1 rounded-2xl border border-[#e8ecf1] bg-white p-1">
          {views.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => setView(item.value)}
              className={[
                'rounded-xl px-3 py-1.5 text-[13px] font-semibold',
                view === item.value
                  ? 'bg-[#e6f5f0] text-[#005a40]'
                  : 'text-[#6b7280] hover:bg-[#f4f6fb]',
              ].join(' ')}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          options={[
            { value: 'Fitness Coach', label: 'Fitness Coach' },
            { value: 'Nutrition Consultant', label: 'Nutrition Consultant' },
            { value: 'Medical Advisor', label: 'Medical Advisor' },
          ]}
          placeholder="Staff role"
        />
        <Select
          value={staffFilter}
          onChange={(e) => setStaffFilter(e.target.value)}
          options={staff.map((item) => ({ value: item.id, label: item.name }))}
          placeholder="Staff member"
        />
        <Select
          value={serviceFilter}
          onChange={(e) => setServiceFilter(e.target.value)}
          options={[
            { value: 'Fitness Consultation', label: 'Fitness Consultation' },
            { value: 'Nutrition Consultation', label: 'Nutrition Consultation' },
            { value: 'Health Check-up', label: 'Health Check-up' },
            { value: 'Wellness Consultation', label: 'Wellness Consultation' },
            { value: 'Fitness Session', label: 'Fitness Session' },
          ]}
          placeholder="Service type"
        />
        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          options={[
            { value: 'Scheduled', label: 'Scheduled' },
            { value: 'In Progress', label: 'In Progress' },
            { value: 'Completed', label: 'Completed' },
            { value: 'Cancelled', label: 'Cancelled' },
          ]}
          placeholder="Schedule status"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <SectionCard title="Schedule" className="lg:col-span-2">
          {filteredEvents.length === 0 ? (
            <EmptyState
              title="No staff schedules available for this period."
              description="Try another date range or add a new schedule."
              actionLabel="Add Schedule"
              onAction={() => openCreate()}
            />
          ) : (
            <div className="space-y-3">
              {filteredEvents.map((event) => (
                <button
                  key={event.id}
                  type="button"
                  onClick={() => openEdit(event)}
                  className="flex w-full flex-col gap-2 rounded-2xl border border-[#eef2f0] px-4 py-3 text-left hover:bg-[#f8faf9] sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="text-sm font-semibold text-[#111827]">
                      {event.startTime}–{event.endTime} · {event.service}
                    </p>
                    <p className="mt-1 text-[12px] text-[#6b7280]">
                      {event.date} · {event.staffName} · {event.client} · {event.programme}
                    </p>
                  </div>
                  <StatusBadge status={event.status} />
                </button>
              ))}
            </div>
          )}
        </SectionCard>

        <SectionCard title="Today’s staff">
          <ul className="space-y-2">
            {staff.map((person) => (
              <li
                key={person.id}
                className="flex items-center justify-between gap-2 rounded-xl bg-[#f8faf9] px-3 py-2.5"
              >
                <div className="flex min-w-0 items-center gap-2">
                  <Avatar name={person.name} size="sm" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-[#111827]">
                      {person.name}
                    </p>
                    <p className="truncate text-[11px] text-[#6b7280]">{person.role}</p>
                  </div>
                </div>
                <StatusBadge status={person.status} />
              </li>
            ))}
          </ul>
        </SectionCard>
      </div>

      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={form.id ? 'Edit schedule' : 'Create schedule'}
        size="lg"
        footer={
          <>
            {form.id ? (
              <Button
                onClick={() => {
                  setFormOpen(false)
                  setCancelId(form.id)
                }}
                className="mr-auto !bg-[#fff7ed] !text-[#b45309]"
              >
                Cancel Schedule
              </Button>
            ) : null}
            <Button variant="outline" onClick={() => setFormOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={!form.staffId || !form.service || !form.date || !form.startTime}
              className="!bg-[#005a40] !text-white hover:!bg-[#004833]"
            >
              Save Schedule
            </Button>
          </>
        }
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <Select
            label="Staff member"
            required
            value={form.staffId}
            onChange={(e) => setForm((prev) => ({ ...prev, staffId: e.target.value }))}
            options={staff.map((item) => ({ value: item.id, label: item.name }))}
          />
          <Select
            label="Service"
            required
            value={form.service}
            onChange={(e) => setForm((prev) => ({ ...prev, service: e.target.value }))}
            options={[
              { value: 'Fitness Consultation', label: 'Fitness Consultation' },
              { value: 'Nutrition Consultation', label: 'Nutrition Consultation' },
              { value: 'Health Check-up', label: 'Health Check-up' },
              { value: 'Wellness Consultation', label: 'Wellness Consultation' },
              { value: 'Fitness Session', label: 'Fitness Session' },
            ]}
          />
          <Input
            type="date"
            label="Date"
            required
            value={form.date}
            onChange={(e) => setForm((prev) => ({ ...prev, date: e.target.value }))}
          />
          <Select
            label="Status"
            value={form.status}
            onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value }))}
            options={[
              { value: 'Scheduled', label: 'Scheduled' },
              { value: 'In Progress', label: 'In Progress' },
              { value: 'Completed', label: 'Completed' },
              { value: 'Cancelled', label: 'Cancelled' },
            ]}
          />
          <Input
            type="time"
            label="Start time"
            required
            value={form.startTime}
            onChange={(e) => setForm((prev) => ({ ...prev, startTime: e.target.value }))}
          />
          <Input
            type="time"
            label="End time"
            value={form.endTime}
            onChange={(e) => setForm((prev) => ({ ...prev, endTime: e.target.value }))}
          />
          <Input
            label="Programme"
            value={form.programme}
            onChange={(e) => setForm((prev) => ({ ...prev, programme: e.target.value }))}
          />
          <Input
            label="Client"
            value={form.client}
            onChange={(e) => setForm((prev) => ({ ...prev, client: e.target.value }))}
          />
          <TextArea
            className="sm:col-span-2"
            label="Notes"
            value={form.notes}
            onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
          />
        </div>
      </Modal>

      <ConfirmDialog
        open={Boolean(cancelId)}
        onClose={() => setCancelId('')}
        onConfirm={handleCancel}
        title="Cancel this schedule?"
        description="The schedule entry will be marked as cancelled and kept for operational history."
        confirmLabel="Cancel schedule"
        tone="danger"
      />

      <Toast open={Boolean(toast)} message={toast} onClose={() => setToast('')} />
    </div>
  )
}
