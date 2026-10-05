import { useEffect, useState } from 'react'
import PageHeader from '../../../components/ui/PageHeader'
import SectionCard from '../../../components/ui/SectionCard'
import StatusBadge from '../../../components/ui/StatusBadge'
import { fetchWalletTransactions, formatRs, formatSignedRs } from './data/walletData'

export default function TransactionHistory() {
  const [rows, setRows] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    fetchWalletTransactions()
      .then((data) => setRows(Array.isArray(data) ? data : []))
      .catch((err) => setError(err?.message || 'Unable to load transactions.'))
  }, [])

  return (
    <div className="space-y-5">
      <PageHeader title="Transaction History" description="Credits are added only after Admin approves a cash top-up." />
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <SectionCard title="Transactions">
        {rows.length === 0 ? (
          <p className="text-sm text-[#6b7280]">No wallet transactions yet.</p>
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
                  <th className="px-2 py-2 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id} className="border-b border-[#f4f6fb]">
                    <td className="px-2 py-3">{row.dateLabel}</td>
                    <td className="px-2 py-3">{row.type}</td>
                    <td className="px-2 py-3">{row.description}</td>
                    <td className="px-2 py-3 font-semibold">{formatSignedRs(row.type, row.amount)}</td>
                    <td className="px-2 py-3">{formatRs(row.balanceAfter)}</td>
                    <td className="px-2 py-3">{row.reference}</td>
                    <td className="px-2 py-3">
                      <StatusBadge status={row.status} />
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
