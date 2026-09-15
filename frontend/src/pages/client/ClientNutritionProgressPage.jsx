import DashboardShell from '../../components/dashboard/DashboardShell'
import ClientNutritionProgress from '../../features/client/nutrition/ClientNutritionProgress'

export default function ClientNutritionProgressPage() {
  return (
    <DashboardShell title="Nutrition Progress">
      <ClientNutritionProgress />
    </DashboardShell>
  )
}
