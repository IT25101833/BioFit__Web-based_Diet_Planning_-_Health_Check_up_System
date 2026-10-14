import CoachLayout from '../../components/layout/CoachLayout'
import CoachAppointments from '../../features/coach/appointments/CoachAppointments'

export default function CoachAppointmentsPage() {
  return (
    <CoachLayout title="Appointments" breadcrumb="Fitness Coach / Appointments">
      <CoachAppointments />
    </CoachLayout>
  )
}
