import MedicalLayout from '../../components/layout/MedicalLayout'
import AvailabilityManager from '../../features/booking/AvailabilityManager'
import { findProfessionalByRoleKey } from '../../features/booking/bookingStore'

const pro = findProfessionalByRoleKey('MEDICAL_ADVISOR')

export default function MedicalAvailabilityPage() {
  return (
    <MedicalLayout title="My Availability" breadcrumb="Medical / Availability">
      <AvailabilityManager professionalId={pro?.id} />
    </MedicalLayout>
  )
}
