import NutritionLayout from '../../components/layout/NutritionLayout'
import NutritionProfile from '../../features/nutrition/profile/NutritionProfile'

export default function NutritionProfilePage() {
  return (
    <NutritionLayout title="My Profile" breadcrumb="Nutrition Consultant">
      <NutritionProfile />
    </NutritionLayout>
  )
}
