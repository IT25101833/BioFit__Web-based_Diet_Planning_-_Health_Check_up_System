import DashboardShell from '../../components/dashboard/DashboardShell'
import WalletOverview from '../../features/client/wallet/WalletOverview'

export default function ClientWalletPage() {
  return (
    <DashboardShell title="Wallet">
      <WalletOverview />
    </DashboardShell>
  )
}
