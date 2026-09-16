import CoachLayout from '../../components/layout/CoachLayout'
import BookAppointment from '../../features/client/appointments/BookAppointment'

export default function CoachBookAppointmentPage() {
  return (
    <CoachLayout title="Book with Manager" breadcrumb="Coach / Book Appointment">
      <BookAppointment audience="STAFF" successPath="/coach/dashboard" />
    </CoachLayout>
  )
}
