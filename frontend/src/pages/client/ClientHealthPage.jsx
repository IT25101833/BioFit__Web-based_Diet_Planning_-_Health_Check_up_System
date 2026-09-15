import DashboardShell from '../../components/dashboard/DashboardShell'
import ClientHealth from '../../features/client/health/ClientHealth'

export default function ClientHealthPage() {
  return (
    <DashboardShell title="My Health">
      <ClientHealth />
    </DashboardShell>
  )
}
