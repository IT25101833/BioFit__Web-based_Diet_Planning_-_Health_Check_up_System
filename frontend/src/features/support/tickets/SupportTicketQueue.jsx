import { useEffect, useMemo, useState } from 'react'
import { Inbox, UserCheck, Clock, AlertCircle, ArrowUpRight, CheckCircle2 } from 'lucide-react'
import PageHeader from '../../../components/ui/PageHeader'
import LoadingSkeleton from '../../../components/ui/LoadingSkeleton'
import ErrorState from '../../../components/ui/ErrorState'
import Toast from '../../../components/ui/Toast'
import TicketFilters from './components/TicketFilters'
import TicketTable from './components/TicketTable'
import TicketPreviewDrawer from './components/TicketPreviewDrawer'
import AssignTicketModal from './components/AssignTicketModal'
import EscalateTicketModal from './components/EscalateTicketModal'
import ResolveTicketModal from './components/ResolveTicketModal'
import {
  fetchSupportTickets,
  assignSupportTicket,
  escalateSupportTicket,
  resolveSupportTicket,
} from './data/supportTicketsData'

const queueTabs = [
  { id: 'all', label: 'All Tickets' },
  { id: 'unassigned', label: 'Unassigned' },
  { id: 'my-tickets', label: 'My Tickets' },
  { id: 'Open', label: 'Open' },
  { id: 'In Progress', label: 'In Progress' },
  { id: 'Pending Client Reply', label: 'Pending Reply' },
  { id: 'Escalated', label: 'Escalated' },
  { id: 'Resolved', label: 'Resolved' },
]

