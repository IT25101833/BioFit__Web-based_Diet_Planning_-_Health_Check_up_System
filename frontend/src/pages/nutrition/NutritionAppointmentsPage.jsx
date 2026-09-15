import NutritionLayout from '../../components/layout/NutritionLayout'
import NutritionAppointments from '../../features/nutrition/appointments/NutritionAppointments'

export default function NutritionAppointmentsPage() {
  return (
    <NutritionLayout title="Appointments" breadcrumb="Nutrition Consultant">
      <NutritionAppointments />
    </NutritionLayout>
  )
}
