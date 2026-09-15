import { useEffect, useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import Button from '../../../components/ui/Button'
import ErrorState from '../../../components/ui/ErrorState'
import LoadingSkeleton from '../../../components/ui/LoadingSkeleton'
import Modal from '../../../components/ui/Modal'
import PageHeader from '../../../components/ui/PageHeader'
import SectionCard from '../../../components/ui/SectionCard'
import StatusBadge from '../../../components/ui/StatusBadge'
import Toast from '../../../components/ui/Toast'
import {
  cancelClientAppointment,
  fetchClientAppointmentById,
  formatAppointmentDate,
} from './data/appointmentData'

export default function ClientAppointmentDetails() {
  const { id } = useParams()
  const [appointment, setAppointment] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [cancelOpen, setCancelOpen] = useState(false)
  const [toast, setToast] = useState('')

  async function load() {
    setLoading(true)
    setError('')
    try {
      const data = await fetchClientAppointmentById(id)
      setAppointment(data)
    } catch {
      setError('We couldn’t load this appointment.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [id])

  async function handleCancel() {
    await cancelClientAppointment(id)
    setAppointment((prev) => ({ ...prev, status: 'Cancelled' }))
    setCancelOpen(false)
    setToast('Appointment cancelled.')
  }

  if (loading) return <LoadingSkeleton rows={3} />
  if (error || !appointment) {
    return (
      <ErrorState
        title="We couldn’t load this appointment."
        onRetry={load}
      />
    )
  }

  const canModify = appointment.status === 'Upcoming'

  return (
    <div>
      <div className="mb-4">
        <Link
          to="/client/appointments"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#005a40] hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to appointments
        </Link>
      </div>

      <PageHeader
        title={appointment.service}
        description={`Booking reference ${appointment.bookingReference}`}
        actions={<StatusBadge status={appointment.status} />}
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <SectionCard title="Appointment details" className="lg:col-span-2">
          <DetailRow label="Type" value={appointment.service} />
          <DetailRow label="Date" value={formatAppointmentDate(appointment.date)} />
          <DetailRow label="Time" value={appointment.time} />
          <DetailRow label="Professional" value={appointment.professional} />
          <DetailRow label="Role" value={appointment.professionalRole} />
          <DetailRow label="Location" value={appointment.location} />
        </SectionCard>

        <SectionCard title="Notes & instructions">
          <p className="text-sm leading-relaxed text-[#4b5563]">
            {appointment.notes}
          </p>
        </SectionCard>
      </div>

      <div className="mt-5 flex flex-wrap gap-2.5">
        <Button
          to="/client/appointments"
          variant="outline"
          className="!border-[#e8ecf1] !text-[#4b5563]"
        >
          Back to Appointments
        </Button>
        {canModify ? (
          <>
            <Button
              to="/client/appointments/book"
              variant="outline"
              className="!border-[#005a40]/25 !text-[#005a40]"
            >
              Reschedule
            </Button>
            <Button
              onClick={() => setCancelOpen(true)}
              className="!bg-[#fff7ed] !text-[#b45309] hover:!bg-[#ffedd5]"
            >
              Cancel
            </Button>
          </>
        ) : null}
      </div>

      <Modal
        open={cancelOpen}
        onClose={() => setCancelOpen(false)}
        title="Cancel appointment?"
        description="You can book another time whenever you are ready."
        footer={
          <>
            <Button variant="outline" onClick={() => setCancelOpen(false)}>
              Keep appointment
            </Button>
            <Button
              onClick={handleCancel}
              className="!bg-[#b45309] !text-white hover:!bg-[#92400e]"
            >
              Confirm cancel
            </Button>
          </>
        }
      >
        <p className="text-sm text-[#4b5563]">
          This will cancel your {appointment.service} on{' '}
          {formatAppointmentDate(appointment.date)} at {appointment.time}.
        </p>
      </Modal>

      <Toast open={Boolean(toast)} message={toast} onClose={() => setToast('')} />
    </div>
  )
}

function DetailRow({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-[#eef2f0] py-3 last:border-0">
      <p className="text-[12px] font-medium text-[#8b93a1]">{label}</p>
      <p className="text-right text-sm font-semibold text-[#111827]">{value}</p>
    </div>
  )
}
