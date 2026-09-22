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
  formatAppointmentDateLong,
  formatAppointmentTimeRange,
  formatDurationLabel,
  isAdvisorUnavailableAppointment,
} from './data/appointmentData'

export default function ClientAppointmentDetails() {
  const { id } = useParams()
  const [appointment, setAppointment] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [cancelOpen, setCancelOpen] = useState(false)
  const [cancelling, setCancelling] = useState(false)
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
    setCancelling(true)
    try {
      await cancelClientAppointment(id)
      setAppointment((prev) => ({ ...prev, status: 'Cancelled' }))
      setCancelOpen(false)
      setToast('Appointment cancelled successfully.')
    } catch (err) {
      setToast(err?.message || 'Unable to cancel this appointment.')
    } finally {
      setCancelling(false)
    }
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

  const advisorUnavailable = isAdvisorUnavailableAppointment(appointment)
  const statusForBadge =
    String(appointment.attendance || '').toUpperCase() === 'ATTENDED'
      ? 'Completed'
      : appointment.status
  const canModify = String(appointment.status).toLowerCase() === 'upcoming' && !advisorUnavailable
  const canReschedule = canModify || advisorUnavailable

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
        description={`Booking reference ${appointment.bookingReference || '—'}`}
        actions={<StatusBadge status={statusForBadge} />}
      />

      {advisorUnavailable ? (
        <p className="mb-4 rounded-xl border border-[#fde68a] bg-[#fffbeb] px-4 py-3 text-sm text-[#b45309]">
          Advisor unavailable
          {appointment.attendanceNote ? `: ${appointment.attendanceNote}` : ''}
        </p>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-3">
        <SectionCard title="Appointment details" className="lg:col-span-2">
          <DetailRow label="Service" value={appointment.service} />
          <DetailRow label="Professional" value={appointment.professional} />
          <DetailRow label="Role" value={appointment.professionalRole} />
          <DetailRow label="Date" value={formatAppointmentDateLong(appointment.date)} />
          <DetailRow label="Time" value={formatAppointmentTimeRange(appointment)} />
          <DetailRow label="Duration" value={formatDurationLabel(appointment.duration)} />
          <DetailRow label="Status" value={statusForBadge} />
          <DetailRow label="Location" value={appointment.location || '—'} />
        </SectionCard>

        <SectionCard title="Notes & instructions">
          <p className="text-sm leading-relaxed text-[#4b5563]">
            {appointment.notes || 'No additional notes for this appointment.'}
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
        {canReschedule ? (
          <Button
            to={`/client/appointments/${appointment.id}/reschedule`}
            variant="outline"
            className="!border-[#005a40]/25 !text-[#005a40]"
          >
            Reschedule Appointment
          </Button>
        ) : null}
        {canModify ? (
          <Button
            onClick={() => setCancelOpen(true)}
            className="!bg-[#fff7ed] !text-[#b45309] hover:!bg-[#ffedd5]"
          >
            Cancel Appointment
          </Button>
        ) : null}
      </div>

      <Modal
        open={cancelOpen}
        onClose={() => !cancelling && setCancelOpen(false)}
        title="Cancel this appointment?"
        description="Are you sure you want to cancel this booking?"
        footer={
          <>
            <Button variant="outline" disabled={cancelling} onClick={() => setCancelOpen(false)}>
              Keep Appointment
            </Button>
            <Button
              disabled={cancelling}
              onClick={handleCancel}
              className="!bg-[#b45309] !text-white hover:!bg-[#92400e]"
            >
              {cancelling ? 'Cancelling…' : 'Cancel Appointment'}
            </Button>
          </>
        }
      >
        <p className="text-sm text-[#4b5563]">
          Are you sure you want to cancel your {appointment.service} appointment on{' '}
          {formatAppointmentDateLong(appointment.date)} at{' '}
          {formatAppointmentTimeRange(appointment)}?
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
