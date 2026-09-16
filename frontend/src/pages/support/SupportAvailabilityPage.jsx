import SupportLayout from '../../components/layout/SupportLayout'
import AvailabilityManager from '../../features/booking/AvailabilityManager'
import { findProfessionalByRoleKey } from '../../features/booking/bookingStore'

const pro = findProfessionalByRoleKey('CUSTOMER_EXPERIENCE_OFFICER')

export default function SupportAvailabilityPage() {
  return (
    <SupportLayout title="My Availability" breadcrumb="Support / Availability">
      <AvailabilityManager professionalId={pro?.id} />
    </SupportLayout>
  )
}
