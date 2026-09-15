import NutritionLayout from '../../components/layout/NutritionLayout'
import NutritionDashboard from '../../features/nutrition/dashboard/NutritionDashboard'

export default function NutritionDashboardPage() {
  return (
    <NutritionLayout title="Dashboard" breadcrumb="Nutrition Consultant">
      <NutritionDashboard />
    </NutritionLayout>
  )
}
