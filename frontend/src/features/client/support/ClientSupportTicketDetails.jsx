import { useEffect, useState } from 'react'
import { ArrowLeft, CheckCircle2, Trash2 } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import Button from '../../../components/ui/Button'
import ConfirmDialog from '../../../components/ui/ConfirmDialog'
import ErrorState from '../../../components/ui/ErrorState'
import LoadingSkeleton from '../../../components/ui/LoadingSkeleton'
import Modal from '../../../components/ui/Modal'
import PageHeader from '../../../components/ui/PageHeader'
import SectionCard from '../../../components/ui/SectionCard'
import StatusBadge from '../../../components/ui/StatusBadge'
import TextArea from '../../../components/ui/TextArea'
import Toast from '../../../components/ui/Toast'
import {
  canClientDeleteTicket,
  deleteClientSupportTicket,
  fetchClientSupportTicketById,
  replyToClientSupportTicket,
  reopenClientSupportTicket,
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
  const navigate = useNavigate()
  const [ticket, setTicket] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [reply, setReply] = useState('')
  const [reopenNote, setReopenNote] = useState('')
  const [replyError, setReplyError] = useState('')
  const [sending, setSending] = useState(false)
  const [reopening, setReopening] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')
  const [deletedOpen, setDeletedOpen] = useState(false)
  const [deletedTicketId, setDeletedTicketId] = useState('')
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
    if (deletedOpen) return
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
      const updated = await replyToClientSupportTicket(id, reply.trim())
      setTicket(updated)
      setReply('')
      setToast('Reply sent.')
    } catch (err) {
      setToast(err?.message || 'Could not send the reply.')
    } finally {
      setSending(false)
    }
  }

  async function handleReopen(event) {
    event.preventDefault()
    setReopening(true)
    try {
      const updated = await reopenClientSupportTicket(id, reopenNote.trim())
      setTicket(updated)
      setReopenNote('')
      setToast('Ticket kept open and sent back to support.')
    } catch (err) {
      setToast(err?.message || 'Could not reopen the ticket.')
    } finally {
      setReopening(false)
    }
  }

  async function handleConfirmDelete() {
    if (!canClientDeleteTicket(ticket)) {
      setDeleteError('Only open tickets without a support reply can be deleted.')
      return
    }
    setDeleting(true)
    setDeleteError('')
    try {
      await deleteClientSupportTicket(id)
      setDeletedTicketId(ticket?.id || id)
      setDeleteOpen(false)
      setDeletedOpen(true)
    } catch (err) {
      setDeleteError(err?.message || 'Could not delete this ticket. Please try again.')
    } finally {
      setDeleting(false)
    }
  }

  function handleDeletedDone() {
    setDeletedOpen(false)
    navigate('/client/support', {
      replace: true,
      state: { toast: 'Support ticket deleted successfully.' },
    })
  }

  const dialogs = (
    <>
      <ConfirmDialog
        open={deleteOpen}
        onClose={() => {
          if (deleting) return
          setDeleteOpen(false)
          setDeleteError('')
        }}
        onConfirm={handleConfirmDelete}
        confirming={deleting}
        tone="danger"
        title="Delete this ticket?"
        description="Use this only if the ticket was sent by mistake. Resolved tickets cannot be deleted, and this cannot be undone."
        confirmLabel="Delete ticket"
        cancelLabel="Keep ticket"
      >
        <div className="flex items-start gap-3 rounded-2xl border border-[var(--bf-border)] bg-[var(--bf-surface)] p-4 shadow-[var(--bf-shadow-in)]">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#fde8e8] text-[#c45c5c] shadow-[var(--bf-shadow-out)]">
            <Trash2 className="h-5 w-5" strokeWidth={2.2} />
          </span>
          <div>
            <p className="text-sm font-semibold text-[var(--bf-ink)]">
              {ticket?.subject || 'Support ticket'}
            </p>
            <p className="mt-1 text-sm leading-relaxed text-[var(--bf-muted)]">
              Ticket {ticket?.id || id} will be removed from your list.
            </p>
            {deleteError ? (
              <p className="mt-2 text-sm font-medium text-[#be123c]">{deleteError}</p>
            ) : null}
          </div>
        </div>
      </ConfirmDialog>

      <Modal
        open={deletedOpen}
        onClose={handleDeletedDone}
        title="Ticket deleted"
        description="Your support ticket was removed successfully."
        size="sm"
        footer={
          <Button
            onClick={handleDeletedDone}
            className="!border-transparent !bg-[#005a40] !text-white shadow-[var(--bf-shadow-out)] hover:!bg-[#004833]"
          >
            Back to tickets
          </Button>
        }
      >
        <div className="flex items-start gap-3 rounded-2xl border border-[var(--bf-border)] bg-[var(--bf-surface)] p-4 shadow-[var(--bf-shadow-in)]">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#e6f5f0] text-[#005a40] shadow-[var(--bf-shadow-out)]">
            <CheckCircle2 className="h-5 w-5" strokeWidth={2.2} />
          </span>
          <div>
            <p className="text-sm font-semibold text-[var(--bf-ink)]">Successfully deleted</p>
            <p className="mt-1 text-sm leading-relaxed text-[var(--bf-muted)]">
              Ticket {deletedTicketId || id} is no longer in your support list.
            </p>
          </div>
        </div>
      </Modal>

      <Toast open={Boolean(toast)} message={toast} onClose={() => setToast('')} />
    </>
  )

  if (deletedOpen) {
    return <div>{dialogs}</div>
  }

  if (loading) return <LoadingSkeleton rows={3} />
  if (error || !ticket) {
    return (
      <ErrorState title="We couldn’t load this support ticket." onRetry={load} />
    )
  }

  const isResolved = ticket.status === 'Resolved' || ticket.status === 'Closed'
  const canDelete = canClientDeleteTicket(ticket)

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
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={ticket.status} />
            {canDelete ? (
              <Button
                type="button"
                variant="outline"
                disabled={deleting}
                onClick={() => {
                  setDeleteError('')
                  setDeleteOpen(true)
                }}
                className="!border-[#f0d0d0] !bg-[var(--bf-surface-raised)] !text-[#c45c5c] shadow-[var(--bf-shadow-out)] hover:!bg-[#fdf2f2]"
              >
                <Trash2 className="h-4 w-4" />
                Delete ticket
              </Button>
            ) : null}
          </div>
        }
      />

      {canDelete ? (
        <p className="mb-4 text-sm text-[#6b7280]">
          This ticket is still open and has no support reply, so you can delete it if it was sent by mistake.
        </p>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-3">
        <SectionCard title="Ticket details">
          <Meta label="Status" value={<StatusBadge status={ticket.status} />} />
          <Meta label="Category" value={ticket.category} />
          <Meta label="Related service" value={ticket.relatedService} />
          <Meta label="Created" value={formatDateTime(ticket.createdAt)} />
          {ticket.resolution?.summary ? (
            <Meta label="Resolution" value={ticket.resolution.summary} />
          ) : null}
        </SectionCard>

        <SectionCard title="Conversation" className="lg:col-span-2">
          <div className="space-y-3">
            {ticket.messages.map((message) => (
              <div
                key={message.id}
                className={[
                  'rounded-2xl px-4 py-3 shadow-[var(--bf-shadow-in)]',
                  message.role === 'client'
                    ? 'bg-[#e6f5f0]'
                    : 'border border-[var(--bf-border)] bg-[var(--bf-surface)]',
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

          {isResolved ? (
            <div className="mt-5 space-y-4 rounded-2xl border border-[#e6f5f0] bg-[#f4fbf8] p-4 shadow-[var(--bf-shadow-in)]">
              <div>
                <p className="text-sm font-semibold text-[#005a40]">This ticket is resolved</p>
                <p className="mt-1 text-sm text-[#4b5563]">
                  {ticket.resolution?.summary
                    ? ticket.resolution.summary
                    : 'Support marked this ticket as resolved. If something is still outstanding, keep it open below.'}
                </p>
              </div>
              <form onSubmit={handleReopen} className="space-y-3">
                <TextArea
                  label="What still needs attention? (optional)"
                  value={reopenNote}
                  onChange={(e) => setReopenNote(e.target.value)}
                  placeholder="Describe what is left so support can continue on this same ticket"
                />
                <Button
                  type="submit"
                  disabled={reopening}
                  variant="outline"
                  className="!border-[#005a40] !text-[#005a40] shadow-[var(--bf-shadow-out)]"
                >
                  {reopening ? 'Sending…' : 'Keep ticket open'}
                </Button>
              </form>
            </div>
          ) : (
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
                className="!bg-[#005a40] !text-white shadow-[var(--bf-shadow-out)] hover:!bg-[#004833]"
              >
                {sending ? 'Sending…' : 'Send reply'}
              </Button>
            </form>
          )}
        </SectionCard>
      </div>

      {dialogs}
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
