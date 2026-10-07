import { useEffect, useMemo, useState } from 'react'
import { CheckCircle2, ChevronLeft, ChevronRight, Clock3 } from 'lucide-react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import Button from '../../../components/ui/Button'
import Modal from '../../../components/ui/Modal'
import PageHeader from '../../../components/ui/PageHeader'
import SectionCard from '../../../components/ui/SectionCard'
import Toast from '../../../components/ui/Toast'
import { fetchWallet, formatRs } from '../wallet/data/walletData'
import {
  PAST_DATE_MESSAGE,
  filterAvailableSlotsForDate,
  formatMinutesToLabel,
  isDateBeforeToday,
  parseDurationMinutes,
  parseTimeToMinutes,
} from '../../booking/bookingEngine'
import YourBookingsSection from './components/YourBookingsSection'
import {
  bookMedicalReviewRequest,
  createClientAppointment,
  fetchBookingCatalog,
  fetchMedicalReviewRequest,
  fetchProfessionalAvailability,
  getBookingDateOptions,
} from './data/appointmentData'

const steps = ['Service', 'Professional', 'Date', 'Time', 'Review', 'Confirm']

const BOOKING_FEES = {
  fitness: 2000,
  nutrition: 1000,
  medical: 1500,
  checkup: 1500,
}

