import DashboardShell from '../../components/dashboard/DashboardShell'
import ClientAppointments from '../../features/client/appointments/ClientAppointments'

export default function ClientAppointmentsPage() {
  return (
    <DashboardShell title="My Appointments">
      <ClientAppointments />
    </DashboardShell>
  )
}
