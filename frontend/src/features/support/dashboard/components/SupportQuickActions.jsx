import { Link } from 'react-router-dom'
import { Bell, ClipboardList, Inbox, MessageSquareText, ShieldAlert, UserCheck } from 'lucide-react'

const actions = [
  {
    label: 'Open Ticket Queue',
    to: '/support/ticket-queue',
    icon: Inbox,
    color: 'bg-emerald-50 text-[#005a40] border-emerald-100',
    description: 'Prioritize and triage incoming support tickets',
  },
  {
    label: 'View My Assigned Tickets',
    to: '/support/ticket-queue',
    icon: UserCheck,
    color: 'bg-teal-50 text-teal-800 border-teal-100',
    description: 'Direct cases assigned to Priya Nair',
  },
  {
    label: 'Review Client Inquiries',
    to: '/support/inquiries',
    icon: MessageSquareText,
    color: 'bg-cyan-50 text-cyan-800 border-cyan-100',
    description: 'General questions and consultation requests',
  },
  {
    label: 'Review Feedback',
    to: '/support/feedback',
    icon: ClipboardList,
    color: 'bg-indigo-50 text-indigo-800 border-indigo-100',
    description: 'Compliments, ratings and service suggestions',
  },
  {
    label: 'View Complaints',
    to: '/support/feedback',
    icon: ShieldAlert,
    color: 'bg-amber-50 text-amber-800 border-amber-100',
    description: 'Active client concerns under review',
  },
  {
    label: 'View Notifications',
    to: '/support/notifications',
    icon: Bell,
    color: 'bg-slate-50 text-slate-800 border-slate-200',
    description: 'Escalations returned and queue updates',
  },
]

export default function SupportQuickActions() {
  return (
    <div className="rounded-3xl border border-[#e8ecf1] bg-white p-5 shadow-xs sm:p-6 space-y-4 mb-6">
      <div className="flex items-center justify-between border-b border-[#eef2f0] pb-3">
        <h3 className="font-display text-sm font-bold text-[#111827]">
          Quick Actions
        </h3>
        <span className="text-xs text-[#8b93a1]">Support Shortcuts</span>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {actions.map((act) => {
          const Icon = act.icon
          return (
            <Link
              key={act.label}
              to={act.to}
              className="flex flex-col justify-between p-3.5 rounded-2xl border border-[#e8ecf1] bg-[#f8faf9] hover:bg-[#f0fdf4] hover:border-[#005a40]/30 transition-all group"
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`flex h-8 w-8 items-center justify-center rounded-xl border ${act.color}`}>
                  <Icon className="h-4 w-4" />
                </span>
                <span className="text-[#9ca3af] group-hover:text-[#005a40] transition-colors text-xs">
                  →
                </span>
              </div>
              <div>
                <p className="font-semibold text-xs text-[#111827] group-hover:text-[#005a40] transition-colors">
                  {act.label}
                </p>
                <p className="text-[10px] text-[#6b7280] line-clamp-1 mt-0.5">
                  {act.description}
                </p>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
