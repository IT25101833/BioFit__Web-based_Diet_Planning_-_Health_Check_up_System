import NutritionLayout from '../../components/layout/NutritionLayout'
import MealPlans from '../../features/nutrition/meal-plans/MealPlans'

export default function NutritionMealPlansPage() {
  return (
    <NutritionLayout title="Meal Plans" breadcrumb="Nutrition Consultant">
      <MealPlans />
    </NutritionLayout>
  )
}
