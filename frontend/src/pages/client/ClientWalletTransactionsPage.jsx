import DashboardShell from '../../components/dashboard/DashboardShell'
import TransactionHistory from '../../features/client/wallet/TransactionHistory'

export default function ClientWalletTransactionsPage() {
  return (
    <DashboardShell title="Transaction History">
      <TransactionHistory />
    </DashboardShell>
  )
}
