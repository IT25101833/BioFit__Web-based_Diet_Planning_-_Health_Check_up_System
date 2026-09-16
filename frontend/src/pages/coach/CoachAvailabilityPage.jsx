import CoachLayout from '../../components/layout/CoachLayout'
import AvailabilityManager from '../../features/booking/AvailabilityManager'
import { findProfessionalByRoleKey } from '../../features/booking/bookingStore'

const pro = findProfessionalByRoleKey('FITNESS_COACH')

export default function CoachAvailabilityPage() {
  return (
    <CoachLayout title="My Availability" breadcrumb="Coach / Availability">
      <AvailabilityManager professionalId={pro?.id} />
    </CoachLayout>
  )
}
