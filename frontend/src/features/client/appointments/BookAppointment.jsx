import { useEffect, useMemo, useState } from 'react'
import { CheckCircle2, ChevronLeft, ChevronRight, Clock3 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import Button from '../../../components/ui/Button'
import PageHeader from '../../../components/ui/PageHeader'
import SectionCard from '../../../components/ui/SectionCard'
import Toast from '../../../components/ui/Toast'
import {
  createClientAppointment,
  fetchBookingCatalog,
  fetchProfessionalAvailability,
  getBookingDateOptions,
} from './data/appointmentData'

const steps = ['Service', 'Professional', 'Date', 'Time', 'Review', 'Confirm']

export default function BookAppointment({ audience = 'CLIENT', successPath } = {}) {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [services, setServices] = useState([])
  const [professionals, setProfessionals] = useState([])
  const [serviceId, setServiceId] = useState('')
  const [professionalId, setProfessionalId] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [availability, setAvailability] = useState(null)
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [toast, setToast] = useState('')
  const [error, setError] = useState('')
  const dateOptions = useMemo(() => getBookingDateOptions(), [])

  useEffect(() => {
    let cancelled = false
    fetchBookingCatalog(audience)
      .then((data) => {
        if (cancelled) return
        setServices(data.services || [])
        setProfessionals(data.professionals || [])
      })
      .catch(() => {
        if (!cancelled) setError('Could not load booking options.')
      })
    return () => {
      cancelled = true
    }
  }, [audience])

  const service = services.find((item) => item.id === serviceId)
  const filteredProfessionals = professionals.filter(
    (item) => !serviceId || item.services?.includes(serviceId),
  )
  const professional = filteredProfessionals.find((item) => item.id === professionalId)

  useEffect(() => {
    if (!professionalId || !date || !service) {
      setAvailability(null)
      return undefined
    }
    let cancelled = false
    setLoadingSlots(true)
    setTime('')
    fetchProfessionalAvailability({
      professionalId,
      date,
      duration: service.duration,
      audience,
    })
      .then((data) => {
        if (!cancelled) setAvailability(data)
      })
      .catch(() => {
        if (!cancelled) {
          setAvailability(null)
          setError('Could not load available times.')
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingSlots(false)
      })
    return () => {
      cancelled = true
    }
  }, [professionalId, date, service, audience])

  function canContinue() {
    if (step === 0) return Boolean(serviceId)
    if (step === 1) return Boolean(professionalId)
    if (step === 2) return Boolean(date)
    if (step === 3) return Boolean(time)
    return true
  }

  async function handleConfirm() {
    setSubmitting(true)
    setError('')
    try {
      const created = await createClientAppointment({
        service: service?.name,
        serviceId: service?.id,
        professionalId: professional?.id,
        professional: professional?.name,
        professionalRole: professional?.role,
        professionalUserId: professional?.userId,
        date,
        time,
        duration: service?.duration,
        audience,
        notes: 'Please arrive 10 minutes early for check-in.',
        location: 'VitalLife Wellness Centre',
      })
      setToast('Appointment booked successfully. The professional has been notified.')
      window.setTimeout(() => {
        navigate(
          successPath ||
            (audience === 'STAFF'
              ? '/coach/dashboard'
              : `/client/appointments/${created.id}`),
        )
      }, 700)
    } catch (err) {
      setError(err?.message || 'This slot is no longer available. Please try another time.')
      setStep(3)
    } finally {
      setSubmitting(false)
    }
  }

  const listPath = successPath || (audience === 'STAFF' ? '/coach/dashboard' : '/client/appointments')

  return (
    <div>
      <PageHeader
        title="Book Appointment"
        description="Pick a person, see their open hours, and book an available slot automatically."
      />

      <div className="mb-6 flex flex-wrap gap-2" aria-label="Booking steps">
        {steps.map((label, index) => (
          <span
            key={label}
            className={[
              'rounded-full px-3 py-1.5 text-[12px] font-semibold',
              index === step
                ? 'bg-[var(--bf-primary)] text-[var(--bf-ink)]'
                : index < step
                  ? 'bg-[var(--bf-primary-soft)] text-[var(--bf-ink)]'
                  : 'bg-[var(--bf-surface)] text-[var(--bf-muted)]',
            ].join(' ')}
          >
            {index + 1}. {label}
          </span>
        ))}
      </div>

      {error ? (
        <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-200">
          {error}
        </div>
      ) : null}

      <SectionCard>
        {step === 0 && (
          <div className="grid gap-3 sm:grid-cols-2">
            {services.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setServiceId(item.id)
                  setProfessionalId('')
                  setDate('')
                  setTime('')
                }}
                className={[
                  'rounded-2xl border px-4 py-4 text-left transition-colors bf-neo',
                  serviceId === item.id
                    ? 'border-[var(--bf-primary)] bg-[var(--bf-primary-soft)]'
                    : 'border-[var(--bf-border)] hover:bg-[var(--bf-surface)]',
                ].join(' ')}
              >
                <p className="font-semibold text-[var(--bf-ink)]">{item.name}</p>
                <p className="mt-1 text-[12px] text-[var(--bf-muted)]">{item.description}</p>
                <p className="mt-2 text-[11px] font-semibold text-[var(--bf-ink)]">
                  {item.duration}
                </p>
              </button>
            ))}
          </div>
        )}

        {step === 1 && (
          <div className="grid gap-3 sm:grid-cols-2">
            {filteredProfessionals.length === 0 ? (
              <p className="text-sm text-[var(--bf-muted)]">
                No professionals are available for this service yet.
              </p>
            ) : (
              filteredProfessionals.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setProfessionalId(item.id)
                    setDate('')
                    setTime('')
                  }}
                  className={[
                    'rounded-2xl border px-4 py-4 text-left transition-colors bf-neo',
                    professionalId === item.id
                      ? 'border-[var(--bf-primary)] bg-[var(--bf-primary-soft)]'
                      : 'border-[var(--bf-border)] hover:bg-[var(--bf-surface)]',
                  ].join(' ')}
                >
                  <p className="font-semibold text-[var(--bf-ink)]">{item.name}</p>
                  <p className="mt-1 text-[12px] text-[var(--bf-muted)]">{item.role}</p>
                </button>
              ))
            )}
          </div>
        )}

        {step === 2 && (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
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
                    setTime('')
                  }}
                  className={[
                    'rounded-2xl border px-3 py-3 text-sm font-semibold transition-colors',
                    date === iso
                      ? 'border-[var(--bf-primary)] bg-[var(--bf-primary-soft)] text-[var(--bf-ink)]'
                      : 'border-[var(--bf-border)] text-[var(--bf-ink)] hover:bg-[var(--bf-surface)]',
                  ].join(' ')}
                >
                  {label}
                </button>
              )
            })}
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            {loadingSlots ? (
              <p className="text-sm text-[var(--bf-muted)]">Checking availability…</p>
            ) : null}

            {availability?.workingHours ? (
              <div className="flex flex-wrap items-center gap-2 rounded-2xl bf-neo-inset px-4 py-3 text-sm text-[var(--bf-ink)]">
                <Clock3 className="h-4 w-4 text-[var(--bf-ink)]" />
                <span>
                  Available {availability.workingHours.start} – {availability.workingHours.end}
                </span>
              </div>
            ) : null}

            {availability?.unavailableWindows?.length ? (
              <div>
                <p className="mb-2 text-xs font-semibold tracking-wide text-[var(--bf-muted)] uppercase">
                  Unavailable
                </p>
                <div className="flex flex-wrap gap-2">
                  {availability.unavailableWindows.map((window) => (
                    <span
                      key={`${window.start}-${window.end}-${window.reason}`}
                      className="rounded-full bg-[var(--bf-surface)] px-3 py-1.5 text-[12px] text-[var(--bf-muted)]"
                    >
                      {window.start}–{window.end}
                      {window.reason ? ` · ${window.reason}` : ''}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}

            {availability?.freeRanges?.length ? (
              <div>
                <p className="mb-2 text-xs font-semibold tracking-wide text-[var(--bf-muted)] uppercase">
                  Open ranges
                </p>
                <div className="flex flex-wrap gap-2">
                  {availability.freeRanges.map((range) => (
                    <span
                      key={`${range.start}-${range.end}`}
                      className="rounded-full bg-[var(--bf-primary-soft)] px-3 py-1.5 text-[12px] font-medium text-[var(--bf-ink)]"
                    >
                      {range.start}–{range.end}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}

            {availability?.message ? (
              <p className="rounded-2xl bg-[var(--bf-primary-soft)] px-4 py-3 text-sm text-[var(--bf-ink)]">
                {availability.message}
              </p>
            ) : null}

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {(availability?.availableSlots || []).map((slot) => (
                <button
                  key={slot}
                  type="button"
                  onClick={() => {
                    setTime(slot)
                    setError('')
                  }}
                  className={[
                    'rounded-2xl border px-3 py-3 text-sm font-semibold transition-colors',
                    time === slot
                      ? 'border-[var(--bf-primary)] bg-[var(--bf-primary-soft)] text-[var(--bf-ink)]'
                      : 'border-[var(--bf-border)] text-[var(--bf-ink)] hover:bg-[var(--bf-surface)]',
                  ].join(' ')}
                >
                  {slot}
                </button>
              ))}
            </div>
          </div>
        )}

        {(step === 4 || step === 5) && (
          <div className="space-y-3 text-sm">
            <ReviewRow label="Service" value={service?.name} />
            <ReviewRow label="Professional" value={professional?.name} />
            <ReviewRow
              label="Date"
              value={
                date
                  ? new Date(`${date}T00:00:00`).toLocaleDateString('en-GB', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })
                  : ''
              }
            />
            <ReviewRow label="Time" value={time} />
            <ReviewRow label="Duration" value={service?.duration} />
            {step === 5 ? (
              <p className="rounded-2xl bg-[var(--bf-primary-soft)] px-4 py-3 text-[var(--bf-ink)]">
                Confirm to book this slot. Overlaps and blocked times are rejected automatically.
              </p>
            ) : null}
          </div>
        )}

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <Button
            variant="outline"
            onClick={() => (step === 0 ? navigate(listPath) : setStep(step - 1))}
            className="!border-[var(--bf-border)] !text-[var(--bf-muted)]"
          >
            <ChevronLeft className="h-4 w-4" />
            {step === 0 ? 'Cancel' : 'Back'}
          </Button>

          {step < 5 ? (
            <Button
              disabled={!canContinue()}
              onClick={() => {
                setError('')
                setStep(step + 1)
              }}
              className="!bg-[var(--bf-primary)] !text-white hover:opacity-90"
            >
              Continue
              <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              disabled={submitting}
              onClick={handleConfirm}
              className="!bg-[var(--bf-primary)] !text-white hover:opacity-90"
            >
              <CheckCircle2 className="h-4 w-4" />
              {submitting ? 'Confirming…' : 'Confirm Booking'}
            </Button>
          )}
        </div>
      </SectionCard>

      <Toast open={Boolean(toast)} message={toast} onClose={() => setToast('')} />
    </div>
  )
}

function ReviewRow({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-[var(--bf-border)] py-3 last:border-0">
      <span className="text-[var(--bf-muted)]">{label}</span>
      <span className="font-semibold text-[var(--bf-ink)]">{value || '—'}</span>
    </div>
  )
}
