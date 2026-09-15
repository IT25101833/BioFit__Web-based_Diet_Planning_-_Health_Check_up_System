import { MessageSquare } from 'lucide-react'
import TicketResponseCard from './TicketResponseCard'
import EmptyState from '../../../../components/ui/EmptyState'

export default function ConversationThread({ messages = [] }) {
  if (messages.length === 0) {
    return (
      <EmptyState
        icon={MessageSquare}
        title="No messages yet"
        description="This ticket does not have any communication logged."
      />
    )
  }

  return (
    <div className="space-y-3.5">
      <div className="flex items-center justify-between pb-1">
        <h2 className="font-display text-sm font-bold uppercase tracking-wider text-[#6b7280]">
          Conversation History ({messages.length})
        </h2>
        <span className="text-xs text-[#8b93a1]">Chronological thread</span>
      </div>

      <div className="space-y-3.5">
        {messages.map((msg) => (
          <TicketResponseCard key={msg.id} response={msg} />
        ))}
      </div>
    </div>
  )
}
