import DashboardShell from '../../components/dashboard/DashboardShell'
import ClientFitnessProgress from '../../features/client/workout/ClientFitnessProgress'

export default function ClientFitnessProgressPage() {
  return (
    <DashboardShell title="Fitness Progress">
      <ClientFitnessProgress />
    </DashboardShell>
  )
}
