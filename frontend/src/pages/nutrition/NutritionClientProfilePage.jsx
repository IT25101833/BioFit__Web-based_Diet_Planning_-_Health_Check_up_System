import NutritionLayout from '../../components/layout/NutritionLayout'
import ClientNutritionProfile from '../../features/nutrition/clients/ClientNutritionProfile'

export default function NutritionClientProfilePage() {
  return (
    <NutritionLayout title="Client Nutrition Profile" breadcrumb="Nutrition Consultant / My Clients">
      <ClientNutritionProfile />
    </NutritionLayout>
  )
}
