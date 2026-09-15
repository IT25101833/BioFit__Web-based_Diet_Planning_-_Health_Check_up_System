import { useNavigate } from 'react-router-dom'
import { ArrowUpRight, CheckCircle, ExternalLink, Inbox, MessageSquare, UserCheck } from 'lucide-react'
import StatusBadge from '../../../../components/ui/StatusBadge'
import ActionMenu from '../../../../components/ui/ActionMenu'
import Avatar from '../../../../components/ui/Avatar'
import EmptyState from '../../../../components/ui/EmptyState'

export default function TicketTable({
  tickets = [],
  onSelectTicket,
  onAssignToMe,
  onOpenAssignModal,
  onOpenEscalateModal,
  onOpenResolveModal,
}) {
  const navigate = useNavigate()

  if (tickets.length === 0) {
    return (
      <div className="rounded-3xl border border-[#e8ecf1] bg-white p-8">
        <EmptyState
          icon={Inbox}
          title="No support tickets found"
          description="Try adjusting your search criteria, category or status filters."
        />
      </div>
    )
  }

  return (
    <div className="rounded-3xl border border-[#e8ecf1] bg-white shadow-xs overflow-hidden">
      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left text-xs text-[#4b5563]">
          <thead className="border-b border-[#e8ecf1] bg-[#f8faf9] text-[11px] font-semibold uppercase tracking-wider text-[#6b7280]">
            <tr>
              <th className="px-5 py-3.5">Ticket ID</th>
              <th className="px-4 py-3.5">Client</th>
              <th className="px-4 py-3.5">Subject</th>
              <th className="px-4 py-3.5">Category</th>
              <th className="px-3 py-3.5">Priority</th>
              <th className="px-4 py-3.5">Status</th>
              <th className="px-4 py-3.5">Assigned To</th>
              <th className="px-4 py-3.5">Last Activity</th>
              <th className="px-4 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e8ecf1]">
            {tickets.map((t) => {
              const isHigh = t.priority === 'High'
              const isResolved = t.status === 'Resolved' || t.status === 'Closed'

              return (
                <tr
                  key={t.id}
                  onClick={() => onSelectTicket(t)}
                  className="cursor-pointer transition-colors hover:bg-[#f8faf9]/90 group"
                >
                  <td className="px-5 py-4 font-mono font-bold text-[#111827] whitespace-nowrap">
                    {t.id}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2.5">
                      <Avatar name={t.client?.name} size="sm" />
                      <div className="min-w-0">
                        <span className="font-semibold text-[#111827] block truncate">
                          {t.client?.name}
                        </span>
                        <span className="text-[11px] text-[#8b93a1] block">
                          {t.client?.id}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 max-w-[220px]">
                    <span className="font-medium text-[#1f2937] line-clamp-1 group-hover:text-[#005a40]">
                      {t.subject}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-[#4b5563] whitespace-nowrap">
                    {t.category}
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap">
                    <span
                      className={[
                        'rounded-md px-2 py-0.5 text-[11px] font-medium',
                        isHigh ? 'bg-amber-100 text-amber-800 font-semibold' : 'bg-slate-100 text-slate-700',
                      ].join(' ')}
                    >
                      {t.priority}
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <StatusBadge status={t.status} />
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span
                      className={[
                        'text-xs font-medium',
                        t.assignedTo ? 'text-[#111827]' : 'text-amber-700 font-semibold',
                      ].join(' ')}
                    >
                      {t.assignedTo || 'Unassigned'}
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-[11px] text-[#6b7280]">
                    {new Date(t.lastActivityAt || t.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td
                    className="px-4 py-4 text-right whitespace-nowrap"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ActionMenu
                      label="Ticket Actions"
                      items={[
                        {
                          label: 'Open Full Ticket',
                          onClick: () => navigate(`/support/tickets/${t.id}`),
                        },
                        {
                          label: 'Assign to Me',
                          onClick: () => onAssignToMe(t.id),
                          disabled: t.assignedTo === 'Priya Nair',
                        },
                        {
                          label: 'Assign to Officer…',
                          onClick: () => onOpenAssignModal(t),
                        },
                        {
                          label: 'Respond to Client',
                          onClick: () => navigate(`/support/tickets/${t.id}`),
                        },
                        {
                          label: 'Escalate to Specialist…',
                          onClick: () => onOpenEscalateModal(t),
                          disabled: isResolved,
                        },
                        {
                          label: 'Resolve Ticket…',
                          onClick: () => onOpenResolveModal(t),
                          disabled: isResolved,
                        },
                      ]}
                    />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Card List View */}
      <div className="md:hidden divide-y divide-[#e8ecf1]">
        {tickets.map((t) => (
          <div
            key={t.id}
            onClick={() => onSelectTicket(t)}
            className="p-4 space-y-3 cursor-pointer hover:bg-[#f8faf9]"
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-[#111827]">{t.id}</span>
              <div className="flex items-center gap-1.5">
                <StatusBadge status={t.status} />
                <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-700">
                  {t.priority}
                </span>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-[#111827] leading-snug">{t.subject}</h4>
              <p className="text-xs text-[#6b7280] mt-0.5">
                {t.client?.name} · {t.category}
              </p>
            </div>

            <div className="flex items-center justify-between pt-1 text-xs text-[#6b7280]">
              <span>Assigned: {t.assignedTo || 'Unassigned'}</span>
              <span className="font-semibold text-[#005a40]">View →</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
