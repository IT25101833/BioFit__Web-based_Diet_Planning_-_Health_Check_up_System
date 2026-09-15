import NutritionLayout from '../../components/layout/NutritionLayout'
import NutritionNotifications from '../../features/nutrition/notifications/NutritionNotifications'

export default function NutritionNotificationsPage() {
  return (
    <NutritionLayout title="Notifications" breadcrumb="Nutrition Consultant">
      <NutritionNotifications />
    </NutritionLayout>
  )
}
