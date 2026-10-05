import { useEffect, useMemo, useState } from 'react'
import PageHeader from '../../../components/ui/PageHeader'
import SectionCard from '../../../components/ui/SectionCard'
import Select from '../../../components/ui/Select'
import StatusBadge from '../../../components/ui/StatusBadge'
import { fetchAdminWalletTransactions, formatRs, formatSignedRs } from '../../client/wallet/data/walletData'

const filters = [
  { value: 'ALL', label: 'All' },
  { value: 'CREDIT', label: 'Credit' },
  { value: 'DEBIT', label: 'Debit' },
  { value: 'CASH', label: 'Cash' },
  { value: 'WALLET', label: 'Wallet' },
  { value: 'SUCCESS', label: 'Success' },
  { value: 'FAILED', label: 'Failed' },
]

export default function WalletTransactions() {
  const [rows, setRows] = useState([])
  const [filter, setFilter] = useState('ALL')
  const [error, setError] = useState('')

  useEffect(() => {
    fetchAdminWalletTransactions()
      .then((data) => setRows(Array.isArray(data) ? data : []))
      .catch((err) => setError(err?.message || 'Unable to load transactions.'))
  }, [])

  const visible = useMemo(() => {
    return rows.filter((row) => {
      if (filter === 'ALL') return true
      if (filter === 'CREDIT' || filter === 'DEBIT') return row.type === filter
      if (filter === 'CASH' || filter === 'WALLET') return row.paymentMethod === filter
      if (filter === 'SUCCESS') return row.status === 'SUCCESS' || row.status === 'APPROVED'
      if (filter === 'FAILED') return row.status === 'FAILED'
      return true
    })
  }, [rows, filter])

  return (
    <div className="space-y-5">
      <PageHeader title="Wallet Transactions" description="Every credit and debit recorded on a client wallet." />
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <SectionCard title="Transactions">
        <div className="mb-4 max-w-xs">
          <Select
            label="Filter"
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
            options={filters}
          />
        </div>
        {visible.length === 0 ? (
          <p className="text-sm text-[#6b7280]">No transactions match this filter.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-left text-sm">
              <thead>
                <tr className="border-b border-[#eef2f0] text-[12px] uppercase tracking-wide text-[#8b93a1]">
                  <th className="px-2 py-2 font-semibold">Transaction ID</th>
                  <th className="px-2 py-2 font-semibold">Client</th>
                  <th className="px-2 py-2 font-semibold">Type</th>
                  <th className="px-2 py-2 font-semibold">Amount</th>
                  <th className="px-2 py-2 font-semibold">Payment Method</th>
                  <th className="px-2 py-2 font-semibold">Description</th>
                  <th className="px-2 py-2 font-semibold">Balance After</th>
                  <th className="px-2 py-2 font-semibold">Date</th>
                  <th className="px-2 py-2 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((row) => (
                  <tr key={row.id} className="border-b border-[#f4f6fb]">
                    <td className="px-2 py-3 font-semibold">{row.transactionId || row.reference}</td>
                    <td className="px-2 py-3">
                      <p>{row.clientName || '—'}</p>
                      <p className="text-[12px] text-[#6b7280]">{row.clientCode}</p>
                    </td>
                    <td className="px-2 py-3">{row.type}</td>
                    <td className="px-2 py-3 font-semibold">{formatSignedRs(row.type, row.amount)}</td>
                    <td className="px-2 py-3">{row.paymentMethod}</td>
                    <td className="px-2 py-3">{row.description}</td>
                    <td className="px-2 py-3">{formatRs(row.balanceAfter)}</td>
                    <td className="px-2 py-3">{row.dateLabel}</td>
                    <td className="px-2 py-3">
                      <StatusBadge status={row.status === 'APPROVED' ? 'success' : row.status} />
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
