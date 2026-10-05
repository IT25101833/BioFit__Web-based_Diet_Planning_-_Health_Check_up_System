import DashboardShell from '../../components/dashboard/DashboardShell'
import ClientPlanAccess from '../../features/client/plan-access/ClientPlanAccess'

export default function ClientPlanAccessPage() {
  return (
    <DashboardShell title="Access Requests">
      <ClientPlanAccess />
    </DashboardShell>
  )
}
