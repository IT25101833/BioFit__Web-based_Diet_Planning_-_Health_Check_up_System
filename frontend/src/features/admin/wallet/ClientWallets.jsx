import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import PageHeader from '../../../components/ui/PageHeader'
import SectionCard from '../../../components/ui/SectionCard'
import StatusBadge from '../../../components/ui/StatusBadge'
import { fetchAdminWallets, formatRs } from '../../client/wallet/data/walletData'

export default function ClientWallets() {
  const [wallets, setWallets] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    fetchAdminWallets()
      .then((rows) => setWallets(Array.isArray(rows) ? rows : []))
      .catch((err) => setError(err?.message || 'Unable to load client wallets.'))
  }, [])

  return (
    <div className="space-y-5">
      <PageHeader
        title="Client Wallets"
        description="Balances change only when a cash top-up is approved or a service is paid from the wallet."
      />
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <SectionCard title="Client Wallets">
        {wallets.length === 0 ? (
          <p className="text-sm text-[#6b7280]">No client wallets yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead>
                <tr className="border-b border-[#eef2f0] text-[12px] uppercase tracking-wide text-[#8b93a1]">
                  <th className="px-2 py-2 font-semibold">Client</th>
                  <th className="px-2 py-2 font-semibold">Client ID</th>
                  <th className="px-2 py-2 font-semibold">Current Balance</th>
                  <th className="px-2 py-2 font-semibold">Wallet Status</th>
                  <th className="px-2 py-2 font-semibold">Last Transaction</th>
                  <th className="px-2 py-2 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {wallets.map((wallet) => (
                  <tr key={wallet.clientId} className="border-b border-[#f4f6fb]">
                    <td className="px-2 py-3 font-semibold text-[#111827]">{wallet.clientName}</td>
                    <td className="px-2 py-3">{wallet.clientCode}</td>
                    <td className="px-2 py-3">{formatRs(wallet.balance)}</td>
                    <td className="px-2 py-3">
                      <StatusBadge status={wallet.walletStatus === 'ACTIVE' ? 'active' : 'inactive'} />
                    </td>
                    <td className="px-2 py-3 text-[#4b5563]">
                      {wallet.lastTransaction
                        ? `${wallet.lastTransaction}${wallet.lastTransactionDate ? ` · ${wallet.lastTransactionDate}` : ''}`
                        : '—'}
                    </td>
                    <td className="px-2 py-3">
                      <Link className="font-semibold text-[#005a40]" to={`/admin/wallet/clients/${wallet.clientId}`}>
                        View Wallet
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>
    </div>
  )
}
