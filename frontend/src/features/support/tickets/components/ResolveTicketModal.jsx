import { useState } from 'react'
import { CheckCircle2, AlertCircle } from 'lucide-react'
import Modal from '../../../../components/ui/Modal'
import Button from '../../../../components/ui/Button'
import TextArea from '../../../../components/ui/TextArea'

const resolutionCategories = [
  'Appointment Updated',
  'Information Provided',
  'Dietary Preference Updated',
  'Workout Plan Modified',
  'Technical Sync Resolved',
  'Account Settings Adjusted',
  'General Resolution',
]

export default function ResolveTicketModal({ open, onClose, ticket, onResolve }) {
  const [summary, setSummary] = useState('')
  const [category, setCategory] = useState('Information Provided')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  if (!ticket) return null

  async function handleSubmit(e) {
    e.preventDefault()
    if (!summary.trim()) {
      setError('Please provide a resolution summary describing how the request was resolved.')
      return
    }
    setError('')
    setSubmitting(true)
    try {
      await onResolve({ summary: summary.trim(), category })
      onClose()
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Resolve Support Ticket?"
      description={`Confirm case completion for ${ticket.id} (${ticket.client?.name})`}
      size="md"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={submitting}>
            Continue Working
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={submitting}
            className="!bg-[#005a40] !text-white hover:!bg-[#004833]"
          >
            {submitting ? 'Resolving…' : 'Resolve Ticket'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-start gap-3 rounded-xl border border-[#d7eee6] bg-[#f2faf7] p-3.5 text-xs text-[#005a40]">
          <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            Resolving this ticket preserves the complete conversation thread and registers the resolution in the client’s service history.
          </p>
        </div>

        {error ? (
          <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        ) : null}

        <div>
          <label htmlFor="resolution-category" className="block text-xs font-semibold text-[#374151] mb-1.5">
            Resolution Category
          </label>
          <select
            id="resolution-category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full rounded-xl border border-[#e8ecf1] bg-white px-3.5 py-2.5 text-sm text-[#111827] shadow-sm focus:border-[#005a40] focus:outline-none focus:ring-1 focus:ring-[#005a40]"
          >
            {resolutionCategories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div>
          <TextArea
            id="resolution-summary"
            label="Resolution Summary *"
            placeholder="Describe the solution or action taken to conclude this request…"
            rows={3}
            required
            value={summary}
            onChange={(e) => {
              setSummary(e.target.value)
              if (error) setError('')
            }}
          />
        </div>
      </form>
    </Modal>
  )
}
