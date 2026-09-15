import { useState } from 'react'
import { AlertCircle, ShieldAlert, Sparkles } from 'lucide-react'
import Modal from '../../../../components/ui/Modal'
import Button from '../../../../components/ui/Button'
import TextArea from '../../../../components/ui/TextArea'
import { escalationDestinations } from '../data/supportTicketsData'

export default function EscalateTicketModal({ open, onClose, ticket, onEscalate }) {
  const [escalateTo, setEscalateTo] = useState('')
  const [reason, setReason] = useState('')
  const [additionalContext, setAdditionalContext] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  if (!ticket) return null

  // Filter relevant escalation destinations or prioritize category
  const relevantDestinations = escalationDestinations.map((dest) => ({
    ...dest,
    isRecommended: dest.relevantCategories.includes(ticket.category),
  }))

  async function handleSubmit(e) {
    e.preventDefault()
    if (!escalateTo) {
      setError('Please select a destination specialist or team.')
      return
    }
    if (!reason.trim()) {
      setError('Please provide a specific reason for escalation.')
      return
    }
    setError('')
    setSubmitting(true)
    try {
      await onEscalate({
        escalateTo,
        reason: reason.trim(),
        additionalContext: additionalContext.trim(),
      })
      onClose()
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Escalate Support Ticket"
      description={`Transfer case inquiry ${ticket.id} to specialized BioFit care`}
      size="lg"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={submitting}
            className="!bg-[#005a40] !text-white hover:!bg-[#004833]"
          >
            {submitting ? 'Escalating…' : 'Escalate Ticket'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Privacy Boundary Banner */}
        <div className="flex items-start gap-3 rounded-xl border border-[#bbf7d0] bg-[#f0fdf4] p-3.5 text-xs text-[#166534]">
          <ShieldAlert className="h-4 w-4 shrink-0 text-[#005a40] mt-0.5" />
          <div>
            <p className="font-semibold text-[#14532d]">Clinical &amp; Privacy Boundary Notice</p>
            <p className="mt-0.5 text-[#166534] leading-relaxed">
              Share only the high-level inquiry context necessary for the specialist to assist.
              Customer support permissions never expose or transmit restricted medical records.
            </p>
          </div>
        </div>

        {error ? (
          <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        ) : null}

        <div>
          <label className="block text-xs font-semibold text-[#374151] mb-2">
            Escalate To Specialist Role *
          </label>
          <div className="grid gap-2 sm:grid-cols-2">
            {relevantDestinations.map((dest) => {
              const isSelected = escalateTo === dest.label
              return (
                <button
                  key={dest.label}
                  type="button"
                  onClick={() => {
                    setEscalateTo(dest.label)
                    setError('')
                  }}
                  className={[
                    'flex flex-col items-start p-3 text-left rounded-xl border transition-all text-xs',
                    isSelected
                      ? 'border-[#005a40] bg-[#e6f5f0] text-[#005a40] ring-1 ring-[#005a40]'
                      : 'border-[#e8ecf1] bg-white text-[#374151] hover:border-[#cbd5e1] hover:bg-[#f8faf9]',
                  ].join(' ')}
                >
                  <div className="flex w-full items-center justify-between">
                    <span className="font-semibold">{dest.label}</span>
                    {dest.isRecommended ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#dcfce7] px-2 py-0.5 text-[10px] font-medium text-[#15803d]">
                        <Sparkles className="h-2.5 w-2.5" />
                        Recommended
                      </span>
                    ) : null}
                  </div>
                  <span className="mt-1 text-[11px] text-[#6b7280]">{dest.role}</span>
                </button>
              )
            })}
          </div>
        </div>

        <div>
          <label htmlFor="escalate-reason" className="block text-xs font-semibold text-[#374151] mb-1.5">
            Reason for Escalation *
          </label>
          <input
            id="escalate-reason"
            type="text"
            required
            placeholder="e.g. Clinical clarification regarding client allergen sensitivity"
            value={reason}
            onChange={(e) => {
              setReason(e.target.value)
              if (error) setError('')
            }}
            className="w-full rounded-xl border border-[#e8ecf1] bg-white px-3.5 py-2.5 text-sm text-[#111827] shadow-sm focus:border-[#005a40] focus:outline-none focus:ring-1 focus:ring-[#005a40]"
          />
        </div>

        <div>
          <TextArea
            id="escalate-context"
            label="Additional Context / Case Summary"
            labelHint="Optional"
            placeholder="Provide concise operational context or client timeline notes…"
            rows={3}
            value={additionalContext}
            onChange={(e) => setAdditionalContext(e.target.value)}
          />
        </div>
      </form>
    </Modal>
  )
}
