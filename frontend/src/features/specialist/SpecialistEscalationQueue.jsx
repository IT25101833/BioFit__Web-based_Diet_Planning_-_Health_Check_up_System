import { useEffect, useState } from 'react'
import { Clock, Send } from 'lucide-react'
import { apiRequest } from '../../api/client'
import Button from '../../components/ui/Button'
import EmptyState from '../../components/ui/EmptyState'
import ErrorState from '../../components/ui/ErrorState'
import LoadingSkeleton from '../../components/ui/LoadingSkeleton'
import PageHeader from '../../components/ui/PageHeader'
import StatusBadge from '../../components/ui/StatusBadge'
import TextArea from '../../components/ui/TextArea'
import Toast from '../../components/ui/Toast'

function waitingLabel(ticket) {
  if (ticket.waitingTimeMinutes == null) return '—'
  return `${ticket.waitingTimeMinutes} min`
}

export default function SpecialistEscalationQueue({
  title,
  description,
  apiBase,
}) {
  const [tickets, setTickets] = useState([])
  const [selectedId, setSelectedId] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [response, setResponse] = useState('')
  const [responseError, setResponseError] = useState('')
  const [sending, setSending] = useState(false)
  const [toast, setToast] = useState('')

  async function load() {
    setLoading(true)
    setError('')
    try {
      const data = await apiRequest(`${apiBase}/escalations`)
      setTickets(Array.isArray(data) ? data : [])
      setSelectedId((current) => current || data?.[0]?.id || '')
    } catch (err) {
      setError(err?.message || 'Could not load escalations.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [apiBase])

  const selected = tickets.find((ticket) => ticket.id === selectedId) || null
  const guidanceSubmitted =
    selected?.escalation?.status === 'Responded' || Boolean(selected?.escalation?.specialistResponse)

  async function handleSubmit(event) {
    event.preventDefault()
    if (!response.trim()) {
      setResponseError('Write the guidance before submitting.')
      return
    }
    setResponseError('')
    setSending(true)
    try {
      const updated = await apiRequest(`${apiBase}/escalations/${selected.id}/respond`, {
        method: 'POST',
        body: JSON.stringify({ message: response.trim() }),
      })
      setTickets((current) => current.filter((ticket) => ticket.id !== updated.id))
      setSelectedId((current) => (current === updated.id ? '' : current))
      setResponse('')
      setToast('Specialist Guidance Submitted')
    } catch (err) {
      setToast(err?.message || 'Could not submit guidance.')
    } finally {
      setSending(false)
    }
  }

  if (loading) return <LoadingSkeleton rows={4} />
  if (error) return <ErrorState title={error} onRetry={load} />

  return (
    <div className="space-y-6">
      <PageHeader title={title} description={description} />
      {tickets.length === 0 ? (
        <EmptyState title="No escalations in this queue" description="Support has not sent a case to this specialist role." />
      ) : (
        <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
          <div className="space-y-3">
            {tickets.map((ticket) => (
              <button
                key={ticket.id}
                type="button"
                onClick={() => setSelectedId(ticket.id)}
                className={[
                  'w-full rounded-2xl border p-4 text-left shadow-xs',
                  ticket.id === selectedId ? 'border-[#005a40] bg-[#f4fbf8]' : 'border-[#e8ecf1] bg-white',
                ].join(' ')}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-xs font-bold text-[#111827]">{ticket.id}</span>
                  <StatusBadge status={ticket.status} />
                </div>
                <p className="mt-2 text-sm font-semibold text-[#111827]">{ticket.subject}</p>
                <p className="mt-1 text-xs text-[#6b7280]">
                  {ticket.category} · {ticket.priority}
                </p>
                <p className="mt-2 flex items-center gap-1 text-xs text-[#6b7280]">
                  <Clock className="h-3.5 w-3.5" />
                  Waiting {waitingLabel(ticket)}
                </p>
              </button>
            ))}
          </div>

          {selected ? (
            <div className="rounded-3xl border border-[#e8ecf1] bg-white p-5 shadow-xs sm:p-6 space-y-4">
              <div>
                <p className="font-mono text-xs font-bold text-[#005a40]">{selected.id}</p>
                <h2 className="mt-1 font-display text-xl font-bold text-[#111827]">{selected.subject}</h2>
                <p className="mt-1 text-sm text-[#6b7280]">
                  {selected.clientName || selected.client?.name} · {selected.category} · {selected.priority} priority
                </p>
              </div>
              <div className="rounded-2xl border border-purple-200 bg-purple-50/60 p-4 text-sm">
                <p className="text-xs font-semibold uppercase tracking-wide text-purple-800">Escalation reason</p>
                <p className="mt-1 text-[#1f2937]">{selected.escalation?.reason}</p>
                <p className="mt-2 text-xs text-[#6b7280]">
                  Escalated by {selected.escalation?.escalatedBy || 'Support'} ·{' '}
                  {selected.escalation?.escalatedAt
                    ? new Date(selected.escalation.escalatedAt).toLocaleString('en-GB')
                    : '—'}
                </p>
              </div>
              <div className="space-y-2">
                {(selected.messages || []).map((message) => (
                  <div key={message.id} className="rounded-2xl border border-[#e8ecf1] bg-[#f8faf9] p-3">
                    <p className="text-xs font-semibold text-[#111827]">{message.author}</p>
                    <p className="mt-1 text-sm text-[#374151]">{message.body}</p>
                  </div>
                ))}
              </div>
              {guidanceSubmitted ? (
                <div className="rounded-2xl border border-[#bbf7d0] bg-[#f0fdf4] p-4 text-sm text-[#14532d]">
                  Specialist Guidance Submitted
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-3">
                  <TextArea
                    label="Specialist response"
                    value={response}
                    onChange={(event) => setResponse(event.target.value)}
                    error={responseError}
                    placeholder="Write guidance for the support officer"
                  />
                  <Button
                    type="submit"
                    disabled={sending}
                    className="!bg-[#005a40] !text-white hover:!bg-[#004833]"
                  >
                    <Send className="h-4 w-4" />
                    {sending ? 'Submitting…' : 'Submit guidance'}
                  </Button>
                </form>
              )}
            </div>
          ) : null}
        </div>
      )}
      <Toast open={Boolean(toast)} message={toast} onClose={() => setToast('')} />
    </div>
  )
}
