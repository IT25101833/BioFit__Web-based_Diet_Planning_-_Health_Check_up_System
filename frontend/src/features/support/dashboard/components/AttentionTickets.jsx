import { Link } from 'react-router-dom'
import { AlertCircle, ArrowRight, Clock, User } from 'lucide-react'
import StatusBadge from '../../../../components/ui/StatusBadge'

export default function AttentionTickets({ items = [] }) {
  if (items.length === 0) return null

  return (
    <div className="rounded-3xl border border-amber-200/80 bg-amber-50/40 p-5 shadow-xs sm:p-6 mb-6">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-200 text-amber-900">
            <AlertCircle className="h-4 w-4" />
          </span>
          <div>
            <h2 className="font-display text-base font-bold text-amber-950">
              Tickets Requiring Attention
            </h2>
            <p className="text-xs text-amber-800">
              High priority cases, overdue responses or pending specialist escalations
            </p>
          </div>
        </div>
        <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800 border border-amber-200">
          {items.length} items
        </span>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex flex-col justify-between rounded-2xl border border-amber-200/70 bg-white p-4 shadow-2xs hover:shadow-xs transition-shadow"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="font-mono text-xs font-bold text-[#111827]">{item.id}</span>
                <StatusBadge status={item.status} />
              </div>

              <h3 className="font-display text-xs font-bold text-[#111827] line-clamp-2 leading-snug">
                {item.subject}
              </h3>

              <div className="mt-2 space-y-1 text-[11px] text-[#6b7280]">
                <p className="font-medium text-[#374151] flex items-center gap-1">
                  <User className="h-3 w-3 text-[#9ca3af]" />
                  <span>{typeof item.client === 'string' ? item.client : item.client?.name || item.clientName || 'Client'}</span>
                </p>
                <p className="text-amber-700 font-medium flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>{item.waitingTime}</span>
                </p>
                <p className="text-[10px] text-[#8b93a1] truncate">{item.reason}</p>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-[#f4f6fb]">
              <Link
                to={`/support/tickets/${item.id}`}
                className="inline-flex w-full items-center justify-center gap-1 rounded-xl bg-[#005a40] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#004833] transition-colors"
              >
                <span>Respond</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
