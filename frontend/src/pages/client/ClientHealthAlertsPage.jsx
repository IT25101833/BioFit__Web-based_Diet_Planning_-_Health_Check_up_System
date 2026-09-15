import DashboardShell from '../../components/dashboard/DashboardShell'
import ClientHealthAlerts from '../../features/client/health/ClientHealthAlerts'

export default function ClientHealthAlertsPage() {
  return (
    <DashboardShell title="Health Risk Alerts">
      <ClientHealthAlerts />
    </DashboardShell>
  )
}
