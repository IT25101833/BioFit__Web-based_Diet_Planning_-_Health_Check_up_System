import { useEffect, useState } from 'react'
import Button from '../../../components/ui/Button'
import Input from '../../../components/ui/Input'
import PageHeader from '../../../components/ui/PageHeader'
import SectionCard from '../../../components/ui/SectionCard'
import StatusBadge from '../../../components/ui/StatusBadge'
import TextArea from '../../../components/ui/TextArea'
import ReceiptPreview from './ReceiptPreview'
import { cancelCashTopUp, fetchTopUpRequests, formatRs, updateCashTopUp } from './data/walletData'

export default function TopUpRequests() {
  const [requests, setRequests] = useState([])
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [editing, setEditing] = useState(null)
  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')
  const [receipt, setReceipt] = useState(null)

  async function load() {
    const rows = await fetchTopUpRequests()
    setRequests(Array.isArray(rows) ? rows : [])
  }

  useEffect(() => {
    load().catch((err) => setError(err?.message || 'Unable to load top-up requests.'))
  }, [])

  function startEdit(request) {
    setEditing(request.id)
    setAmount(String(request.amount ?? ''))
    setNote(request.note || '')
    setReceipt(null)
  }

  async function save(id) {
    setBusy(true)
    setError('')
    try {
      await updateCashTopUp(id, { amount, note, receipt })
      setEditing(null)
      await load()
    } catch (err) {
      setError(err?.message || 'Unable to update this request.')
    } finally {
      setBusy(false)
    }
  }

  async function cancel(id) {
    setBusy(true)
    setError('')
    try {
      await cancelCashTopUp(id)
      await load()
    } catch (err) {
      setError(err?.message || 'Unable to cancel this request.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="My Top-Up Requests"
        description="Cash top-up requests stay pending until an Admin verifies the receipt."
        actions={
          <>
            <Button to="/client/wallet" variant="outline" size="sm">
              Back to Wallet
            </Button>
            <Button to="/client/wallet/top-up" size="sm">
              Request Cash Top-Up
            </Button>
          </>
        }
      />
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {requests.length === 0 ? (
        <SectionCard title="My Top-Up Requests">
          <p className="text-sm text-[#6b7280]">You have not submitted a cash top-up request yet.</p>
        </SectionCard>
      ) : (
        requests.map((request) => (
          <SectionCard key={request.id} title={request.requestNumber}>
            <dl className="grid gap-3 sm:grid-cols-2">
              <Item label="Amount" value={formatRs(request.amount)} />
              <Item label="Submitted" value={request.submittedDateLabel} />
              <Item label="Receipt" value={request.receiptOriginalName || request.receiptFileName} />
              <div>
                <dt className="text-[12px] font-medium text-[#8b93a1]">Status</dt>
                <dd className="mt-1">
                  <StatusBadge status={request.status} />
                </dd>
              </div>
              {request.status === 'APPROVED' ? <Item label="Approved" value={request.approvedLabel} /> : null}
              {request.status === 'REJECTED' ? <Item label="Reason" value={request.rejectionReason} /> : null}
            </dl>
            {request.receiptUrl ? (
              <div className="mt-4">
                <ReceiptPreview
                  remotePath={request.receiptUrl}
                  fileName={request.receiptOriginalName || request.receiptFileName}
                  uploadedLabel={request.receiptUploadedLabel}
                />
              </div>
            ) : null}
            {request.status === 'PENDING' && editing === request.id ? (
              <div className="mt-4 space-y-3">
                <Input label="Amount" type="number" min="1" step="0.01" value={amount} onChange={(event) => setAmount(event.target.value)} />
                <TextArea label="Note" rows={3} value={note} onChange={(event) => setNote(event.target.value)} />
                <input
                  type="file"
                  accept=".jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf"
                  onChange={(event) => setReceipt(event.target.files?.[0] || null)}
                />
                {receipt ? <ReceiptPreview file={receipt} allowChanges onReplace={setReceipt} onRemove={() => setReceipt(null)} /> : null}
                <div className="flex gap-2">
                  <Button size="sm" disabled={busy} onClick={() => save(request.id)}>
                    Save changes
                  </Button>
                  <Button size="sm" variant="outline" disabled={busy} onClick={() => setEditing(null)}>
                    Close
                  </Button>
                </div>
              </div>
            ) : null}
            {request.status === 'PENDING' && editing !== request.id ? (
              <div className="mt-4 flex flex-wrap gap-2">
                <Button size="sm" variant="outline" className="!text-[#005a40]" disabled={busy} onClick={() => startEdit(request)}>
                  Edit request
                </Button>
                <Button size="sm" variant="outline" disabled={busy} onClick={() => cancel(request.id)}>
                  Cancel request
                </Button>
              </div>
            ) : null}
          </SectionCard>
        ))
      )}
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