export default function BookAppointment({ audience = 'CLIENT', successPath } = {}) {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const reviewRequestId = searchParams.get('reviewRequestId') || ''

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
  const [bookingsRefreshKey, setBookingsRefreshKey] = useState(0)
  const [reviewLocked, setReviewLocked] = useState(false)
  const [reviewMeta, setReviewMeta] = useState(null)
  const [loadingReview, setLoadingReview] = useState(Boolean(reviewRequestId))
  const [wallet, setWallet] = useState(null)
  const [shortfall, setShortfall] = useState(null)

  const dateOptions = useMemo(() => {
    const base = getBookingDateOptions()
    if (date && !base.includes(date)) {
      return [date, ...base]
    }
    return base
  }, [date])

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

  useEffect(() => {
    if (audience !== 'CLIENT') return undefined
    let cancelled = false
    fetchWallet()
      .then((data) => {
        if (!cancelled) setWallet(data)
      })
      .catch(() => {
        if (!cancelled) setWallet(null)
      })
    return () => {
      cancelled = true
    }
  }, [audience, bookingsRefreshKey])

  useEffect(() => {
    if (!reviewRequestId) {
      setLoadingReview(false)
      return undefined
    }
    let cancelled = false
    setLoadingReview(true)
    fetchMedicalReviewRequest(reviewRequestId)
      .then((req) => {
        if (cancelled) return
        if (String(req.status || '').toUpperCase() === 'BOOKED') {
          setError('Review appointment already booked')
          setReviewLocked(false)
          return
        }
        setReviewMeta(req)
        setServiceId(req.serviceId || 'medical')
        setProfessionalId(req.professionalId || `user-${req.advisorUserId}`)
        setDate(req.reviewDate || '')
        setReviewLocked(true)
        setStep(3)
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err?.message || 'This review request is no longer active.')
          setReviewLocked(false)
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingReview(false)
      })
    return () => {
      cancelled = true
    }
  }, [reviewRequestId])

  const service = services.find((item) => item.id === serviceId)
  const filteredProfessionals = professionals.filter(
    (item) => !serviceId || item.services?.includes(serviceId),
  )
  const professional =
    filteredProfessionals.find((item) => item.id === professionalId) ||
    professionals.find((item) => item.id === professionalId)

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
      duration: service.duration || reviewMeta?.duration || '30 min',
      audience,
    })
      .then((data) => {
        if (!cancelled) {
          setAvailability({
            ...data,
            availableSlots: filterAvailableSlotsForDate(data?.availableSlots || [], date),
          })
        }
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
  }, [professionalId, date, service, audience, reviewMeta?.duration])

  function canContinue() {
    if (step === 0) return Boolean(serviceId)
    if (step === 1) return Boolean(professionalId)
    if (step === 2) return Boolean(date)
    if (step === 3) return Boolean(time)
    return true
  }

  function timeRangeLabel(startTime, duration) {
    const start = parseTimeToMinutes(startTime)
    if (start == null) return startTime
    const end = formatMinutesToLabel(start + parseDurationMinutes(duration))
    return `${startTime} – ${end}`
  }

  function resetWizard() {
    setStep(0)
    setServiceId('')
    setProfessionalId('')
    setDate('')
    setTime('')
    setAvailability(null)
    setError('')
    setReviewLocked(false)
    setReviewMeta(null)
  }

  function appointmentFee() {
    if (audience !== 'CLIENT') return 0
    if (reviewLocked) return BOOKING_FEES.medical
    const fromCatalog = Number(service?.amount)
    if (Number.isFinite(fromCatalog) && fromCatalog > 0) return fromCatalog
    return BOOKING_FEES[service?.id] || 0
  }

  function openShortfall(required, current) {
    const balance = Number(current || 0)
    const price = Number(required || 0)
    setShortfall({
      current: balance,
      required: price,
      shortfall: Math.max(0, price - balance),
    })
  }

  async function handleConfirm() {
    if (isDateBeforeToday(date)) {
      setError(PAST_DATE_MESSAGE)
      setStep(2)
      return
    }
    const fee = appointmentFee()
    let checkedBalance = Number(wallet?.balance || 0)
    if (fee > 0) {
      try {
        const latest = await fetchWallet()
        setWallet(latest)
        checkedBalance = Number(latest?.balance || 0)
      } catch (err) {
        setError(err?.message || 'Unable to check your wallet balance. Please try again.')
        return
      }
      if (checkedBalance < fee) {
        openShortfall(fee, checkedBalance)
        return
      }
    }
    setSubmitting(true)
    setError('')
    try {
      if (reviewLocked && reviewRequestId) {
        await bookMedicalReviewRequest(reviewRequestId, { time })
        setToast('Medical review confirmed. Your dashboard will show the appointment.')
        navigate('/dashboard')
        return
      }
      await createClientAppointment({
        service: service?.name,
        serviceId: service?.id,
        professionalId: professional?.id || professionalId,
        professional: professional?.name || reviewMeta?.advisorName,
        professionalRole: professional?.role || 'Medical Advisor',
        professionalUserId: professional?.userId || reviewMeta?.advisorUserId,
        date,
        time,
        duration: service?.duration || '30 min',
        audience,
        notes: 'Please arrive 10 minutes early for check-in.',
        location: 'VitalLife Wellness Centre',
      })
      setToast('Appointment booked successfully. The professional has been notified.')
      resetWizard()
      setBookingsRefreshKey((key) => key + 1)
    } catch (err) {
      if (err?.code === 'INSUFFICIENT_BALANCE') {
        openShortfall(fee, checkedBalance)
        return
      }
      setError(
        err?.message ||
          'This time slot is no longer available. Please select another time.',
      )
      setStep(3)
      if (professionalId && date && service) {
        try {
          const data = await fetchProfessionalAvailability({
            professionalId,
            date,
            duration: service.duration || '30 min',
            audience,
          })
          setAvailability({
            ...data,
            availableSlots: filterAvailableSlotsForDate(data?.availableSlots || [], date),
          })
          setTime('')
        } catch {
          /* keep previous slots */
        }
      }
    } finally {
      setSubmitting(false)
    }
  }

  const listPath = successPath || (audience === 'STAFF' ? '/coach/dashboard' : '/client/appointments')
  const advisorLabel = professional?.name || reviewMeta?.advisorName || 'Medical Advisor'
  const serviceLabel = service?.name || reviewMeta?.serviceName || 'Medical Review'
  const durationLabel = service?.duration || reviewMeta?.duration || '30 min'
  const fee = appointmentFee()
  const balance = Number(wallet?.balance || 0)

  if (loadingReview) {
    return (
      <div>
        <PageHeader
          title="Book Appointment"
          description="Loading your medical review request…"
        />
        <p className="text-sm text-[var(--bf-muted)]">Please wait…</p>
      </div>
    )
  }

  return (
    <div>
      <PageHeader
        title={reviewLocked ? 'Choose Review Time' : 'Book Appointment'}
        description={
          reviewLocked
            ? 'Your Medical Advisor selected the date. Pick an available time to confirm.'
            : 'Pick a person, see their open hours, and book an available slot automatically.'
        }
      />

      {reviewLocked ? (
        <div className="mb-6 rounded-2xl border border-[#e8ecf1] bg-[#f7fbf9] px-4 py-4 text-sm text-[#374151]">
          <p>
            <span className="font-semibold text-[#111827]">Appointment Type:</span> {serviceLabel}
          </p>
          <p className="mt-1">
            <span className="font-semibold text-[#111827]">Medical Advisor:</span> {advisorLabel}
          </p>
          <p className="mt-1">
            <span className="font-semibold text-[#111827]">Date:</span>{' '}
            {reviewMeta?.reviewDateLabel || date}
          </p>
        </div>
      ) : (
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
      )}

      {error ? (
        <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-200">
          {error}
        </div>
      ) : null}

      <SectionCard>
        {step === 0 && !reviewLocked && (
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
                  {audience === 'CLIENT' && Number(item.amount || BOOKING_FEES[item.id]) > 0
                    ? ` · ${formatRs(item.amount || BOOKING_FEES[item.id])}`
                    : ''}
                </p>
              </button>
            ))}
          </div>
        )}

        {step === 1 && !reviewLocked && (
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

        {step === 2 && !reviewLocked && (
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
            {reviewLocked ? (
              <p className="text-sm font-semibold text-[#111827]">Choose a Time:</p>
            ) : null}
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
              <p className="text-[12px] text-[var(--bf-muted)]">
                Some times are already booked or blocked and are hidden below.
              </p>
            ) : null}

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
              {(availability?.availableSlots || []).map((slot) => (
                <button
                  key={slot}
                  type="button"
                  onClick={() => setTime(slot)}
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

            {!loadingSlots && !(availability?.availableSlots || []).length ? (
              <p className="text-sm text-[var(--bf-muted)]">
                No available times on this date. Please ask your advisor to pick another review date.
              </p>
            ) : null}
          </div>
        )}

        {(step === 4 || step === 5) && (
          <div className="space-y-3 text-sm text-[var(--bf-ink)]">
            <div className="flex items-start gap-3 rounded-2xl bf-neo-inset px-4 py-3">
              <CheckCircle2 className="mt-0.5 h-4 w-4 text-[var(--bf-ink)]" />
              <div>
                <p className="font-semibold">{serviceLabel}</p>
                <p className="mt-1 text-[var(--bf-muted)]">
                  with {advisorLabel}
                </p>
                <p className="mt-1 text-[var(--bf-muted)]">
                  {date} · {timeRangeLabel(time, durationLabel)}
                </p>
                {fee > 0 ? (
                  <p className="mt-2 font-semibold text-[var(--bf-ink)]">
                    Wallet payment {formatRs(fee)} · Balance {wallet ? formatRs(balance) : '—'}
                  </p>
                ) : null}
              </div>
            </div>
            {step === 5 ? (
              <p className="text-[var(--bf-muted)]">
                {fee > 0
                  ? 'Confirm to pay this fee from your wallet and reserve the slot.'
                  : 'Confirm to reserve this slot. Availability is checked again on the server.'}
              </p>
            ) : null}
          </div>
        )}

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <Button
            variant="outline"
            size="sm"
            disabled={submitting || (reviewLocked && step <= 3)}
            onClick={() => {
              if (reviewLocked && step > 3) {
                setStep(3)
                return
              }
              if (step === 0) {
                navigate(listPath)
                return
              }
              setStep((current) => Math.max(0, current - 1))
            }}
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </Button>

          {step < 5 ? (
            <Button
              size="sm"
              disabled={!canContinue() || submitting}
              onClick={() => setStep((current) => Math.min(5, current + 1))}
              className="!bg-[#005a40] hover:!bg-[#004833]"
            >
              Continue
              <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              size="sm"
              disabled={submitting || !time}
              onClick={handleConfirm}
              className="!bg-[#005a40] hover:!bg-[#004833]"
            >
              {submitting ? 'Booking…' : 'Confirm booking'}
            </Button>
          )}
        </div>
      </SectionCard>

      {!reviewLocked ? <YourBookingsSection refreshKey={bookingsRefreshKey} /> : null}
      <Toast message={toast} onClose={() => setToast('')} />
      <Modal
        open={Boolean(shortfall)}
        onClose={() => setShortfall(null)}
        title="Insufficient Wallet Balance"
        description="Your wallet does not have enough money to pay for this appointment. Add a cash top-up, then book again."
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setShortfall(null)}>
              Close
            </Button>
            <Button size="sm" to="/client/wallet/top-up" className="!bg-[#005a40] hover:!bg-[#004833]">
              Request Top-Up
            </Button>
          </>
        }
      >
        {shortfall ? (
          <dl className="grid gap-3 sm:grid-cols-3">
            <div>
              <dt className="text-[12px] font-medium text-[#8b93a1]">Current Balance</dt>
              <dd className="mt-1 text-sm font-semibold text-[#111827]">{formatRs(shortfall.current)}</dd>
            </div>
            <div>
              <dt className="text-[12px] font-medium text-[#8b93a1]">Required</dt>
              <dd className="mt-1 text-sm font-semibold text-[#111827]">{formatRs(shortfall.required)}</dd>
            </div>
            <div>
              <dt className="text-[12px] font-medium text-[#8b93a1]">Shortfall</dt>
              <dd className="mt-1 text-sm font-semibold text-[#111827]">{formatRs(shortfall.shortfall)}</dd>
            </div>
          </dl>
        ) : null}
      </Modal>
    </div>
  )
}
