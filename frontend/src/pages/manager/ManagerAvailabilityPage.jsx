import ManagerLayout from '../../components/layout/ManagerLayout'
import AvailabilityManager from '../../features/booking/AvailabilityManager'

export default function ManagerAvailabilityPage() {
  return (
    <ManagerLayout title="Staff Availability" breadcrumb="Manager / Availability">
      <AvailabilityManager
        allowProfessionalPick
        title="Staff availability"
        description="Set working hours and unavailable blocks for any stakeholder. Booking slots update automatically."
      />
    </ManagerLayout>
  )
}
