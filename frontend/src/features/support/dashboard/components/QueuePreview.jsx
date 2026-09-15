import { Link } from 'react-router-dom'
import { ArrowRight, Inbox } from 'lucide-react'
import StatusBadge from '../../../../components/ui/StatusBadge'

export default function QueuePreview({ tickets = [] }) {
  const displayTickets = tickets.slice(0, 5)

  return (
    <div className="rounded-3xl border border-[#e8ecf1] bg-white p-5 shadow-xs sm:p-6 mb-6">
      <div className="flex items-center justify-between gap-3 border-b border-[#eef2f0] pb-4 mb-4">
        <div>
          <h2 className="font-display text-base font-bold text-[#111827]">
            Support Ticket Queue
          </h2>
          <p className="text-xs text-[#6b7280]">
            Latest active inquiries awaiting officer triage or response
          </p>
        </div>
        <Link
          to="/support/ticket-queue"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#005a40] hover:underline"
        >
          <span>View All Tickets</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-[#4b5563]">
          <thead className="border-b border-[#e8ecf1] bg-[#f8faf9] text-[11px] font-semibold uppercase tracking-wider text-[#6b7280]">
            <tr>
              <th className="px-4 py-3">Ticket ID</th>
              <th className="px-4 py-3">Client</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-3 py-3">Priority</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Assigned To</th>
              <th className="px-4 py-3">Created</th>
              <th className="px-4 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e8ecf1]">
            {displayTickets.map((t) => (
              <tr key={t.id} className="hover:bg-[#f8faf9] transition-colors">
                <td className="px-4 py-3 font-mono font-bold text-[#111827] whitespace-nowrap">
                  {t.id}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className="font-medium text-[#111827]">{t.client?.name}</span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">{t.category}</td>
                <td className="px-3 py-3 whitespace-nowrap">
                  <span
                    className={[
                      'rounded-md px-2 py-0.5 text-[10px] font-semibold',
                      t.priority === 'High' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700',
                    ].join(' ')}
                  >
                    {t.priority}
                  </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <StatusBadge status={t.status} />
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className={t.assignedTo ? 'text-[#111827]' : 'text-amber-700 font-semibold'}>
                    {t.assignedTo || 'Unassigned'}
                  </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-[11px] text-[#6b7280]">
                  {new Date(t.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </td>
                <td className="px-4 py-3 text-right whitespace-nowrap">
                  <Link
                    to={`/support/tickets/${t.id}`}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-[#005a40] hover:underline"
                  >
                    <span>Open Ticket</span>
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
