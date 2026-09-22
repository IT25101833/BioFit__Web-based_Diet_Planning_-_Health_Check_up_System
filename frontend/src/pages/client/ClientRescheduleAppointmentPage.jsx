import DashboardShell from '../../components/dashboard/DashboardShell'
import RescheduleAppointment from '../../features/client/appointments/RescheduleAppointment'

export default function ClientRescheduleAppointmentPage() {
  return (
    <DashboardShell title="Reschedule Appointment">
      <RescheduleAppointment />
    </DashboardShell>
  )
}