export default function SupportTicketQueue() {
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('all')
  const [toast, setToast] = useState('')

  // Filters
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [priority, setPriority] = useState('')
  const [assignedTo, setAssignedTo] = useState('')
  const [sortBy, setSortBy] = useState('waiting')

  // Drawer and modals
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [assignModalOpen, setAssignModalOpen] = useState(false)
  const [modalTargetTicket, setModalTargetTicket] = useState(null)
  const [escalateModalOpen, setEscalateModalOpen] = useState(false)
  const [resolveModalOpen, setResolveModalOpen] = useState(false)

  async function load() {
    setLoading(true)
    setError('')
    try {
      const data = await fetchSupportTickets()
      setTickets(data)
    } catch {
      setError('We couldn’t load the support ticket queue.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  // Tab counts
  const tabCounts = useMemo(() => {
    return {
      all: tickets.length,
      unassigned: tickets.filter((t) => !t.assignedTo).length,
      'my-tickets': tickets.filter((t) => t.assignedTo === 'Priya Nair').length,
      Open: tickets.filter((t) => t.status === 'Open').length,
      'In Progress': tickets.filter((t) => t.status === 'In Progress').length,
      'Pending Client Reply': tickets.filter((t) => t.status === 'Pending Client Reply').length,
      Escalated: tickets.filter((t) => t.status === 'Escalated').length,
      Resolved: tickets.filter((t) => t.status === 'Resolved').length,
    }
  }, [tickets])

  // Filtered tickets
  const filteredTickets = useMemo(() => {
    let result = [...tickets]

    // Active tab filter
    if (activeTab === 'unassigned') {
      result = result.filter((t) => !t.assignedTo)
    } else if (activeTab === 'my-tickets') {
      result = result.filter((t) => t.assignedTo === 'Priya Nair')
    } else if (activeTab !== 'all') {
      result = result.filter((t) => t.status === activeTab)
    }

    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(
        (t) =>
          t.id.toLowerCase().includes(q) ||
          t.subject.toLowerCase().includes(q) ||
          t.client?.name.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q)
      )
    }

    if (category) {
      result = result.filter((t) => t.category === category)
    }

    if (priority) {
      result = result.filter((t) => t.priority === priority)
    }

    if (assignedTo) {
      if (assignedTo === 'unassigned') {
        result = result.filter((t) => !t.assignedTo)
      } else {
        result = result.filter((t) => t.assignedTo === assignedTo)
      }
    }

    // Sorting
    result.sort((a, b) => {
      if (sortBy === 'waiting') return (b.waitingTimeMinutes || 0) - (a.waitingTimeMinutes || 0)
      if (sortBy === 'newest') return new Date(b.createdAt) - new Date(a.createdAt)
      if (sortBy === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt)
      if (sortBy === 'updated') {
        return new Date(b.lastActivityAt || b.updatedAt) - new Date(a.lastActivityAt || a.updatedAt)
      }
      if (sortBy === 'priority') {
        const weights = { High: 3, Normal: 2, Low: 1 }
        return (weights[b.priority] || 0) - (weights[a.priority] || 0)
      }
      return 0
    })

    return result
  }, [tickets, activeTab, search, category, priority, assignedTo, sortBy])

  function handleResetFilters() {
    setSearch('')
    setCategory('')
    setPriority('')
    setAssignedTo('')
    setSortBy('waiting')
  }

  // Quick actions
  async function handleAssignToMe(ticketId) {
    const updated = await assignSupportTicket(ticketId, 'Priya Nair')
    setTickets((prev) => prev.map((t) => (t.id === ticketId ? updated : t)))
    if (selectedTicket?.id === ticketId) setSelectedTicket(updated)
    setToast(`Ticket ${ticketId} assigned to you.`)
  }

  async function handleModalAssign(officerName) {
    if (!modalTargetTicket) return
    const updated = await assignSupportTicket(modalTargetTicket.id, officerName)
    setTickets((prev) => prev.map((t) => (t.id === modalTargetTicket.id ? updated : t)))
    if (selectedTicket?.id === modalTargetTicket.id) setSelectedTicket(updated)
    setToast(`Ticket assigned to ${officerName}.`)
  }

  async function handleModalEscalate(payload) {
    if (!modalTargetTicket) return
    const updated = await escalateSupportTicket(modalTargetTicket.id, payload)
    setTickets((prev) => prev.map((t) => (t.id === modalTargetTicket.id ? updated : t)))
    if (selectedTicket?.id === modalTargetTicket.id) setSelectedTicket(updated)
    setToast(`Ticket escalated to ${payload.escalateTo}.`)
  }

  async function handleModalResolve(payload) {
    if (!modalTargetTicket) return
    const updated = await resolveSupportTicket(modalTargetTicket.id, payload)
    setTickets((prev) => prev.map((t) => (t.id === modalTargetTicket.id ? updated : t)))
    if (selectedTicket?.id === modalTargetTicket.id) setSelectedTicket(updated)
    setToast(`Ticket ${modalTargetTicket.id} marked as Resolved.`)
  }

  if (loading) return <LoadingSkeleton rows={6} />
  if (error) return <ErrorState title={error} onRetry={load} />

  return (
    <div className="space-y-6">
      <PageHeader
        title="Support Ticket Queue"
        description="Review, prioritize and assign incoming client support requests."
      />

      {/* Queue Summary Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        <div className="rounded-2xl border border-[#e8ecf1] bg-white p-4 shadow-xs">
          <span className="text-xs text-[#6b7280]">Open Queue</span>
          <p className="mt-1 font-display text-2xl font-bold text-amber-600">{tabCounts.Open}</p>
        </div>
        <div className="rounded-2xl border border-[#e8ecf1] bg-white p-4 shadow-xs">
          <span className="text-xs text-[#6b7280]">Unassigned</span>
          <p className="mt-1 font-display text-2xl font-bold text-rose-600">{tabCounts.unassigned}</p>
        </div>
        <div className="rounded-2xl border border-[#e8ecf1] bg-white p-4 shadow-xs">
          <span className="text-xs text-[#6b7280]">In Progress</span>
          <p className="mt-1 font-display text-2xl font-bold text-[#0d9488]">{tabCounts['In Progress']}</p>
        </div>
        <div className="rounded-2xl border border-[#e8ecf1] bg-white p-4 shadow-xs">
          <span className="text-xs text-[#6b7280]">Pending Client Reply</span>
          <p className="mt-1 font-display text-2xl font-bold text-amber-700">{tabCounts['Pending Client Reply']}</p>
        </div>
        <div className="rounded-2xl border border-[#e8ecf1] bg-white p-4 shadow-xs col-span-2 sm:col-span-1">
          <span className="text-xs text-[#6b7280]">Escalated</span>
          <p className="mt-1 font-display text-2xl font-bold text-purple-700">{tabCounts.Escalated}</p>
        </div>
      </div>

      {/* Queue Tabs with Count Badges */}
      <div className="flex items-center gap-1 overflow-x-auto border-b border-[#e8ecf1] pb-2 scrollbar-none">
        {queueTabs.map((tab) => {
          const isActive = activeTab === tab.id
          const count = tabCounts[tab.id] ?? 0

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={[
                'flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold whitespace-nowrap transition-all',
                isActive
                  ? 'bg-[#005a40] text-white shadow-xs'
                  : 'text-[#6b7280] hover:bg-[#f4f6fb] hover:text-[#111827]',
              ].join(' ')}
            >
              <span>{tab.label}</span>
              <span
                className={[
                  'rounded-full px-1.5 py-0.2 text-[10px] font-bold',
                  isActive ? 'bg-white/25 text-white' : 'bg-[#e8ecf1] text-[#4b5563]',
                ].join(' ')}
              >
                {count}
              </span>
            </button>
          )
        })}
      </div>

      {/* Filters Bar */}
      <TicketFilters
        search={search}
        onSearchChange={setSearch}
        category={category}
        onCategoryChange={setCategory}
        status=""
        onStatusChange={() => {}}
        priority={priority}
        onPriorityChange={setPriority}
        assignedTo={assignedTo}
        onAssignedToChange={setAssignedTo}
        sortBy={sortBy}
        onSortByChange={setSortBy}
        onReset={handleResetFilters}
        hasActiveFilters={Boolean(search || category || priority || assignedTo || sortBy !== 'waiting')}
      />

      {/* Main Queue Table */}
      <TicketTable
        tickets={filteredTickets}
        onSelectTicket={(t) => {
          setSelectedTicket(t)
          setDrawerOpen(true)
        }}
        onAssignToMe={handleAssignToMe}
        onOpenAssignModal={(t) => {
          setModalTargetTicket(t)
          setAssignModalOpen(true)
        }}
        onOpenEscalateModal={(t) => {
          setModalTargetTicket(t)
          setEscalateModalOpen(true)
        }}
        onOpenResolveModal={(t) => {
          setModalTargetTicket(t)
          setResolveModalOpen(true)
        }}
      />

      {/* Drawer */}
      <TicketPreviewDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        ticket={selectedTicket}
        onAssignToMe={handleAssignToMe}
      />

      {/* Modals */}
      <AssignTicketModal
        open={assignModalOpen}
        onClose={() => {
          setAssignModalOpen(false)
          setModalTargetTicket(null)
        }}
        ticket={modalTargetTicket}
        onAssign={handleModalAssign}
      />

      <EscalateTicketModal
        open={escalateModalOpen}
        onClose={() => {
          setEscalateModalOpen(false)
          setModalTargetTicket(null)
        }}
        ticket={modalTargetTicket}
        onEscalate={handleModalEscalate}
      />

      <ResolveTicketModal
        open={resolveModalOpen}
        onClose={() => {
          setResolveModalOpen(false)
          setModalTargetTicket(null)
        }}
        ticket={modalTargetTicket}
        onResolve={handleModalResolve}
      />

      <Toast open={!!toast} message={toast} onClose={() => setToast('')} />
    </div>
  )
}
