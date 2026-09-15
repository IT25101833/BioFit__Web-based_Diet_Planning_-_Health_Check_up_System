import { useEffect, useMemo, useState } from 'react'
import { HelpCircle, Plus } from 'lucide-react'
import Button from '../../../components/ui/Button'
import EmptyState from '../../../components/ui/EmptyState'
import ErrorState from '../../../components/ui/ErrorState'
import FilterTabs from '../../../components/ui/FilterTabs'
import LoadingSkeleton from '../../../components/ui/LoadingSkeleton'
import PageHeader from '../../../components/ui/PageHeader'
import StatusBadge from '../../../components/ui/StatusBadge'
import { fetchClientSupportTickets } from './data/supportData'

const tabs = [
  { value: 'Open', label: 'Open' },
  { value: 'In Progress', label: 'In Progress' },
  { value: 'Pending Reply', label: 'Pending Reply' },
  { value: 'Resolved', label: 'Resolved' },
]

export default function ClientSupportTickets() {
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [tab, setTab] = useState('Open')

  async function load() {
    setLoading(true)
    setError('')
    try {
      setTickets(await fetchClientSupportTickets())
    } catch {
      setError('We couldn’t load your support tickets right now.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const filtered = useMemo(
    () => tickets.filter((ticket) => ticket.status === tab),
    [tickets, tab],
  )

  if (loading) return <LoadingSkeleton rows={3} />
  if (error) {
    return (
      <ErrorState
        title="We couldn’t load your support tickets right now."
        onRetry={load}
      />
    )
  }

  return (
    <div>
      <PageHeader
        title="My Support Tickets"
        description="Ask questions and follow conversations with the VitalLife support team."
        actions={
          <Button
            to="/client/support/create"
            className="!bg-[#005a40] !text-white hover:!bg-[#004833]"
          >
            <Plus className="h-4 w-4" />
            Create Support Ticket
          </Button>
        }
      />

      <div className="mb-5">
        <FilterTabs ariaLabel="Ticket status" value={tab} onChange={setTab} options={tabs} />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={HelpCircle}
          title={`No ${tab.toLowerCase()} tickets`}
          description="Create a ticket whenever you need help with your wellness journey."
          actionLabel="Create Support Ticket"
          actionTo="/client/support/create"
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((ticket) => (
            <Button
              key={ticket.id}
              to={`/client/support/${ticket.id}`}
              variant="ghost"
              className="!block !h-auto !w-full !rounded-[1.25rem] !border !border-[#e8ecf1] !bg-white !p-5 !text-left !shadow-[0_8px_24px_rgba(15,23,42,0.04)] hover:!bg-[#f8faf9]"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] font-semibold text-[#8b93a1]">{ticket.id}</p>
                  <h3 className="mt-1 font-display text-base font-bold text-[#111827]">
                    {ticket.subject}
                  </h3>
                  <p className="mt-1 text-sm text-[#6b7280]">{ticket.category}</p>
                </div>
                <StatusBadge status={ticket.status} />
              </div>
            </Button>
          ))}
        </div>
      )}
    </div>
  )
}
