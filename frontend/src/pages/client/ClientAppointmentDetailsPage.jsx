import DashboardShell from '../../components/dashboard/DashboardShell'
import ClientAppointmentDetails from '../../features/client/appointments/ClientAppointmentDetails'

export default function ClientAppointmentDetailsPage() {
  return (
    <DashboardShell title="Appointment Details">
      <ClientAppointmentDetails />
    </DashboardShell>
  )
}
