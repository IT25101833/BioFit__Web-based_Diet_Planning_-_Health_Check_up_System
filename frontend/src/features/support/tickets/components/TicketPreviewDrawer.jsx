import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ExternalLink, MessageSquare, Clock, User, Calendar, ShieldCheck, UserCheck } from 'lucide-react'
import Drawer from '../../../../components/ui/Drawer'
import Button from '../../../../components/ui/Button'
import StatusBadge from '../../../../components/ui/StatusBadge'
import Avatar from '../../../../components/ui/Avatar'

export default function TicketPreviewDrawer({ open, onClose, ticket, onAssignToMe }) {
  const [assigning, setAssigning] = useState(false)

  if (!ticket) return null

  const latestMessage = ticket.messages?.[ticket.messages.length - 1]
  const firstMessage = ticket.messages?.[0]

  async function handleQuickAssign() {
    setAssigning(true)
    try {
      await onAssignToMe(ticket.id)
    } finally {
      setAssigning(false)
    }
  }

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={ticket.id}
      description={ticket.category}
      width="md"
      footer={
        <div className="flex items-center justify-between gap-3 w-full">
          {ticket.assignedTo !== 'Priya Nair' ? (
            <Button
              variant="outline"
              size="sm"
              onClick={handleQuickAssign}
              disabled={assigning}
              className="!border-[#005a40]/30 !text-[#005a40]"
            >
              <UserCheck className="h-3.5 w-3.5 mr-1.5" />
              {assigning ? 'Assigning…' : 'Assign to Me'}
            </Button>
          ) : (
            <span className="text-xs text-[#005a40] font-medium flex items-center gap-1">
              <UserCheck className="h-3.5 w-3.5" />
              Assigned to you
            </span>
          )}
          <Link
            to={`/support/tickets/${ticket.id}`}
            onClick={onClose}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#005a40] px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-[#004833] transition-colors"
          >
            <span>Open Full Ticket</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        </div>
      }
    >
      <div className="space-y-5 text-sm">
        {/* Subject & Status */}
        <div>
          <div className="flex items-center gap-2 flex-wrap mb-2">
            <StatusBadge status={ticket.status} />
            <span className={[
              'inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium',
              ticket.priority === 'High' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'
            ].join(' ')}>
              {ticket.priority} Priority
            </span>
          </div>
          <h3 className="font-display text-base font-bold text-[#111827] leading-snug">
            {ticket.subject}
          </h3>
        </div>

        {/* Client Card */}
        <div className="rounded-2xl border border-[#e8ecf1] bg-[#f8faf9] p-3.5">
          <p className="text-[11px] font-semibold text-[#8b93a1] uppercase tracking-wider mb-2.5">
            Client Details
          </p>
          <div className="flex items-center gap-3">
            <Avatar name={ticket.client?.name} size="md" />
            <div className="min-w-0">
              <p className="font-semibold text-[#111827] truncate">{ticket.client?.name}</p>
              <p className="text-xs text-[#6b7280]">
                ID: {ticket.client?.id} · {ticket.client?.programme}
              </p>
              <p className="text-xs text-[#6b7280]">
                {ticket.client?.email} · {ticket.client?.phone}
              </p>
            </div>
          </div>
        </div>

        {/* Metadata Grid */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="rounded-xl border border-[#e8ecf1] p-3">
            <span className="text-[#8b93a1] block">Assigned Officer</span>
            <span className="font-medium text-[#111827] mt-0.5 block">
              {ticket.assignedTo || 'Unassigned'}
            </span>
          </div>
          <div className="rounded-xl border border-[#e8ecf1] p-3">
            <span className="text-[#8b93a1] block">Waiting On</span>
            <span className="font-medium text-[#005a40] mt-0.5 block">
              {ticket.waitingOn || 'Support'}
            </span>
          </div>
          <div className="rounded-xl border border-[#e8ecf1] p-3">
            <span className="text-[#8b93a1] block">Created</span>
            <span className="font-medium text-[#111827] mt-0.5 block">
              {new Date(ticket.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })},{' '}
              {new Date(ticket.createdAt).toLocaleDateString([], { day: 'numeric', month: 'short' })}
            </span>
          </div>
          <div className="rounded-xl border border-[#e8ecf1] p-3">
            <span className="text-[#8b93a1] block">Last Activity</span>
            <span className="font-medium text-[#111827] mt-0.5 block">
              {new Date(ticket.lastActivityAt || ticket.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </div>

        {/* Message Snippet */}
        <div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#374151] mb-2">
            <MessageSquare className="h-3.5 w-3.5 text-[#005a40]" />
            <span>Initial Client Request</span>
          </div>
          <div className="rounded-xl border border-[#e8ecf1] bg-white p-3 text-xs leading-relaxed text-[#4b5563]">
            {firstMessage?.body || 'No initial message available.'}
          </div>
        </div>

        {latestMessage && latestMessage.id !== firstMessage?.id ? (
          <div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[#374151] mb-2">
              <Clock className="h-3.5 w-3.5 text-[#005a40]" />
              <span>Latest Activity / Response</span>
            </div>
            <div className="rounded-xl border border-[#e8ecf1] bg-[#f0fdf4] p-3 text-xs leading-relaxed text-[#166534]">
              <span className="font-semibold">{latestMessage.author}:</span> {latestMessage.body}
            </div>
          </div>
        ) : null}

        {/* Privacy Note */}
        <div className="flex items-center gap-2 text-[11px] text-[#6b7280] pt-2 border-t border-[#e8ecf1]">
          <ShieldCheck className="h-3.5 w-3.5 text-[#005a40]" />
          <span>Restricted to support care. Medical records not displayed.</span>
        </div>
      </div>
    </Drawer>
  )
}
