import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Input from '../../../components/ui/Input'
import PageHeader from '../../../components/ui/PageHeader'
import SectionCard from '../../../components/ui/SectionCard'
import Select from '../../../components/ui/Select'
import StatusBadge from '../../../components/ui/StatusBadge'
import { fetchAdminTopUps, formatRs } from '../../client/wallet/data/walletData'

export default function WalletManagement() {
  const [status, setStatus] = useState('ALL')
  const [date, setDate] = useState('')
  const [q, setQ] = useState('')
  const [requests, setRequests] = useState([])
  const [error, setError] = useState('')

  async function load(next = {}) {
    const selected = next.date ?? date
    const result = await fetchAdminTopUps({
      status: next.status ?? status,
      range: selected ? 'CUSTOM' : 'ALL',
      from: selected,
      to: selected,
      q: next.q ?? q,
    })
    setRequests(Array.isArray(result?.requests) ? result.requests : [])
  }

  useEffect(() => {
    load().catch((err) => setError(err?.message || 'Unable to load top-up requests.'))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="space-y-5">
      <PageHeader
        title="Wallet Top-Up Requests"
        description="Check the client, the amount, and the cash receipt before the wallet is credited."
      />
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <SectionCard title="Top-Up Requests">
        <div className="mb-4 grid gap-3 md:grid-cols-3">
          <Input
            label="Search"
            value={q}
            onChange={(event) => {
              const value = event.target.value
              setQ(value)
              load({ q: value }).catch((err) => setError(err?.message || 'Unable to search requests.'))
            }}
            placeholder="Search client / request ID..."
          />
          <Select
            label="Status"
            value={status}
            onChange={(event) => {
              const value = event.target.value
              setStatus(value)
              load({ status: value }).catch((err) => setError(err?.message || 'Unable to filter requests.'))
            }}
            options={[
              { value: 'ALL', label: 'All' },
              { value: 'PENDING', label: 'Pending' },
              { value: 'APPROVED', label: 'Approved' },
              { value: 'REJECTED', label: 'Rejected' },
            ]}
          />
          <Input
            label="Date"
            type="date"
            value={date}
            onChange={(event) => {
              const value = event.target.value
              setDate(value)
              load({ date: value }).catch((err) => setError(err?.message || 'Unable to filter requests.'))
            }}
          />
        </div>
        {requests.length === 0 ? (
          <p className="text-sm text-[#6b7280]">No cash top-up requests match these filters.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-left text-sm">
              <thead>
                <tr className="border-b border-[#eef2f0] text-[12px] uppercase tracking-wide text-[#8b93a1]">
                  <th className="px-2 py-2 font-semibold">Request ID</th>
                  <th className="px-2 py-2 font-semibold">Client Name</th>
                  <th className="px-2 py-2 font-semibold">Client ID</th>
                  <th className="px-2 py-2 font-semibold">Requested Amount</th>
                  <th className="px-2 py-2 font-semibold">Receipt</th>
                  <th className="px-2 py-2 font-semibold">Submitted Date</th>
                  <th className="px-2 py-2 font-semibold">Status</th>
                  <th className="px-2 py-2 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((request) => (
                  <tr
                    key={request.id}
                    className={[
                      'border-b border-[#f4f6fb]',
                      request.status === 'PENDING' ? 'bg-[#fff8eb]' : '',
                    ].join(' ')}
                  >
                    <td className="px-2 py-3 font-semibold text-[#111827]">{request.requestNumber}</td>
                    <td className="px-2 py-3">{request.clientName}</td>
                    <td className="px-2 py-3">{request.clientCode}</td>
                    <td className="px-2 py-3">{formatRs(request.amount)}</td>
                    <td className="px-2 py-3">{request.receiptFileName || '—'}</td>
                    <td className="px-2 py-3">{request.submittedDateLabel}</td>
                    <td className="px-2 py-3">
                      <StatusBadge status={request.status} />
                    </td>
                    <td className="px-2 py-3">
                      <Link className="font-semibold text-[#005a40]" to={`/admin/wallet/topups/${request.id}`}>
                        View
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
