import { useEffect, useMemo, useState } from 'react'
import { CalendarPlus } from 'lucide-react'
import Button from '../../../components/ui/Button'
import EmptyState from '../../../components/ui/EmptyState'
import ErrorState from '../../../components/ui/ErrorState'
import FilterTabs from '../../../components/ui/FilterTabs'
import LoadingSkeleton from '../../../components/ui/LoadingSkeleton'
import PageHeader from '../../../components/ui/PageHeader'
import AppointmentCard from './components/AppointmentCard'
import { fetchClientAppointments } from './data/appointmentData'

const tabs = [
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
]

export default function ClientAppointments() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [tab, setTab] = useState('upcoming')

  async function load() {
    setLoading(true)
    setError('')
    try {
      const data = await fetchClientAppointments()
      setItems(data)
    } catch {
      setError('We couldn’t load your appointments right now.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const filtered = useMemo(() => {
    const map = {
      upcoming: 'Upcoming',
      completed: 'Completed',
      cancelled: 'Cancelled',
    }
    return items.filter((item) => item.status === map[tab])
  }, [items, tab])

  if (loading) return <LoadingSkeleton rows={3} />
  if (error) {
    return (
      <ErrorState
        title="We couldn’t load your appointments right now."
        onRetry={load}
      />
    )
  }

  return (
    <div>
      <PageHeader
        title="My Appointments"
        description="Review upcoming sessions and revisit past wellness visits."
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
          title={`No ${tab} appointments`}
          description="Book a consultation when you're ready for your next visit."
          actionLabel="Book Appointment"
          actionTo="/client/appointments/book"
        />
      ) : (
        <div className="space-y-4">
          {filtered.map((appointment) => (
            <AppointmentCard key={appointment.id} appointment={appointment} />
          ))}
        </div>
      )}
    </div>
  )
}
