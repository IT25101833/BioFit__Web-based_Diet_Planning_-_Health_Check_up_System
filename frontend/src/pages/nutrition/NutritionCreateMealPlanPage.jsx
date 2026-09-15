import NutritionLayout from '../../components/layout/NutritionLayout'
import CreateEditMealPlan from '../../features/nutrition/meal-plans/CreateEditMealPlan'

export default function NutritionCreateMealPlanPage() {
  return (
    <NutritionLayout title="Create Meal Plan" breadcrumb="Nutrition Consultant / Meal Plans">
      <CreateEditMealPlan mode="create" />
    </NutritionLayout>
  )
}
