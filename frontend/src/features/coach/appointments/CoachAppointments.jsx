import { useEffect, useMemo, useState } from 'react'
import { AlertTriangle, CalendarDays, Check } from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../../auth/AuthContext'
import Badge from '../../../components/ui/Badge'
import Button from '../../../components/ui/Button'
import ConfirmDialog from '../../../components/ui/ConfirmDialog'
import EmptyState from '../../../components/ui/EmptyState'
import ErrorState from '../../../components/ui/ErrorState'
import FilterTabs from '../../../components/ui/FilterTabs'
import LoadingSkeleton from '../../../components/ui/LoadingSkeleton'
import Modal from '../../../components/ui/Modal'
import PageHeader from '../../../components/ui/PageHeader'
import StatusBadge from '../../../components/ui/StatusBadge'
import TextArea from '../../../components/ui/TextArea'
import Toast from '../../../components/ui/Toast'
import { localTodayIso } from '../../booking/bookingEngine'
import { formatCoachDate } from '../clients/data/clientFitnessData'
import {
  fetchCoachAppointments,
  markCoachAppointmentAttendance,
} from './data/coachAppointmentData'

const tabs = [
  { value: 'today', label: 'Today' },
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'cancelled', label: 'Cancelled' },
]

function isCancelled(item) {
  const status = String(item?.status || '').toLowerCase()
  return status === 'cancelled' || status.startsWith('cancelled ')
}

function isOwnAppointment(item, user) {
  if (!user) return false
  if (item.professionalUserId != null) {
    return String(item.professionalUserId) === String(user.id)
  }
  const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim().toLowerCase()
  if (!fullName) return false
  return String(item.professional || '').trim().toLowerCase() === fullName
}

