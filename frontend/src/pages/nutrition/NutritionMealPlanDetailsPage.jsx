import NutritionLayout from '../../components/layout/NutritionLayout'
import MealPlanDetails from '../../features/nutrition/meal-plans/MealPlanDetails'

export default function NutritionMealPlanDetailsPage() {
  return (
    <NutritionLayout title="Meal Plan Details" breadcrumb="Nutrition Consultant / Meal Plans">
      <MealPlanDetails />
    </NutritionLayout>
  )
}
