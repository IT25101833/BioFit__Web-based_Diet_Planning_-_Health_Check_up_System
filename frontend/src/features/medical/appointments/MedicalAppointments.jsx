import { useEffect, useMemo, useState } from 'react'
import { AlertTriangle, CalendarDays, Check } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../../auth/AuthContext'
import ActionMenu from '../../../components/ui/ActionMenu'
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
import { fetchHealthRecords, formatMedicalDate } from '../health-records/data/healthRecordData'
import {
  healthRecordHref,
  indexHealthRecordsByClient,
} from '../shared/medicalNav'
import {
  fetchMedicalAppointments,
  markMedicalAppointmentAttendance,
} from './data/medicalAppointmentData'
import { localTodayIso } from '../../booking/bookingEngine'

const tabs = [
  { value: 'today', label: 'Today' },
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
]

function resolveClientUserId(item) {
  if (item.clientUserId != null && String(item.clientUserId).trim() !== '') {
    return String(item.clientUserId)
  }
  const digits = String(item.clientId || '').replace(/\D+/g, '')
  return digits || ''
}

function isActiveBookableStatus(status) {
  const s = String(status || '').toLowerCase()
  return s === 'upcoming' || s === 'confirmed'
}

function isCancelledStatus(status) {
  const s = String(status || '').toLowerCase()
  return s === 'cancelled' || s.startsWith('cancelled ')
}

function isOwnAppointment(item, user) {
  if (!user || item.professionalUserId == null) return false
  return String(item.professionalUserId) === String(user.id)
}

function canShowAttendanceActions(item, user) {
  if (!isOwnAppointment(item, user)) return false
  if (!isActiveBookableStatus(item.status)) return false
  if (item.attendance) return false
  return true
}

function canMarkAttended(item, today) {
  if (!item?.date) return false
  return String(item.date) <= today
}

