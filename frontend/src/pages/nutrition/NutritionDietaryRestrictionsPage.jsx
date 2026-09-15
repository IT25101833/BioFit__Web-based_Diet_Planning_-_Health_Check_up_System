import NutritionLayout from '../../components/layout/NutritionLayout'
import DietaryRestrictions from '../../features/nutrition/dietary-restrictions/DietaryRestrictions'

export default function NutritionDietaryRestrictionsPage() {
  return (
    <NutritionLayout title="Dietary Restrictions" breadcrumb="Nutrition Consultant">
      <DietaryRestrictions />
    </NutritionLayout>
  )
}
