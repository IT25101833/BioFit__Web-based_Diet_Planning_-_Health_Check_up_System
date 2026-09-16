import NutritionLayout from '../../components/layout/NutritionLayout'
import BookAppointment from '../../features/client/appointments/BookAppointment'

export default function NutritionBookAppointmentPage() {
  return (
    <NutritionLayout title="Book with Manager" breadcrumb="Nutrition / Book Appointment">
      <BookAppointment audience="STAFF" successPath="/nutrition/dashboard" />
    </NutritionLayout>
  )
}
