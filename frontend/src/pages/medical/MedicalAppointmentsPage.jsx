import MedicalLayout from '../../components/layout/MedicalLayout'
import MedicalAppointments from '../../features/medical/appointments/MedicalAppointments'

export default function MedicalAppointmentsPage() {
  return (
    <MedicalLayout title="Appointments" breadcrumb="Medical Advisor / Appointments">
      <MedicalAppointments />
    </MedicalLayout>
  )
}
