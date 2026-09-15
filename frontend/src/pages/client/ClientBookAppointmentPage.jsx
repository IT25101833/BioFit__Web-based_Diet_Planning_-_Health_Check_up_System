import DashboardShell from '../../components/dashboard/DashboardShell'
import BookAppointment from '../../features/client/appointments/BookAppointment'

export default function ClientBookAppointmentPage() {
  return (
    <DashboardShell title="Book Appointment">
      <BookAppointment />
    </DashboardShell>
  )
}
