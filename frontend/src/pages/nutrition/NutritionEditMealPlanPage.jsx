import NutritionLayout from '../../components/layout/NutritionLayout'
import CreateEditMealPlan from '../../features/nutrition/meal-plans/CreateEditMealPlan'

export default function NutritionEditMealPlanPage() {
  return (
    <NutritionLayout title="Edit Meal Plan" breadcrumb="Nutrition Consultant / Meal Plans">
      <CreateEditMealPlan mode="edit" />
    </NutritionLayout>
  )
}
