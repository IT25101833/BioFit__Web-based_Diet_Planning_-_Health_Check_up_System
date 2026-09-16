import MedicalLayout from '../../components/layout/MedicalLayout'
import BookAppointment from '../../features/client/appointments/BookAppointment'

export default function MedicalBookAppointmentPage() {
  return (
    <MedicalLayout title="Book with Manager" breadcrumb="Medical / Book Appointment">
      <BookAppointment audience="STAFF" successPath="/medical/dashboard" />
    </MedicalLayout>
  )
}
