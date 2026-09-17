import { useEffect, useMemo, useState } from 'react'
import { CalendarPlus } from 'lucide-react'
import Button from '../../../components/ui/Button'
import EmptyState from '../../../components/ui/EmptyState'
import ErrorState from '../../../components/ui/ErrorState'
import FilterTabs from '../../../components/ui/FilterTabs'
import LoadingSkeleton from '../../../components/ui/LoadingSkeleton'
import Modal from '../../../components/ui/Modal'
import PageHeader from '../../../components/ui/PageHeader'
import Toast from '../../../components/ui/Toast'
import AppointmentCard from './components/AppointmentCard'
import {
  cancelClientAppointment,
  fetchClientAppointments,
  formatAppointmentDate,
  formatAppointmentTimeRange,
  isPastAppointment,
  isUpcomingAppointment,
} from './data/appointmentData'

const tabs = [
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'past', label: 'Past' },
  { value: 'cancelled', label: 'Cancelled' },
]

export default function ClientAppointments() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [tab, setTab] = useState('upcoming')
  const [cancelTarget, setCancelTarget] = useState(null)
  const [cancelling, setCancelling] = useState(false)
  const [toast, setToast] = useState('')

  async function load() {
    setLoading(true)
    setError('')
    try {
      const data = await fetchClientAppointments()
      setItems(Array.isArray(data) ? data : [])
    } catch {
      setError('Unable to load appointments. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const filtered = useMemo(() => {
    if (tab === 'upcoming') return items.filter((item) => isUpcomingAppointment(item))
    if (tab === 'past') return items.filter((item) => isPastAppointment(item))
    if (tab === 'cancelled') {
      return items.filter((item) => String(item.status).toLowerCase() === 'cancelled')
    }
    return items
  }, [items, tab])

  async function handleConfirmCancel() {
    if (!cancelTarget) return
    setCancelling(true)
    try {
      await cancelClientAppointment(cancelTarget.id)
      setItems((prev) =>
        prev.map((item) =>
          item.id === cancelTarget.id ? { ...item, status: 'Cancelled' } : item,
        ),
      )
      setToast('Appointment cancelled successfully.')
      setCancelTarget(null)
    } catch (err) {
      setToast(err?.message || 'Unable to cancel this appointment.')
    } finally {
      setCancelling(false)
    }
  }

  if (loading) {
    return (
      <div>
        <PageHeader title="My Appointments" description="Loading your appointments..." />
        <LoadingSkeleton rows={3} />
      </div>
    )
  }
  if (error) {
    return (
      <ErrorState title={error} onRetry={load} />
    )
  }

  const emptyCopy = {
    upcoming: {
      title: "You don't have any upcoming appointments.",
      description: 'Book a consultation when you are ready for your next visit.',
    },
    past: {
      title: 'No past appointments yet',
      description: 'Completed and previous visits will appear here.',
    },
    cancelled: {
      title: 'No cancelled appointments',
      description: 'Cancelled bookings will be listed here for your records.',
    },
  }

  return (
    <div>
      <PageHeader
        title="My Appointments"
        description="Review upcoming sessions, revisit past visits, and manage your bookings."
        actions={
          <Button
            to="/client/appointments/book"
            className="!bg-[#005a40] !text-white hover:!bg-[#004833]"
          >
            <CalendarPlus className="h-4 w-4" strokeWidth={2.2} />
            Book Appointment
          </Button>
        }
      />

      <div className="mb-5">
        <FilterTabs
          ariaLabel="Appointment status"
          value={tab}
          onChange={setTab}
          options={tabs}
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={CalendarPlus}
          title={emptyCopy[tab].title}
          description={emptyCopy[tab].description}
          actionLabel={tab === 'upcoming' ? 'Book Appointment' : undefined}
          actionTo={tab === 'upcoming' ? '/client/appointments/book' : undefined}
        />
      ) : (
        <div className="space-y-4">
          {filtered.map((appointment) => (
            <AppointmentCard
              key={appointment.id}
              appointment={appointment}
              onCancel={setCancelTarget}
            />
          ))}
        </div>
      )}

      <Modal
        open={Boolean(cancelTarget)}
        onClose={() => !cancelling && setCancelTarget(null)}
        title="Cancel this appointment?"
        description="Are you sure you want to cancel this booking?"
        footer={
          <>
            <Button variant="outline" disabled={cancelling} onClick={() => setCancelTarget(null)}>
              Keep Appointment
            </Button>
            <Button
              disabled={cancelling}
              onClick={handleConfirmCancel}
              className="!bg-[#b45309] !text-white hover:!bg-[#92400e]"
            >
              {cancelling ? 'Cancelling…' : 'Cancel Appointment'}
            </Button>
          </>
        }
      >
        {cancelTarget ? (
          <p className="text-sm text-[#4b5563]">
            Are you sure you want to cancel your {cancelTarget.service} appointment on{' '}
            {formatAppointmentDate(cancelTarget.date)} at{' '}
            {formatAppointmentTimeRange(cancelTarget)}?
          </p>
        ) : null}
      </Modal>

      <Toast open={Boolean(toast)} message={toast} onClose={() => setToast('')} />
    </div>
  )
}
