import NutritionLayout from '../../components/layout/NutritionLayout'
import NutritionProgress from '../../features/nutrition/progress/NutritionProgress'

export default function NutritionProgressPage() {
  return (
    <NutritionLayout title="Nutrition Progress" breadcrumb="Nutrition Consultant">
      <NutritionProgress />
    </NutritionLayout>
  )
}
