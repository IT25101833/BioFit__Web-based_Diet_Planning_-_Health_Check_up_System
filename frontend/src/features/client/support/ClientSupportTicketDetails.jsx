import { useEffect, useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import Button from '../../../components/ui/Button'
import ErrorState from '../../../components/ui/ErrorState'
import LoadingSkeleton from '../../../components/ui/LoadingSkeleton'
import PageHeader from '../../../components/ui/PageHeader'
import SectionCard from '../../../components/ui/SectionCard'
import StatusBadge from '../../../components/ui/StatusBadge'
import TextArea from '../../../components/ui/TextArea'
import Toast from '../../../components/ui/Toast'
import {
  fetchClientSupportTicketById,
  replyToClientSupportTicket,
} from './data/supportData'

function formatDateTime(value) {
  return new Date(value).toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function ClientSupportTicketDetails() {
  const { id } = useParams()
  const [ticket, setTicket] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [reply, setReply] = useState('')
  const [replyError, setReplyError] = useState('')
  const [sending, setSending] = useState(false)
  const [toast, setToast] = useState('')

  async function load() {
    setLoading(true)
    setError('')
    try {
      setTicket(await fetchClientSupportTicketById(id))
    } catch {
      setError('We couldn’t load this support ticket.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [id])

  async function handleReply(event) {
    event.preventDefault()
    if (!reply.trim()) {
      setReplyError('Please write a reply before sending.')
      return
    }
    setReplyError('')
    setSending(true)
    try {
      const message = await replyToClientSupportTicket(id, reply.trim())
      setTicket((prev) => ({
        ...prev,
        status: prev.status === 'Pending Reply' ? 'In Progress' : prev.status,
        messages: [...prev.messages, message],
      }))
      setReply('')
      setToast('Reply sent.')
    } finally {
      setSending(false)
    }
  }

  if (loading) return <LoadingSkeleton rows={3} />
  if (error || !ticket) {
    return (
      <ErrorState title="We couldn’t load this support ticket." onRetry={load} />
    )
  }

  return (
    <div>
      <div className="mb-4">
        <Link
          to="/client/support"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#005a40] hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to tickets
        </Link>
      </div>

      <PageHeader
        title={ticket.subject}
        description={`Ticket ${ticket.id} · ${ticket.category}`}
        actions={<StatusBadge status={ticket.status} />}
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <SectionCard title="Ticket details">
          <Meta label="Status" value={<StatusBadge status={ticket.status} />} />
          <Meta label="Category" value={ticket.category} />
          <Meta label="Related service" value={ticket.relatedService} />
          <Meta label="Created" value={formatDateTime(ticket.createdAt)} />
        </SectionCard>

        <SectionCard title="Conversation" className="lg:col-span-2">
          <div className="space-y-3">
            {ticket.messages.map((message) => (
              <div
                key={message.id}
                className={[
                  'rounded-2xl px-4 py-3',
                  message.role === 'client'
                    ? 'bg-[#e6f5f0]'
                    : 'border border-[#e8ecf1] bg-[#f8faf9]',
                ].join(' ')}
              >
                <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-[#111827]">
                    {message.author}
                  </p>
                  <p className="text-[11px] text-[#8b93a1]">
                    {formatDateTime(message.at)}
                  </p>
                </div>
                <p className="text-sm leading-relaxed text-[#374151]">{message.body}</p>
              </div>
            ))}
          </div>

          {ticket.status !== 'Resolved' ? (
            <form onSubmit={handleReply} className="mt-5 space-y-3">
              <TextArea
                label="Your reply"
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                error={replyError}
                placeholder="Write a reply to the support team"
              />
              <Button
                type="submit"
                disabled={sending}
                className="!bg-[#005a40] !text-white hover:!bg-[#004833]"
              >
                {sending ? 'Sending…' : 'Send reply'}
              </Button>
            </form>
          ) : (
            <p className="mt-5 text-sm text-[#6b7280]">
              This ticket is resolved. Create a new ticket if you need further help.
            </p>
          )}
        </SectionCard>
      </div>

      <Toast open={Boolean(toast)} message={toast} onClose={() => setToast('')} />
    </div>
  )
}

function Meta({ label, value }) {
  return (
    <div className="border-b border-[#eef2f0] py-3 last:border-0">
      <p className="text-[12px] font-medium text-[#8b93a1]">{label}</p>
      <div className="mt-1 text-sm font-semibold text-[#111827]">{value}</div>
    </div>
  )
}
