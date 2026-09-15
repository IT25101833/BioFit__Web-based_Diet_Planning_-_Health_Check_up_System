import { AlertCircle, CheckCircle2, Clock, MessageSquare, Ticket } from 'lucide-react'
import StatCard from '../../../../components/ui/StatCard'

export default function SupportStats({ stats }) {
  if (!stats) return null

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 mb-6">
      <StatCard
        icon={Ticket}
        label="Open Tickets"
        value={stats.openTickets?.value || 18}
        hint={stats.openTickets?.hint || 'Awaiting action'}
      />
      <StatCard
        icon={Clock}
        label="In Progress"
        value={stats.inProgress?.value || 11}
        hint={stats.inProgress?.hint || 'Currently being handled'}
      />
      <StatCard
        icon={CheckCircle2}
        label="Resolved Today"
        value={stats.resolvedToday?.value || 9}
        hint={stats.resolvedToday?.hint || 'Successfully completed'}
      />
      <StatCard
        icon={MessageSquare}
        label="Pending Client Reply"
        value={stats.pendingReply?.value || 6}
        hint={stats.pendingReply?.hint || 'Awaiting response'}
      />
    </div>
  )
}
