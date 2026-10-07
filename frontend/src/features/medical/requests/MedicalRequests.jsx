import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Button from '../../../components/ui/Button'
import PageHeader from '../../../components/ui/PageHeader'
import SectionCard from '../../../components/ui/SectionCard'
import StatusBadge from '../../../components/ui/StatusBadge'
import TextArea from '../../../components/ui/TextArea'
import {
  acceptMedicalRequest,
  completeMedicalRequest,
  fetchAdvisorMedicalRequest,
  fetchAdvisorMedicalRequests,
  formatPreferredDate,
  rejectMedicalRequest,
  startMedicalRequest,
} from './data/medicalRequestData'

export default function MedicalRequests() {
  const [requests, setRequests] = useState([])
  const [selected, setSelected] = useState(null)
  const [rejectionReason, setRejectionReason] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function load() {
    const rows = await fetchAdvisorMedicalRequests()
    setRequests(Array.isArray(rows) ? rows : [])
  }

  useEffect(() => {
    load().catch((err) => setError(err?.message || 'Unable to load medical requests.'))
  }, [])

  async function openRequest(id) {
    setBusy(true)
    setError('')
    try {
      const detail = await fetchAdvisorMedicalRequest(id)
      setSelected(detail)
      setRejectionReason('')
    } catch (err) {
      setError(err?.message || 'Unable to open this medical request.')
    } finally {
      setBusy(false)
    }
  }

  async function act(action) {
    if (!selected) return
    setBusy(true)
    setError('')
    try {
      let updated = selected
      if (action === 'accept') updated = await acceptMedicalRequest(selected.id)
      if (action === 'reject') updated = await rejectMedicalRequest(selected.id, rejectionReason)
      if (action === 'start') updated = await startMedicalRequest(selected.id)
      if (action === 'complete') updated = await completeMedicalRequest(selected.id)
      setSelected(updated)
      await load()
    } catch (err) {
      setError(err?.message || 'Unable to update this medical request.')
    } finally {
      setBusy(false)
    }
  }

  const clientUserId = selected?.clientUserId || selected?.clientId
  const clientQuery = clientUserId
    ? `?clientUserId=${encodeURIComponent(clientUserId)}`
    : ''
  const canWork =
    selected && ['ACCEPTED', 'ATTENDED', 'IN_PROGRESS', 'COMPLETED'].includes(selected.status)

  return (
    <div className="space-y-5">
      <PageHeader
        title="Medical Requests"
        description="Review requests from clients. Mark a request as attended to open that client's medical information."
      />

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <SectionCard title="Medical Requests">
        {requests.length === 0 ? (
          <p className="text-sm text-[#6b7280]">No medical requests yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-[#eef2f0] text-[12px] uppercase tracking-wide text-[#8b93a1]">
                  <th className="px-2 py-2 font-semibold">Client</th>
                  <th className="px-2 py-2 font-semibold">Reason</th>
                  <th className="px-2 py-2 font-semibold">Preferred Date</th>
                  <th className="px-2 py-2 font-semibold">Preferred Time</th>
                  <th className="px-2 py-2 font-semibold">Status</th>
                  <th className="px-2 py-2 font-semibold" />
                </tr>
              </thead>
              <tbody>
                {requests.map((request) => (
                  <tr key={request.id} className="border-b border-[#f4f6fb]">
                    <td className="px-2 py-3 font-semibold text-[#111827]">
                      {request.clientName || 'Client'}
                    </td>
                    <td className="px-2 py-3 text-[#4b5563]">{request.reason}</td>
                    <td className="px-2 py-3 text-[#4b5563]">
                      {formatPreferredDate(request.preferredDate)}
                    </td>
                    <td className="px-2 py-3 text-[#4b5563]">{request.preferredTime || '—'}</td>
                    <td className="px-2 py-3">
                      <StatusBadge status={request.status} />
                    </td>
                    <td className="px-2 py-3 text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        className="!text-[#005a40]"
                        disabled={busy}
                        onClick={() => openRequest(request.id)}
                      >
                        View Request
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>

      {selected ? (
        <SectionCard title="Request details">
          <dl className="grid gap-3 sm:grid-cols-2">
            <Detail label="Client name" value={selected.clientName} />
            <Detail label="Client ID" value={selected.clientCode || selected.clientId} />
            <Detail label="Reason" value={selected.reason} />
            <Detail label="Preferred Date" value={formatPreferredDate(selected.preferredDate)} />
            <Detail label="Preferred Time" value={selected.preferredTime} />
            <Detail label="Status" value={selected.status} badge />
            <div className="sm:col-span-2">
              <Detail label="Request description" value={selected.description} />
            </div>
            {selected.rejectionReason ? (
              <div className="sm:col-span-2">
                <Detail label="Rejection reason" value={selected.rejectionReason} />
              </div>
            ) : null}
          </dl>

          {selected.status === 'PENDING' ? (
            <div className="mt-4 space-y-3">
              <TextArea
                label="Rejection reason"
                rows={3}
                value={rejectionReason}
                onChange={(event) => setRejectionReason(event.target.value)}
                placeholder="Optional reason if you reject this request"
              />
              <div className="flex flex-wrap gap-2">
                <Button disabled={busy} onClick={() => act('accept')}>
                  Mark as Attended
                </Button>
                <Button variant="outline" disabled={busy} onClick={() => act('reject')}>
                  Reject Request
                </Button>
              </div>
            </div>
          ) : null}

          {selected.status === 'ACCEPTED' ||
          selected.status === 'ATTENDED' ||
          selected.status === 'IN_PROGRESS' ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {selected.status === 'ACCEPTED' || selected.status === 'ATTENDED' ? (
                <Button variant="outline" disabled={busy} onClick={() => act('start')}>
                  Mark in progress
                </Button>
              ) : null}
              <Button disabled={busy} onClick={() => act('complete')}>
                Mark completed
              </Button>
            </div>
          ) : null}

          {canWork ? (
            <div className="mt-5 flex flex-wrap gap-3 text-sm font-semibold">
              <Link className="text-[#005a40] hover:underline" to={`/medical/health-records${clientQuery}`}>
                View client medical information
              </Link>
              <Link
                className="text-[#005a40] hover:underline"
                to={`/medical/health-records/create${clientQuery}`}
              >
                Create Medical Record
              </Link>
              <Link className="text-[#005a40] hover:underline" to={`/medical/medical-history${clientQuery}`}>
                Medical History
              </Link>
              <Link className="text-[#005a40] hover:underline" to={`/medical/health-alerts/create${clientQuery}`}>
                Create Health Risk Alert
              </Link>
            </div>
          ) : null}
        </SectionCard>
      ) : null}
    </div>
  )
}

function Detail({ label, value, badge = false }) {
  return (
    <div>
      <dt className="text-[12px] font-medium text-[#8b93a1]">{label}</dt>
      <dd className="mt-1 text-sm font-semibold text-[#111827]">
        {badge ? <StatusBadge status={value} /> : value || '—'}
      </dd>
    </div>
  )
}
