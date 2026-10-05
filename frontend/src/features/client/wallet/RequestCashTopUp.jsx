import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../../../components/ui/Button'
import Input from '../../../components/ui/Input'
import PageHeader from '../../../components/ui/PageHeader'
import SectionCard from '../../../components/ui/SectionCard'
import TextArea from '../../../components/ui/TextArea'
import ReceiptPreview from './ReceiptPreview'
import { submitCashTopUp } from './data/walletData'

export default function RequestCashTopUp() {
  const navigate = useNavigate()
  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')
  const [receipt, setReceipt] = useState(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function onSubmit(event) {
    event.preventDefault()
    const value = Number(amount)
    if (!Number.isFinite(value) || value <= 0) {
      setError('Enter an amount greater than zero.')
      return
    }
    if (!receipt) {
      setError('Upload a receipt.')
      return
    }
    setBusy(true)
    setError('')
    try {
      await submitCashTopUp({ amount: value, note, receipt })
      navigate('/client/wallet/requests')
    } catch (err) {
      setError(err?.message || 'Unable to submit the cash top-up request.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Request Cash Top-Up"
        description="Pay cash at the BioFit centre, then upload the receipt. Your balance does not change until Admin approves the request."
      />
      <SectionCard title="Request Cash Top-Up">
        <form className="space-y-4" onSubmit={onSubmit}>
          <Input
            label="Amount"
            type="number"
            min="1"
            step="0.01"
            required
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            placeholder="Rs."
          />
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[#111827]">
              Receipt / Proof
              <span className="ml-0.5 text-error">*</span>
            </label>
            <input
              type="file"
              required={!receipt}
              accept=".jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf"
              onChange={(event) => setReceipt(event.target.files?.[0] || null)}
              className="block w-full text-sm text-[#4b5563]"
            />
            <p className="mt-1 text-[12px] text-[#6b7280]">Accepted formats: JPG, JPEG, PNG, PDF. Maximum file size: 5 MB.</p>
          </div>
          {receipt ? (
            <ReceiptPreview
              file={receipt}
              allowChanges
              onReplace={setReceipt}
              onRemove={() => setReceipt(null)}
            />
          ) : null}
          <TextArea
            label="Note"
            rows={3}
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="Optional"
          />
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" to="/client/wallet">
              Cancel
            </Button>
            <Button type="submit" disabled={busy}>
              Submit Request
            </Button>
          </div>
        </form>
      </SectionCard>
    </div>
  )
}
