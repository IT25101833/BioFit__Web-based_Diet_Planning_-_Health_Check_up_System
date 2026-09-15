import NutritionLayout from '../../components/layout/NutritionLayout'
import ClientNutritionProgressDetails from '../../features/nutrition/progress/ClientNutritionProgressDetails'

export default function NutritionClientProgressPage() {
  return (
    <NutritionLayout title="Client Nutrition Progress" breadcrumb="Nutrition Consultant / Progress">
      <ClientNutritionProgressDetails />
    </NutritionLayout>
  )
}
