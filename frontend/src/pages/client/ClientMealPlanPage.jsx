import DashboardShell from '../../components/dashboard/DashboardShell'
import ClientMealPlan from '../../features/client/nutrition/ClientMealPlan'

export default function ClientMealPlanPage() {
  return (
    <DashboardShell title="My Meal Plan">
      <ClientMealPlan />
    </DashboardShell>
  )
}
