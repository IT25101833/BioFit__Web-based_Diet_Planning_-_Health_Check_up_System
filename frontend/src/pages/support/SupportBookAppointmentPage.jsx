import SupportLayout from '../../components/layout/SupportLayout'
import BookAppointment from '../../features/client/appointments/BookAppointment'

export default function SupportBookAppointmentPage() {
  return (
    <SupportLayout title="Book with Manager" breadcrumb="Support / Book Appointment">
      <BookAppointment audience="STAFF" successPath="/support/dashboard" />
    </SupportLayout>
  )
}
