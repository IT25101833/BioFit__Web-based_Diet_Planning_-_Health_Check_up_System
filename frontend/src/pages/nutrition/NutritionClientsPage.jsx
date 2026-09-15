import NutritionLayout from '../../components/layout/NutritionLayout'
import NutritionClients from '../../features/nutrition/clients/NutritionClients'

export default function NutritionClientsPage() {
  return (
    <NutritionLayout title="My Clients" breadcrumb="Nutrition Consultant">
      <NutritionClients />
    </NutritionLayout>
  )
}
