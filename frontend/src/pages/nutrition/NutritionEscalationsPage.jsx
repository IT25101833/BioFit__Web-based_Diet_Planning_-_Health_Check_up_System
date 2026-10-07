import NutritionLayout from '../../components/layout/NutritionLayout'
import SpecialistEscalationQueue from '../../features/specialist/SpecialistEscalationQueue'

export default function NutritionEscalationsPage() {
  return (
    <NutritionLayout title="Escalations" breadcrumb="Nutrition Consultant / Escalations">
      <SpecialistEscalationQueue
        title="Nutrition escalations"
        description="Cases support sent to the nutrition consultant."
        apiBase="/api/nutrition"
      />
    </NutritionLayout>
  )
}
