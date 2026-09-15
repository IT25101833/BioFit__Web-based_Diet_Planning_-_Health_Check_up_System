import { useMemo, useState } from 'react'
import { CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import Button from '../../../components/ui/Button'
import PageHeader from '../../../components/ui/PageHeader'
import SectionCard from '../../../components/ui/SectionCard'
import Toast from '../../../components/ui/Toast'
import {
  availableSlots,
  bookingProfessionals,
  bookingServices,
  createClientAppointment,
} from './data/appointmentData'

const steps = [
  'Service',
  'Professional',
  'Date',
  'Time',
  'Review',
  'Confirm',
]

function buildDateOptions() {
  const dates = []
  const start = new Date('2026-09-10T00:00:00')
  for (let i = 0; i < 14; i += 1) {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    if (d.getDay() === 0) continue
    dates.push(d.toISOString().slice(0, 10))
  }
  return dates
}

export default function BookAppointment() {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [serviceId, setServiceId] = useState('')
  const [professionalId, setProfessionalId] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [toast, setToast] = useState('')
  const dateOptions = useMemo(() => buildDateOptions(), [])

  const service = bookingServices.find((item) => item.id === serviceId)
  const professionals = bookingProfessionals[serviceId] || []
  const professional = professionals.find((item) => item.id === professionalId)

  function canContinue() {
    if (step === 0) return Boolean(serviceId)
    if (step === 1) return Boolean(professionalId)
    if (step === 2) return Boolean(date)
    if (step === 3) return Boolean(time)
    return true
  }

  async function handleConfirm() {
    setSubmitting(true)
    try {
      const created = await createClientAppointment({
        service: service?.name,
        professional: professional?.name,
        professionalRole: professional?.role,
        date,
        time,
        notes: 'Please arrive 10 minutes early for check-in.',
        location: 'VitalLife Wellness Centre',
      })
      setToast('Appointment booked successfully.')
      window.setTimeout(() => {
        navigate(`/client/appointments/${created.id}`)
      }, 700)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      <PageHeader
        title="Book Appointment"
        description="Choose a service, professional, and a time that works for you."
      />

      <div className="mb-6 flex flex-wrap gap-2" aria-label="Booking steps">
        {steps.map((label, index) => (
          <span
            key={label}
            className={[
              'rounded-full px-3 py-1.5 text-[12px] font-semibold',
              index === step
                ? 'bg-[#005a40] text-white'
                : index < step
                  ? 'bg-[#e6f5f0] text-[#005a40]'
                  : 'bg-[#f4f6fb] text-[#8b93a1]',
            ].join(' ')}
          >
            {index + 1}. {label}
          </span>
        ))}
      </div>

      <SectionCard>
        {step === 0 && (
          <div className="grid gap-3 sm:grid-cols-2">
            {bookingServices.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setServiceId(item.id)
                  setProfessionalId('')
                }}
                className={[
                  'rounded-2xl border px-4 py-4 text-left transition-colors',
                  serviceId === item.id
                    ? 'border-[#005a40] bg-[#e6f5f0]'
                    : 'border-[#e8ecf1] hover:bg-[#f8faf9]',
                ].join(' ')}
              >
                <p className="font-semibold text-[#111827]">{item.name}</p>
                <p className="mt-1 text-[12px] text-[#6b7280]">{item.description}</p>
                <p className="mt-2 text-[11px] font-semibold text-[#005a40]">
                  {item.duration}
                </p>
              </button>
            ))}
          </div>
        )}

        {step === 1 && (
          <div className="grid gap-3 sm:grid-cols-2">
            {professionals.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setProfessionalId(item.id)}
                className={[
                  'rounded-2xl border px-4 py-4 text-left transition-colors',
                  professionalId === item.id
                    ? 'border-[#005a40] bg-[#e6f5f0]'
                    : 'border-[#e8ecf1] hover:bg-[#f8faf9]',
                ].join(' ')}
              >
                <p className="font-semibold text-[#111827]">{item.name}</p>
                <p className="mt-1 text-[12px] text-[#6b7280]">{item.role}</p>
              </button>
            ))}
          </div>
        )}

        {step === 2 && (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
            {dateOptions.map((iso) => {
              const label = new Date(`${iso}T00:00:00`).toLocaleDateString(
                'en-GB',
                { weekday: 'short', day: 'numeric', month: 'short' },
              )
              return (
                <button
                  key={iso}
                  type="button"
                  onClick={() => setDate(iso)}
                  className={[
                    'rounded-2xl border px-3 py-3 text-sm font-semibold transition-colors',
                    date === iso
                      ? 'border-[#005a40] bg-[#e6f5f0] text-[#005a40]'
                      : 'border-[#e8ecf1] text-[#374151] hover:bg-[#f8faf9]',
                  ].join(' ')}
                >
                  {label}
                </button>
              )
            })}
          </div>
        )}

        {step === 3 && (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {availableSlots.map((slot) => (
              <button
                key={slot}
                type="button"
                onClick={() => setTime(slot)}
                className={[
                  'rounded-2xl border px-3 py-3 text-sm font-semibold transition-colors',
                  time === slot
                    ? 'border-[#005a40] bg-[#e6f5f0] text-[#005a40]'
                    : 'border-[#e8ecf1] text-[#374151] hover:bg-[#f8faf9]',
                ].join(' ')}
              >
                {slot}
              </button>
            ))}
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
            {step === 5 ? (
              <p className="rounded-2xl bg-[#e6f5f0] px-4 py-3 text-[#005a40]">
                Ready to confirm. You can reschedule later from your appointments
                list if needed.
              </p>
            ) : null}
          </div>
        )}

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <Button
            variant="outline"
            onClick={() => (step === 0 ? navigate('/client/appointments') : setStep(step - 1))}
            className="!border-[#e8ecf1] !text-[#4b5563]"
          >
            <ChevronLeft className="h-4 w-4" />
            {step === 0 ? 'Cancel' : 'Back'}
          </Button>

          {step < 5 ? (
            <Button
              disabled={!canContinue()}
              onClick={() => setStep(step + 1)}
              className="!bg-[#005a40] !text-white hover:!bg-[#004833]"
            >
              Continue
              <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              disabled={submitting}
              onClick={handleConfirm}
              className="!bg-[#005a40] !text-white hover:!bg-[#004833]"
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
    <div className="flex items-center justify-between gap-4 border-b border-[#eef2f0] py-3 last:border-0">
      <span className="text-[#8b93a1]">{label}</span>
      <span className="font-semibold text-[#111827]">{value || '—'}</span>
    </div>
  )
}
