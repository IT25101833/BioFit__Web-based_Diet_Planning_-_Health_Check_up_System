import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import PageHeader from '../../../components/ui/PageHeader'
import SectionCard from '../../../components/ui/SectionCard'
import StatusBadge from '../../../components/ui/StatusBadge'
import { fetchAdminWallet, formatRs, formatSignedRs } from '../../client/wallet/data/walletData'

export default function ClientWalletDetail() {
  const { clientId } = useParams()
  const [wallet, setWallet] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchAdminWallet(clientId)
      .then(setWallet)
      .catch((err) => setError(err?.message || 'Unable to open this wallet.'))
  }, [clientId])

  const transactions = Array.isArray(wallet?.transactions) ? wallet.transactions : []

  return (
    <div className="space-y-5">
      <PageHeader title="Client Wallet" description="Cash is credited only after a top-up request is approved." />
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {wallet ? (
        <SectionCard title={wallet.clientName}>
          <dl className="grid gap-3 sm:grid-cols-2">
            <Item label="Client" value={wallet.clientName} />
            <Item label="Client ID" value={wallet.clientCode} />
            <Item label="Current Balance" value={formatRs(wallet.balance)} />
            <div>
              <dt className="text-[12px] font-medium text-[#8b93a1]">Wallet Status</dt>
              <dd className="mt-1">
                <StatusBadge status={wallet.walletStatus === 'ACTIVE' ? 'active' : 'inactive'} />
              </dd>
            </div>
          </dl>
        </SectionCard>
      ) : null}
      <SectionCard title="Transaction History">
        {transactions.length === 0 ? (
          <p className="text-sm text-[#6b7280]">No transactions yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead>
                <tr className="border-b border-[#eef2f0] text-[12px] uppercase tracking-wide text-[#8b93a1]">
                  <th className="px-2 py-2 font-semibold">Date</th>
                  <th className="px-2 py-2 font-semibold">Type</th>
                  <th className="px-2 py-2 font-semibold">Description</th>
                  <th className="px-2 py-2 font-semibold">Amount</th>
                  <th className="px-2 py-2 font-semibold">Balance After</th>
                  <th className="px-2 py-2 font-semibold">Reference</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((row) => (
                  <tr key={row.id} className="border-b border-[#f4f6fb]">
                    <td className="px-2 py-3">{row.dateLabel}</td>
                    <td className="px-2 py-3">{row.type}</td>
                    <td className="px-2 py-3">{row.description}</td>
                    <td className="px-2 py-3 font-semibold">{formatSignedRs(row.type, row.amount)}</td>
                    <td className="px-2 py-3">{formatRs(row.balanceAfter)}</td>
                    <td className="px-2 py-3">{row.reference}</td>
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

function Item({ label, value }) {
  return (
    <div>
      <dt className="text-[12px] font-medium text-[#8b93a1]">{label}</dt>
      <dd className="mt-1 text-sm font-semibold text-[#111827]">{value || '—'}</dd>
    </div>
  )
}
