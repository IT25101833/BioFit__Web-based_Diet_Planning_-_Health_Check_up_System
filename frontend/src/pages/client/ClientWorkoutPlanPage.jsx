import DashboardShell from '../../components/dashboard/DashboardShell'
import ClientWorkoutPlan from '../../features/client/workout/ClientWorkoutPlan'

export default function ClientWorkoutPlanPage() {
  return (
    <DashboardShell title="My Workout Plan">
      <ClientWorkoutPlan />
    </DashboardShell>
  )
}
