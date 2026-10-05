import DashboardShell from '../../components/dashboard/DashboardShell'
import TopUpRequests from '../../features/client/wallet/TopUpRequests'

export default function ClientWalletRequestsPage() {
  return (
    <DashboardShell title="Top-Up Requests">
      <TopUpRequests />
    </DashboardShell>
  )
}
