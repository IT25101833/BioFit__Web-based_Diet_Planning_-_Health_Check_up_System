import DashboardShell from '../../components/dashboard/DashboardShell'
import RequestCashTopUp from '../../features/client/wallet/RequestCashTopUp'

export default function ClientWalletTopUpPage() {
  return (
    <DashboardShell title="Request Cash Top-Up">
      <RequestCashTopUp />
    </DashboardShell>
  )
}