export default function CoachAppointments() {
  const { user } = useAuth()
  const [searchParams] = useSearchParams()
  const focusId = searchParams.get('id')
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [tab, setTab] = useState('today')
  const [attendTarget, setAttendTarget] = useState(null)
  const [unavailableTarget, setUnavailableTarget] = useState(null)
  const [unavailableReason, setUnavailableReason] = useState('')
  const [unavailableError, setUnavailableError] = useState('')
  const [busy, setBusy] = useState(false)
  const [toast, setToast] = useState('')
  const today = localTodayIso()

  async function load() {
    setLoading(true)
    setError('')
    try {
      const data = await fetchCoachAppointments()
      setItems(Array.isArray(data) ? data : [])
    } catch {
      setError('We couldn’t load appointments.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  useEffect(() => {
    if (!focusId || items.length === 0) return
    const focused = items.find((item) => String(item.id) === String(focusId))
    if (!focused) return
    if (focused.date === today && !isCancelled(focused)) setTab('today')
    else if (isCancelled(focused)) setTab('cancelled')
    else setTab('upcoming')
  }, [focusId, items, today])

  const filtered = useMemo(() => {
    let rows
    if (tab === 'today') {
      rows = items.filter((item) => item.date === today && !isCancelled(item))
    } else if (tab === 'upcoming') {
      rows = items.filter((item) => String(item.date || '') > today && !isCancelled(item))
    } else {
      rows = items.filter((item) => isCancelled(item))
    }
    return [...rows].sort((a, b) => String(a.time || '').localeCompare(String(b.time || '')))
  }, [items, tab, today])

  async function confirmAttended() {
    if (!attendTarget) return
    setBusy(true)
    try {
      const updated = await markCoachAppointmentAttendance(attendTarget.id, {
        attendance: 'ATTENDED',
      })
      setItems((prev) => prev.map((row) => (row.id === updated.id ? { ...row, ...updated } : row)))
      setAttendTarget(null)
      setToast(
        `${updated.client || updated.clientName || 'Client'} attended. Their name is now available on workout plans, assessments, and risk alerts.`,
      )
    } catch (err) {
      setToast(err?.message || 'Unable to mark attendance.')
    } finally {
      setBusy(false)
    }
  }

  async function confirmUnavailable() {
    if (!unavailableTarget) return
    const reason = unavailableReason.trim()
    if (!reason) {
      setUnavailableError('Please enter a reason.')
      return
    }
    setBusy(true)
    setUnavailableError('')
    try {
      const updated = await markCoachAppointmentAttendance(unavailableTarget.id, {
        attendance: 'ADVISOR_UNAVAILABLE',
        note: reason,
      })
      setItems((prev) => prev.map((row) => (row.id === updated.id ? { ...row, ...updated } : row)))
      setUnavailableTarget(null)
      setUnavailableReason('')
      setToast('Appointment marked as unavailable. The client has been notified.')
    } catch (err) {
      setUnavailableError(err?.message || 'Unable to update attendance.')
    } finally {
      setBusy(false)
    }
  }

  function renderAttendance(item) {
    const attendance = String(item.attendance || '').toUpperCase()
    if (attendance === 'ATTENDED') {
      return <Badge tone="green">Attended</Badge>
    }
    if (attendance === 'ADVISOR_UNAVAILABLE') {
      return <Badge tone="amber">Couldn&apos;t attend</Badge>
    }
    const active =
      String(item.status || '').toLowerCase() === 'upcoming' ||
      String(item.status || '').toLowerCase() === 'confirmed'
    if (tab !== 'today' || !active || !isOwnAppointment(item, user) || item.date !== today) {
      return <span className="text-[12px] text-[#8b93a1]">—</span>
    }
    return (
      <div className="flex flex-wrap gap-1.5">
        <button
          type="button"
          className="inline-flex items-center gap-1 rounded-lg border border-[#bbf7d0] bg-[#ecfdf5] px-2 py-1 text-[11px] font-semibold text-[#047857] hover:bg-[#d1fae5]"
          onClick={() => setAttendTarget(item)}
        >
          <Check className="h-3.5 w-3.5" strokeWidth={2.4} />
          Attend
        </button>
        <button
          type="button"
          className="inline-flex items-center gap-1 rounded-lg border border-[#fde68a] bg-[#fffbeb] px-2 py-1 text-[11px] font-semibold text-[#b45309] hover:bg-[#fef3c7]"
          onClick={() => {
            setUnavailableReason('')
            setUnavailableError('')
            setUnavailableTarget(item)
          }}
        >
          <AlertTriangle className="h-3.5 w-3.5" strokeWidth={2.2} />
          Couldn&apos;t attend
        </button>
      </div>
    )
  }

  if (loading) return <LoadingSkeleton rows={4} />
  if (error) return <ErrorState title={error} onRetry={load} />

  const emptyTitle =
    tab === 'today'
      ? 'No appointments scheduled for today.'
      : tab === 'upcoming'
        ? 'No upcoming appointments.'
        : 'No cancelled appointments.'

  return (
    <div>
      <PageHeader
        title="Appointments"
        description="Today’s sessions can be marked Attend or Couldn’t attend. Attend makes the client’s name available on workout plans, fitness assessments, and risk alerts."
      />
      <div className="mb-5">
        <FilterTabs ariaLabel="Appointment filters" value={tab} onChange={setTab} options={tabs} />
      </div>
      {filtered.length === 0 ? (
        <EmptyState icon={CalendarDays} title={emptyTitle} description="Client bookings with you will appear here." />
      ) : (
        <div className="overflow-hidden rounded-[1.25rem] border border-[#e8ecf1] bg-white shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
          <div className="overflow-x-auto">
            <table className="min-w-[860px] w-full text-left text-sm">
              <thead className="bg-[#f8faf9] text-[11px] font-bold tracking-wide text-[#8b93a1] uppercase">
                <tr>
                  <th className="px-4 py-3">Client</th>
                  <th className="px-4 py-3">Appointment</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Time</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Attendance</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => {
                  const attended = String(item.attendance || '').toUpperCase() === 'ATTENDED'
                  const clientRouteId = item.clientId || (item.clientUserId ? `BF-C${item.clientUserId}` : '')
                  return (
                    <tr
                      key={item.id}
                      id={`appointment-${item.id}`}
                      className={`border-t border-[#eef2f0] ${
                        focusId && String(item.id) === String(focusId) ? 'bg-[#e6f5f0]/60' : ''
                      }`}
                    >
                      <td className="px-4 py-3.5">
                        {attended && clientRouteId ? (
                          <Link
                            to={`/coach/clients/${encodeURIComponent(clientRouteId)}`}
                            className="font-semibold text-[#005a40] hover:underline"
                          >
                            {item.client || item.clientName}
                          </Link>
                        ) : (
                          <p className="font-semibold text-[#111827]">{item.client || item.clientName}</p>
                        )}
                        <p className="mt-0.5 text-[12px] text-[#6b7280]">{item.clientId || '—'}</p>
                      </td>
                      <td className="px-4 py-3.5 text-[#4b5563]">
                        {item.type || item.serviceType || item.service}
                      </td>
                      <td className="px-4 py-3.5 text-[#4b5563]">{formatCoachDate(item.date)}</td>
                      <td className="px-4 py-3.5 text-[#4b5563]">
                        {item.time}
                        {item.duration ? ` · ${item.duration}` : ''}
                      </td>
                      <td className="px-4 py-3.5">
                        <StatusBadge status={item.status} />
                      </td>
                      <td className="px-4 py-3.5">{renderAttendance(item)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(attendTarget)}
        onClose={() => !busy && setAttendTarget(null)}
        title="Attend client?"
        description={
          attendTarget
            ? `Attend ${attendTarget.client || attendTarget.clientName || 'this client'}? Their name will appear on workout plans, fitness assessments, and risk alerts.`
            : ''
        }
        confirmLabel="Attend"
        cancelLabel="Cancel"
        confirming={busy}
        onConfirm={confirmAttended}
      />

      <Modal
        open={Boolean(unavailableTarget)}
        onClose={() => {
          if (busy) return
          setUnavailableTarget(null)
          setUnavailableReason('')
          setUnavailableError('')
        }}
        title="Couldn't attend"
        description="The client will be notified and this time slot will become free again."
        size="sm"
        footer={
          <>
            <Button
              variant="outline"
              disabled={busy}
              onClick={() => {
                setUnavailableTarget(null)
                setUnavailableReason('')
                setUnavailableError('')
              }}
            >
              Cancel
            </Button>
            <Button
              disabled={busy}
              onClick={confirmUnavailable}
              className="!bg-[#b45309] !text-white hover:!bg-[#92400e]"
            >
              {busy ? 'Saving…' : "Couldn't attend"}
            </Button>
          </>
        }
      >
        <TextArea
          label="Reason"
          required
          value={unavailableReason}
          onChange={(e) => {
            setUnavailableReason(e.target.value)
            if (unavailableError) setUnavailableError('')
          }}
          error={unavailableError}
          placeholder="Tell the client why this session could not go ahead."
        />
      </Modal>

      <Toast open={Boolean(toast)} message={toast} onClose={() => setToast('')} />
    </div>
  )
}
