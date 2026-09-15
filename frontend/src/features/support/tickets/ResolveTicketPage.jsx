import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { AlertCircle, ArrowLeft, CheckCircle2 } from 'lucide-react'
import Button from '../../../components/ui/Button'
import TextArea from '../../../components/ui/TextArea'
import LoadingSkeleton from '../../../components/ui/LoadingSkeleton'
import ErrorState from '../../../components/ui/ErrorState'
import StatusBadge from '../../../components/ui/StatusBadge'
import { fetchSupportTicketById, resolveSupportTicket } from './data/supportTicketsData'

const resolutionCategories = [
  'Appointment Updated',
  'Information Provided',
  'Dietary Preference Updated',
  'Workout Plan Modified',
  'Technical Sync Resolved',
  'Account Settings Adjusted',
  'General Resolution',
]

export default function ResolveTicketPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [ticket, setTicket] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [summary, setSummary] = useState('')
  const [category, setCategory] = useState('Information Provided')
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')

  async function loadTicket() {
    setLoading(true)
    setError('')
    try {
      const data = await fetchSupportTicketById(id)
      setTicket(data)
    } catch {
      setError(`We couldn’t find or load support ticket ${id}.`)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTicket()
  }, [id])

  async function handleSubmit(e) {
    e.preventDefault()
    if (!summary.trim()) {
      setFormError('Please provide a resolution summary describing how the request was resolved.')
      return
    }
    setFormError('')
    setSubmitting(true)
    try {
      await resolveSupportTicket(ticket.id, { summary: summary.trim(), category })
      navigate(`/support/tickets/${ticket.id}`, { replace: true, state: { toast: `Ticket ${ticket.id} successfully resolved.` } })
    } catch {
      setFormError('Unable to resolve this ticket right now. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <LoadingSkeleton rows={5} />
  if (error || !ticket) {
    return <ErrorState title={error || 'Ticket not found'} onRetry={loadTicket} />
  }

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      <div>
        <Link
          to={`/support/tickets/${ticket.id}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#005a40] hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Ticket Details
        </Link>
      </div>

      <div className="rounded-3xl border border-[#e8ecf1] bg-white p-6 shadow-xs sm:p-8">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-sm font-bold text-[#111827]">{ticket.id}</span>
          <StatusBadge status={ticket.status} />
          <span className="rounded-full bg-[#f4f6fb] px-2.5 py-0.5 text-xs font-medium text-[#4b5563]">
            {ticket.category}
          </span>
        </div>

        <h1 className="mt-3 font-display text-2xl font-bold tracking-tight text-[#111827]">
          Resolve Support Ticket
        </h1>
        <p className="mt-1 text-sm text-[#6b7280]">
          Confirm case completion for <strong className="text-[#111827]">{ticket.id}</strong>
          {ticket.client?.name ? (
            <>
              {' '}
              (<strong className="text-[#111827]">{ticket.client.name}</strong>)
            </>
          ) : null}
        </p>
        <p className="mt-2 text-sm font-medium text-[#111827]">{ticket.subject}</p>

        <div className="mt-5 flex items-start gap-3 rounded-xl border border-[#d7eee6] bg-[#f2faf7] p-3.5 text-xs text-[#005a40]">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
          <p className="leading-relaxed">
            Resolving this ticket preserves the complete conversation thread and registers the resolution in the
            client’s service history.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          {formError ? (
            <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{formError}</span>
            </div>
          ) : null}

          <div>
            <label htmlFor="resolution-category" className="mb-1.5 block text-xs font-semibold text-[#374151]">
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

          <TextArea
            id="resolution-summary"
            label="Resolution Summary *"
            placeholder="Describe the solution or action taken to conclude this request…"
            rows={5}
            required
            value={summary}
            onChange={(e) => {
              setSummary(e.target.value)
              if (formError) setFormError('')
            }}
          />

          <div className="flex flex-wrap items-center justify-end gap-2 border-t border-[#eef2f0] pt-5">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(`/support/tickets/${ticket.id}`)}
              disabled={submitting}
            >
              Continue Working
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              className="!bg-[#005a40] !text-white hover:!bg-[#004833]"
            >
              {submitting ? 'Resolving…' : 'Resolve Ticket'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
