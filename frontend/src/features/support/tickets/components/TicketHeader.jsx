import { Link } from 'react-router-dom'
import { ArrowLeft, ArrowUpRight, CheckCircle, Lock, MessageSquare, Play, UserCheck } from 'lucide-react'
import Button from '../../../../components/ui/Button'
import StatusBadge from '../../../../components/ui/StatusBadge'

function isTicketUnassigned(assignedTo) {
  return !assignedTo || assignedTo === 'Support Desk' || assignedTo === 'Unassigned'
}

export default function TicketHeader({
  ticket,
  onAssignToMe,
  onStartProgress,
  onOpenEscalate,
  onOpenResolve,
  onCloseTicket,
  onScrollToReply,
}) {
  const isUnassigned = isTicketUnassigned(ticket.assignedTo)
  const canStartProgress = ticket.status === 'Open' || ticket.status === 'Assigned'
  const isResolved = ticket.status === 'Resolved'
  const isClosed = ticket.status === 'Closed'
  const isFinished = isResolved || isClosed

  return (
    <div className="mb-6 space-y-4">
      <div className="flex items-center justify-between">
        <Link
          to="/support/ticket-queue"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#005a40] hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Ticket Queue</span>
        </Link>
        <span className="text-xs text-[#6b7280]">
          Last activity:{' '}
          {new Date(ticket.lastActivityAt || ticket.updatedAt).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </span>
      </div>

      <div className="flex flex-col gap-4 rounded-3xl border border-[#e8ecf1] bg-white p-5 shadow-xs lg:flex-row lg:items-center lg:justify-between sm:p-6">
        <div className="min-w-0 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-sm font-bold text-[#111827]">{ticket.id}</span>
            <StatusBadge status={ticket.status} />
            <span className="rounded-full bg-[#f4f6fb] px-2.5 py-0.5 text-xs font-medium text-[#4b5563]">
              {ticket.category}
            </span>
            <span
              className={[
                'rounded-full px-2.5 py-0.5 text-xs font-medium',
                ticket.priority === 'High'
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-slate-100 text-slate-700',
              ].join(' ')}
            >
              {ticket.priority} Priority
            </span>
          </div>

          <h1 className="font-display text-xl font-bold tracking-tight text-[#111827] sm:text-2xl">
            {ticket.subject}
          </h1>
          <p className="text-xs text-[#6b7280]">
            Opened by <strong className="text-[#111827]">{ticket.client?.name}</strong> (
            {ticket.client?.id}) · {ticket.client?.programme}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {isUnassigned && !isFinished ? (
            <Button
              variant="outline"
              size="sm"
              onClick={onAssignToMe}
              className="!border-[#005a40]/30 !text-[#005a40]"
            >
              <UserCheck className="h-3.5 w-3.5 mr-1.5" />
              Assign to Me
            </Button>
          ) : null}

          {canStartProgress ? (
            <Button
              variant="outline"
              size="sm"
              onClick={onStartProgress}
              className="!border-[#005a40]/30 !text-[#005a40]"
            >
              <Play className="h-3.5 w-3.5 mr-1.5" />
              Start Progress
            </Button>
          ) : null}

          {!isFinished ? (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={onOpenEscalate}
                className="!border-[#e8ecf1] !text-[#4b5563]"
              >
                <ArrowUpRight className="h-3.5 w-3.5 mr-1.5 text-amber-600" />
                Escalate
              </Button>

              <Button
                size="sm"
                onClick={onOpenResolve}
                className="!bg-[#005a40] !text-white hover:!bg-[#004833]"
              >
                <CheckCircle className="h-3.5 w-3.5 mr-1.5" />
                Resolve Ticket
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={onScrollToReply}
                className="!bg-[#f4f6fb] !border-transparent !text-[#111827]"
              >
                <MessageSquare className="h-3.5 w-3.5 mr-1.5" />
                Respond
              </Button>
            </>
          ) : isResolved ? (
            <>
              <div className="inline-flex items-center gap-1.5 rounded-xl bg-[#e6f5f0] px-3.5 py-1.5 text-xs font-semibold text-[#005a40]">
                <CheckCircle className="h-4 w-4" />
                <span>Resolved</span>
              </div>
              {onCloseTicket ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onCloseTicket}
                  className="!border-[#e8ecf1] !text-[#4b5563]"
                >
                  <Lock className="h-3.5 w-3.5 mr-1.5" />
                  Close Ticket
                </Button>
              ) : null}
            </>
          ) : (
            <div className="inline-flex items-center gap-1.5 rounded-xl bg-[#f4f6fb] px-3.5 py-1.5 text-xs font-semibold text-[#6b7280]">
              <Lock className="h-4 w-4" />
              <span>Closed</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
