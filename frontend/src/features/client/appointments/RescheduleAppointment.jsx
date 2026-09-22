import { useEffect, useMemo, useState } from 'react'
import { ArrowLeft, CheckCircle2 } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import Button from '../../../components/ui/Button'
import ErrorState from '../../../components/ui/ErrorState'
import LoadingSkeleton from '../../../components/ui/LoadingSkeleton'
import Modal from '../../../components/ui/Modal'
import PageHeader from '../../../components/ui/PageHeader'
import SectionCard from '../../../components/ui/SectionCard'
import Toast from '../../../components/ui/Toast'
import {
  PAST_DATE_MESSAGE,
  filterAvailableSlotsForDate,
  isDateBeforeToday,
  localTodayIso,
} from '../../booking/bookingEngine'
import {
  fetchBookingCatalog,
  fetchClientAppointmentById,
  fetchProfessionalAvailability,
  formatAppointmentDate,
  formatAppointmentDateLong,
  formatAppointmentTimeRange,
  getBookingDateOptions,
  isAdvisorUnavailableAppointment,
  rescheduleClientAppointment,
} from './data/appointmentData'

export default function RescheduleAppointment() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [appointment, setAppointment] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [availability, setAvailability] = useState(null)
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')
  const [dateError, setDateError] = useState('')
  const [toast, setToast] = useState('')
  const dateOptions = useMemo(() => getBookingDateOptions(), [])
  const minDate = localTodayIso()

  async function load() {
    setLoading(true)
    setError('')
    try {
      const data = await fetchClientAppointmentById(id)
      const status = String(data.status || '').toLowerCase()
      const canReschedule =
        status === 'upcoming' ||
        status === 'confirmed' ||
        isAdvisorUnavailableAppointment(data)
      if (!canReschedule) {
        setError('Only upcoming appointments can be rescheduled.')
        setAppointment(data)
        return
      }
      setAppointment(data)
      const nextDate =
        data.date && !isDateBeforeToday(data.date) ? data.date : minDate
      setDate(nextDate)
      setDateError('')
    } catch {
      setError('We couldn’t load this appointment.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [id])

  const professionalId =
    appointment?.professionalId ||
    (appointment?.professionalUserId ? `user-${appointment.professionalUserId}` : '')
  const [resolvedProfessionalId, setResolvedProfessionalId] = useState('')

  useEffect(() => {
    if (!appointment) return
    if (professionalId) {
      setResolvedProfessionalId(professionalId)
      return
    }
    let cancelled = false
    fetchBookingCatalog(appointment.audience || 'CLIENT')
      .then((catalog) => {
        if (cancelled) return
        const match = (catalog.professionals || []).find(
          (p) =>
            String(p.name).toLowerCase() === String(appointment.professional || '').toLowerCase(),
        )
        if (match?.id) setResolvedProfessionalId(match.id)
        else if (match?.userId) setResolvedProfessionalId(`user-${match.userId}`)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [appointment, professionalId])

  useEffect(() => {
    const pid = resolvedProfessionalId || professionalId
    if (!appointment || !pid || !date) {
      setAvailability(null)
      return undefined
    }
    let cancelled = false
    setLoadingSlots(true)
    setTime('')
    setFormError('')
    fetchProfessionalAvailability({
      professionalId: pid,
      date,
      duration: appointment.duration || '45 min',
      audience: appointment.audience || 'CLIENT',
      excludeAppointmentId: appointment.id,
    })
      .then((data) => {
        if (!cancelled) {
          setAvailability({
            ...data,
            availableSlots: filterAvailableSlotsForDate(data?.availableSlots || [], date),
          })
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setAvailability(null)
          setFormError(err?.message || 'Could not load available times.')
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingSlots(false)
      })
    return () => {
      cancelled = true
    }
  }, [appointment, professionalId, resolvedProfessionalId, date])

  async function handleConfirmReschedule() {
    if (!appointment || !date || !time) return
    if (isDateBeforeToday(date)) {
      setDateError(PAST_DATE_MESSAGE)
      setConfirmOpen(false)
      return
    }
    setSaving(true)
    setFormError('')
    setDateError('')
    try {
      await rescheduleClientAppointment(appointment.id, {
        date,
        time,
        duration: appointment.duration,
        professionalId: resolvedProfessionalId || professionalId,
        professionalUserId: appointment.professionalUserId,
      })
      setConfirmOpen(false)
      setToast('Appointment rescheduled successfully.')
      window.setTimeout(() => navigate(`/client/appointments/${appointment.id}`), 700)
    } catch (err) {
      setFormError(err?.message || 'Unable to reschedule. Please try another slot.')
      setConfirmOpen(false)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <LoadingSkeleton rows={4} />
  if (error && !appointment) {
    return <ErrorState title={error} onRetry={load} />
  }
  if (!appointment) {
    return <ErrorState title="Appointment not found." onRetry={load} />
  }
  if (String(appointment.status).toLowerCase() !== 'upcoming') {
    return (
      <ErrorState
        title="Only upcoming appointments can be rescheduled."
        description="Cancelled or past appointments cannot be changed."
        onRetry={() => navigate(`/client/appointments/${appointment.id}`)}
      />
    )
  }

  const slots = availability?.availableSlots || []

  return (
    <div>
      <div className="mb-4">
        <Link
          to={`/client/appointments/${appointment.id}`}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#005a40] hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to appointment
        </Link>
      </div>

      <PageHeader
        title="Reschedule Appointment"
        description={`${appointment.service} with ${appointment.professional}`}
      />

      <div className="mb-4 rounded-[1.25rem] border border-[#e6f5f0] bg-[#f4fbf8] px-4 py-3 text-sm text-[#005a40]">
        Current booking:{' '}
        <strong>
          {formatAppointmentDate(appointment.date)} · {formatAppointmentTimeRange(appointment)}
        </strong>
      </div>

      {formError ? (
        <p className="mb-4 rounded-2xl border border-[#fecaca] bg-[#fef2f2] px-4 py-3 text-sm text-[#b91c1c]" role="alert">
          {formError}
        </p>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <SectionCard title="Choose a new date">
          <div className="grid gap-2 grid-cols-2 sm:grid-cols-3">
            {dateOptions.map((iso) => {
              const label = new Date(`${iso}T00:00:00`).toLocaleDateString('en-GB', {
                weekday: 'short',
                day: 'numeric',
                month: 'short',
              })
              return (
                <button
                  key={iso}
                  type="button"
                  onClick={() => {
                    setDate(iso)
                    setDateError(isDateBeforeToday(iso) ? PAST_DATE_MESSAGE : '')
                    setTime('')
                  }}
                  className={[
                    'rounded-2xl border px-4 py-3 text-left text-sm transition',
                    date === iso
                      ? 'border-[#005a40] bg-[#e6f5f0] font-semibold text-[#005a40]'
                      : 'border-[#e8ecf1] bg-white text-[#4b5563] hover:border-[#005a40]/35',
                  ].join(' ')}
                >
                  {label}
                </button>
              )
            })}
          </div>
          {dateError ? (
            <p className="mt-3 text-sm text-[#b91c1c]" role="alert">
              {dateError}
            </p>
          ) : null}
        </SectionCard>

        <SectionCard title="Choose an available time">
          {!date ? (
            <p className="text-sm text-[#6b7280]">Select a date to see open slots.</p>
          ) : loadingSlots ? (
            <p className="text-sm text-[#6b7280]">Loading available times…</p>
          ) : slots.length === 0 ? (
            <p className="text-sm text-[#6b7280]">
              {availability?.message || 'No open slots on this day. Try another date.'}
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {slots.map((slot) => (
                <button
                  key={slot}
                  type="button"
                  onClick={() => setTime(slot)}
                  className={[
                    'rounded-2xl border px-3 py-2.5 text-sm transition',
                    time === slot
                      ? 'border-[#005a40] bg-[#005a40] font-semibold text-white'
                      : 'border-[#e8ecf1] bg-white text-[#4b5563] hover:border-[#005a40]/35',
                  ].join(' ')}
                >
                  {slot}
                </button>
              ))}
            </div>
          )}
        </SectionCard>
      </div>

      <div className="mt-5 flex flex-wrap justify-between gap-2.5">
        <Button
          to={`/client/appointments/${appointment.id}`}
          variant="outline"
          className="!text-[#4b5563]"
        >
          Cancel
        </Button>
        <Button
          disabled={!date || !time || saving || Boolean(dateError)}
          onClick={() => {
            if (isDateBeforeToday(date)) {
              setDateError(PAST_DATE_MESSAGE)
              return
            }
            setDateError('')
            setConfirmOpen(true)
          }}
          className="!bg-[#005a40] !text-white hover:!bg-[#004833]"
        >
          Review Reschedule
        </Button>
      </div>

      <Modal
        open={confirmOpen}
        onClose={() => !saving && setConfirmOpen(false)}
        title="Reschedule Appointment?"
        description="Confirm the new date and time for this booking."
        footer={
          <>
            <Button variant="outline" disabled={saving} onClick={() => setConfirmOpen(false)}>
              Cancel
            </Button>
            <Button
              disabled={saving}
              onClick={handleConfirmReschedule}
              className="!bg-[#005a40] !text-white hover:!bg-[#004833]"
            >
              {saving ? 'Saving…' : 'Confirm Reschedule'}
            </Button>
          </>
        }
      >
        <div className="space-y-3 text-sm text-[#4b5563]">
          <div className="rounded-2xl border border-[#eef2f0] bg-[#f8faf9] px-4 py-3">
            <p className="text-[11px] font-medium uppercase tracking-wide text-[#8b93a1]">Current</p>
            <p className="mt-1 font-semibold text-[#111827]">
              {formatAppointmentDateLong(appointment.date)}
            </p>
            <p>{formatAppointmentTimeRange(appointment)}</p>
          </div>
          <div className="rounded-2xl border border-[#005a40]/20 bg-[#e6f5f0] px-4 py-3">
            <p className="text-[11px] font-medium uppercase tracking-wide text-[#005a40]">New</p>
            <p className="mt-1 font-semibold text-[#111827]">{formatAppointmentDateLong(date)}</p>
            <p>{time}</p>
          </div>
          <p className="flex items-center gap-2 text-[#005a40]">
            <CheckCircle2 className="h-4 w-4" />
            Service and professional stay the same.
          </p>
        </div>
      </Modal>

      <Toast open={Boolean(toast)} message={toast} onClose={() => setToast('')} />
    </div>
  )
}
