import NutritionLayout from '../../components/layout/NutritionLayout'
import AvailabilityManager from '../../features/booking/AvailabilityManager'
import { findProfessionalByRoleKey } from '../../features/booking/bookingStore'

const pro = findProfessionalByRoleKey('NUTRITION_CONSULTANT')

export default function NutritionAvailabilityPage() {
  return (
    <NutritionLayout title="My Availability" breadcrumb="Nutrition / Availability">
      <AvailabilityManager professionalId={pro?.id} />
    </NutritionLayout>
  )
}