export default function MedicalAppointments() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [items, setItems] = useState([])
  const [recordIndex, setRecordIndex] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [tab, setTab] = useState('today')
  const [attendTarget, setAttendTarget] = useState(null)
  const [unavailableTarget, setUnavailableTarget] = useState(null)
  const [unavailableReason, setUnavailableReason] = useState('')
  const [unavailableError, setUnavailableError] = useState('')
  const [busy, setBusy] = useState(false)
  const [toast, setToast] = useState({ open: false, message: '', actionLabel: '', actionTo: '' })

  async function load() {
    setLoading(true)
    setError('')
    try {
      const [appointments, records] = await Promise.all([
        fetchMedicalAppointments(),
        fetchHealthRecords(),
      ])
      setItems(appointments)
      setRecordIndex(indexHealthRecordsByClient(records))
    } catch {
      setError('We couldn’t load medical appointments.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const today = localTodayIso()

  const filtered = useMemo(() => {
    if (tab === 'today') {
      return items.filter((item) => item.date === today && !isCancelledStatus(item.status))
    }
    if (tab === 'upcoming') {
      return items.filter((item) => isActiveBookableStatus(item.status))
    }
    if (tab === 'completed') {
      return items.filter(
        (item) =>
          String(item.status).toLowerCase() === 'completed' ||
          String(item.attendance || '').toUpperCase() === 'ATTENDED',
      )
    }
    return items.filter((item) => isCancelledStatus(item.status))
  }, [items, tab, today])

  function recordHrefFor(item) {
    const clientUserId = resolveClientUserId(item)
    return healthRecordHref(recordIndex, {
      userId: clientUserId || undefined,
      clientId: item.clientId,
    })
  }

  function actionItems(item) {
    const clientUserId = resolveClientUserId(item)
    const href = recordHrefFor(item)
    const actions = [
      {
        label: 'View Health Record',
        onClick: () => navigate(href),
      },
    ]
    if (clientUserId) {
      actions.unshift(
        {
          label: 'Start assessment',
          onClick: () =>
            navigate(
              `/medical/assessments/create?clientUserId=${encodeURIComponent(clientUserId)}${
                item.id ? `&appointmentId=${encodeURIComponent(item.id)}` : ''
              }`,
            ),
        },
        {
          label: 'Add history',
          onClick: () =>
            navigate(
              `/medical/medical-history?clientUserId=${encodeURIComponent(clientUserId)}`,
            ),
        },
      )
    }
    return actions
  }

  function showToast(message, action) {
    setToast({
      open: true,
      message,
      actionLabel: action?.label || '',
      actionTo: action?.to || '',
    })
  }

  async function confirmAttended() {
    if (!attendTarget) return
    setBusy(true)
    try {
      const updated = await markMedicalAppointmentAttendance(attendTarget.id, {
        attendance: 'ATTENDED',
      })
      setItems((prev) => prev.map((row) => (row.id === updated.id ? { ...row, ...updated } : row)))
      const clientUserId = resolveClientUserId(updated)
      setAttendTarget(null)
      showToast(
        `${updated.client || updated.clientName || 'Client'} attended and is now available in Select Client.`,
        clientUserId
          ? {
              label: 'Open health records',
              to: `/medical/health-records/create?clientUserId=${encodeURIComponent(clientUserId)}`,
            }
          : null,
      )
    } catch (err) {
      showToast(err?.message || 'Unable to mark attendance.')
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
      const updated = await markMedicalAppointmentAttendance(unavailableTarget.id, {
        attendance: 'ADVISOR_UNAVAILABLE',
        note: reason,
      })
      setItems((prev) => prev.map((row) => (row.id === updated.id ? { ...row, ...updated } : row)))
      setUnavailableTarget(null)
      setUnavailableReason('')
      showToast('Appointment marked as advisor unavailable. The client has been notified.')
    } catch (err) {
      setUnavailableError(err?.message || 'Unable to update attendance.')
    } finally {
      setBusy(false)
    }
  }

  function renderAttendanceCell(item) {
    const attendance = String(item.attendance || '').toUpperCase()
    if (attendance === 'ATTENDED') {
      return (
        <span title={item.attendanceNote || 'Patient attended'}>
          <Badge tone="green">Attended</Badge>
        </span>
      )
    }
    if (attendance === 'ADVISOR_UNAVAILABLE') {
      return (
        <span title={item.attendanceNote || 'Advisor unavailable'}>
          <Badge tone="amber">Advisor unavailable</Badge>
        </span>
      )
    }

    if (!canShowAttendanceActions(item, user)) {
      return <span className="text-[12px] text-[#8b93a1]">—</span>
    }

    const showAttended = canMarkAttended(item, today)

    return (
      <div className="flex flex-wrap gap-1.5">
        {showAttended ? (
          <button
            type="button"
            className="inline-flex items-center gap-1 rounded-lg border border-[#bbf7d0] bg-[#ecfdf5] px-2 py-1 text-[11px] font-semibold text-[#047857] hover:bg-[#d1fae5]"
            onClick={() => setAttendTarget(item)}
          >
            <Check className="h-3.5 w-3.5" strokeWidth={2.4} />
            Attend
          </button>
        ) : null}
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
  if (error) {
    return <ErrorState title="We couldn’t load medical appointments." onRetry={load} />
  }

  return (
    <div>
      <p className="mb-3 text-[12px] text-[#8b93a1]">
        <Link to="/medical/dashboard" className="hover:text-[#005a40] hover:underline">
          Medical Advisor
        </Link>
        {' › Appointments'}
      </p>

      <PageHeader
        title="Medical Appointments"
        description="Review health check-ups and follow-up reviews. Use Attend to make a client available in Select Client on clinical pages."
      />

      <div className="mb-5">
        <FilterTabs ariaLabel="Appointment filters" value={tab} onChange={setTab} options={tabs} />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={CalendarDays}
          title={`No ${tab} appointments`}
          description="Medical appointments will appear here when scheduled."
        />
      ) : (
        <>
          <div className="overflow-hidden rounded-[1.25rem] border border-[#e8ecf1] bg-white shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
            <div className="overflow-x-auto">
              <table className="min-w-[980px] w-full text-left text-sm">
                <thead className="bg-[#f8faf9] text-[11px] font-bold tracking-wide text-[#8b93a1] uppercase">
                  <tr>
                    <th className="px-4 py-3">Client</th>
                    <th className="px-4 py-3">Appointment Type</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Time</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Actions</th>
                    <th className="px-4 py-3">Attendance</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((item) => (
                    <tr key={item.id} className="border-t border-[#eef2f0]">
                      <td className="px-4 py-3.5">
                        <Link
                          to={recordHrefFor(item)}
                          className="font-semibold text-[#005a40] hover:underline"
                        >
                          {item.client}
                        </Link>
                        <p className="mt-0.5 text-[12px] text-[#6b7280]">{item.clientId}</p>
                      </td>
                      <td className="px-4 py-3.5 text-[#4b5563]">{item.type}</td>
                      <td className="px-4 py-3.5 text-[#4b5563]">
                        {formatMedicalDate(item.date)}
                      </td>
                      <td className="px-4 py-3.5 text-[#4b5563]">
                        {item.time}
                        {item.duration ? ` · ${item.duration}` : ''}
                      </td>
                      <td className="px-4 py-3.5">
                        <StatusBadge status={item.status} />
                      </td>
                      <td className="px-4 py-3.5">
                        <ActionMenu items={actionItems(item)} />
                      </td>
                      <td className="px-4 py-3.5">{renderAttendanceCell(item)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      <ConfirmDialog
        open={Boolean(attendTarget)}
        onClose={() => !busy && setAttendTarget(null)}
        title="Attend client?"
        description={
          attendTarget
            ? `Attend ${attendTarget.client || attendTarget.clientName || 'this client'}? They will become available in Select Client on clinical pages.`
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
              {busy ? 'Saving…' : 'Confirm'}
            </Button>
          </>
        }
      >
        <TextArea
          label="Reason"
          required
          rows={3}
          value={unavailableReason}
          onChange={(e) => {
            setUnavailableReason(e.target.value)
            if (unavailableError) setUnavailableError('')
          }}
          placeholder="e.g. Emergency case"
          error={unavailableError}
        />
      </Modal>

      <Toast
        open={toast.open}
        message={toast.message}
        actionLabel={toast.actionLabel}
        actionTo={toast.actionTo}
        onClose={() => setToast({ open: false, message: '', actionLabel: '', actionTo: '' })}
      />
    </div>
  )
}
