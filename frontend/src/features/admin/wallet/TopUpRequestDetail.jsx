import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import Avatar from '../../../components/ui/Avatar'
import Button from '../../../components/ui/Button'
import PageHeader from '../../../components/ui/PageHeader'
import SectionCard from '../../../components/ui/SectionCard'
import Select from '../../../components/ui/Select'
import StatusBadge from '../../../components/ui/StatusBadge'
import TextArea from '../../../components/ui/TextArea'
import ReceiptPreview from '../../client/wallet/ReceiptPreview'
import { approveTopUp, fetchAdminTopUp, formatRs, rejectTopUp } from '../../client/wallet/data/walletData'

const reasons = [
  'Receipt unclear',
  'Amount mismatch',
  'Invalid receipt',
  'Duplicate request',
  'Incorrect client',
  'Cash could not be verified',
  'Other',
]

export default function TopUpRequestDetail() {
  const { id } = useParams()
  const [request, setRequest] = useState(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [confirmApprove, setConfirmApprove] = useState(false)
  const [confirmReject, setConfirmReject] = useState(false)
  const [reason, setReason] = useState(reasons[0])
  const [customReason, setCustomReason] = useState('')

  async function load() {
    setRequest(await fetchAdminTopUp(id))
  }

  useEffect(() => {
    load().catch((err) => setError(err?.message || 'Unable to open this top-up request.'))
  }, [id])

  async function approve() {
    setBusy(true)
    setError('')
    try {
      setRequest(await approveTopUp(id))
      setConfirmApprove(false)
    } catch (err) {
      setError(err?.message || 'Unable to approve this request.')
    } finally {
      setBusy(false)
    }
  }

  async function reject() {
    const text = reason === 'Other' ? customReason.trim() : reason
    if (!text) {
      setError('Enter a rejection reason.')
      return
    }
    setBusy(true)
    setError('')
    try {
      setRequest(await rejectTopUp(id, text))
      setConfirmReject(false)
    } catch (err) {
      setError(err?.message || 'Unable to reject this request.')
    } finally {
      setBusy(false)
    }
  }

  if (!request) {
    return error ? <p className="text-sm text-red-600">{error}</p> : null
  }

  const pending = request.status === 'PENDING'

  return (
    <div className="space-y-5">
      <PageHeader title="Cash Top-Up Request" description={request.requestNumber} />
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <SectionCard title="Cash Top-Up Request">
        <div className="mb-4 flex items-center gap-3">
          <Avatar name={request.clientName || 'Client'} size="md" />
          <div>
            <p className="text-sm font-semibold text-[#111827]">{request.clientName}</p>
            <p className="text-[12px] text-[#6b7280]">{request.clientCode}</p>
          </div>
        </div>
        <dl className="grid gap-3 sm:grid-cols-2">
          <Item label="Request ID" value={request.requestNumber} />
          <Item label="Client ID" value={request.clientCode} />
          <Item label="Requested Amount" value={formatRs(request.amount)} />
          <Item label="Current Wallet Balance" value={formatRs(request.currentBalance)} />
          <Item label="Payment Method" value="Cash" />
          <Item label="Requested Wallet Balance After Approval" value={formatRs(request.balanceAfterApproval)} />
          <Item label="Submitted" value={request.submittedLabel} />
          <Item label="Receipt" value={request.receiptFileName} />
          <Item label="Original file" value={request.receiptOriginalName} />
          <div>
            <dt className="text-[12px] font-medium text-[#8b93a1]">Status</dt>
            <dd className="mt-1">
              <StatusBadge status={request.status} />
            </dd>
          </div>
          <Item label="Client Note" value={request.note} />
          {request.processedBy ? <Item label="Processed by" value={request.processedBy} /> : null}
          {request.processedLabel ? <Item label="Processed" value={request.processedLabel} /> : null}
          {request.rejectionReason ? <Item label="Rejection reason" value={request.rejectionReason} /> : null}
        </dl>
      </SectionCard>

      <SectionCard title="Payment Receipt">
        <ReceiptPreview
          remotePath={request.receiptUrl}
          fileName={request.receiptFileName || request.receiptOriginalName}
          uploadedLabel={request.receiptUploadedLabel}
        />
        <dl className="mt-4 grid gap-3 sm:grid-cols-3">
          <Item label="Request ID" value={request.requestNumber} />
          <Item label="Client" value={request.clientName} />
          <Item label="Amount" value={formatRs(request.amount)} />
        </dl>
        {pending ? (
          <div className="mt-4 flex flex-wrap gap-2">
            <Button disabled={busy} onClick={() => setConfirmApprove(true)}>
              Approve Request
            </Button>
            <Button variant="outline" disabled={busy} onClick={() => setConfirmReject(true)}>
              Reject Request
            </Button>
          </div>
        ) : null}
      </SectionCard>

      {confirmApprove ? (
        <SectionCard title="Approve Cash Top-Up?">
          <dl className="grid gap-3 sm:grid-cols-2">
            <Item label="Client" value={request.clientName} />
            <Item label="Amount" value={formatRs(request.amount)} />
            <Item label="Current Balance" value={formatRs(request.currentBalance)} />
            <Item label="New Balance" value={formatRs(request.balanceAfterApproval)} />
            <Item label="Receipt" value="Verified" />
          </dl>
          <div className="mt-4 flex gap-2">
            <Button variant="outline" disabled={busy} onClick={() => setConfirmApprove(false)}>
              Cancel
            </Button>
            <Button disabled={busy} onClick={approve}>
              Confirm Approval
            </Button>
          </div>
        </SectionCard>
      ) : null}

      {confirmReject ? (
        <SectionCard title="Reject Cash Top-Up">
          <Select
            label="Reason"
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            options={reasons.map((item) => ({ value: item, label: item }))}
          />
          {reason === 'Other' ? (
            <TextArea
              className="mt-3"
              label="Reason"
              rows={3}
              value={customReason}
              onChange={(event) => setCustomReason(event.target.value)}
            />
          ) : null}
          <div className="mt-4 flex gap-2">
            <Button variant="outline" disabled={busy} onClick={() => setConfirmReject(false)}>
              Cancel
            </Button>
            <Button disabled={busy} onClick={reject}>
              Reject Request
            </Button>
          </div>
        </SectionCard>
      ) : null}
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
