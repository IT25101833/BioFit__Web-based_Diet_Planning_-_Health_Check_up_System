import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../../../auth/AuthContext'
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
import { subscribeSupportMock } from '../data/supportMockStore'

export default function SupportTickets() {
  const { user } = useAuth()
  const officerName =
    user?.fullName ||
    [user?.firstName, user?.lastName].filter(Boolean).join(' ') ||
    'Support'

  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [toast, setToast] = useState('')

  // Search, Filters & Sorting
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [status, setStatus] = useState('')
  const [priority, setPriority] = useState('')
  const [assignedTo, setAssignedTo] = useState('')
  const [sortBy, setSortBy] = useState('newest')

  // Selected ticket for preview drawer & modals
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [assignModalOpen, setAssignModalOpen] = useState(false)
  const [modalTargetTicket, setModalTargetTicket] = useState(null)
  const [escalateModalOpen, setEscalateModalOpen] = useState(false)
  const [resolveModalOpen, setResolveModalOpen] = useState(false)

  async function load({ quiet = false } = {}) {
    if (!quiet) setLoading(true)
    setError('')
    try {
      const data = await fetchSupportTickets()
      setTickets(data)
    } catch {
      setError('We couldn’t load the support tickets.')
    } finally {
      if (!quiet) setLoading(false)
    }
  }

  useEffect(() => {
    load()
    return subscribeSupportMock(() => load({ quiet: true }))
  }, [])

  // Filter and sort calculation
  const filteredTickets = useMemo(() => {
    let result = [...tickets]

    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(
        (t) =>
          t.id.toLowerCase().includes(q) ||
          t.subject.toLowerCase().includes(q) ||
          t.client?.name.toLowerCase().includes(q) ||
          t.client?.id.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q)
      )
    }

    if (category) {
      result = result.filter((t) => t.category === category)
    }

    if (status) {
      result = result.filter((t) => t.status === status)
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
      if (sortBy === 'newest') return new Date(b.createdAt) - new Date(a.createdAt)
      if (sortBy === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt)
      if (sortBy === 'updated') {
        return new Date(b.lastActivityAt || b.updatedAt) - new Date(a.lastActivityAt || a.updatedAt)
      }
      if (sortBy === 'waiting') {
        return (b.waitingTimeMinutes || 0) - (a.waitingTimeMinutes || 0)
      }
      if (sortBy === 'priority') {
        const weights = { Urgent: 4, High: 3, Medium: 2, Low: 1 }
        return (weights[b.priority] || 0) - (weights[a.priority] || 0)
      }
      return 0
    })

    return result
  }, [tickets, search, category, status, priority, assignedTo, sortBy])

  // Counts for summary cards
  const counts = useMemo(() => {
    return {
      all: tickets.length,
      open: tickets.filter((t) => t.status === 'Open').length,
      inProgress: tickets.filter((t) => t.status === 'In Progress').length,
      pendingReply: tickets.filter((t) => t.status === 'Pending Client Reply').length,
      resolved: tickets.filter((t) => t.status === 'Resolved').length,
    }
  }, [tickets])

  const hasActiveFilters = Boolean(search || category || status || priority || assignedTo || sortBy !== 'newest')

  function handleResetFilters() {
    setSearch('')
    setCategory('')
    setStatus('')
    setPriority('')
    setAssignedTo('')
    setSortBy('newest')
  }

  // Row selection handler -> opens drawer
  function handleSelectTicket(t) {
    setSelectedTicket(t)
    setDrawerOpen(true)
  }

  async function handleAssignToMe(ticketId) {
    if (!officerName) {
      setToast('Could not determine your officer profile. Please sign in again.')
      return
    }
    try {
      const updated = await assignSupportTicket(ticketId, officerName)
      setTickets((prev) => prev.map((t) => (t.id === ticketId ? updated : t)))
      if (selectedTicket?.id === ticketId) setSelectedTicket(updated)
      setToast(`Ticket ${ticketId} assigned to you.`)
    } catch {
      setToast('Could not assign ticket. Please try again.')
    }
  }

  async function handleModalAssign(assignee) {
    if (!modalTargetTicket) return
    try {
      const updated = await assignSupportTicket(modalTargetTicket.id, assignee)
      setTickets((prev) => prev.map((t) => (t.id === modalTargetTicket.id ? updated : t)))
      if (selectedTicket?.id === modalTargetTicket.id) setSelectedTicket(updated)
      setToast(`Ticket assigned to ${assignee}.`)
    } catch {
      setToast('Could not assign ticket. Please try again.')
    }
  }

  async function handleModalEscalate(payload) {
    if (!modalTargetTicket) return
    try {
      const updated = await escalateSupportTicket(modalTargetTicket.id, payload)
      setTickets((prev) => prev.map((t) => (t.id === modalTargetTicket.id ? updated : t)))
      if (selectedTicket?.id === modalTargetTicket.id) setSelectedTicket(updated)
      setToast(`Ticket escalated to ${payload.escalateTo}.`)
    } catch {
      setToast('Could not escalate ticket. Please try again.')
    }
  }

  async function handleModalResolve(payload) {
    if (!modalTargetTicket) return
    try {
      const updated = await resolveSupportTicket(modalTargetTicket.id, payload)
      setTickets((prev) => prev.map((t) => (t.id === modalTargetTicket.id ? updated : t)))
      if (selectedTicket?.id === modalTargetTicket.id) setSelectedTicket(updated)
      setToast(`Ticket ${modalTargetTicket.id} marked as Resolved.`)
    } catch {
      setToast('Could not resolve ticket. Please try again.')
    }
  }

  if (loading) return <LoadingSkeleton rows={6} />
  if (error) return <ErrorState title={error} onRetry={load} />

  return (
    <div className="space-y-6">
      <PageHeader
        title="Support Tickets"
        description="Review and manage BioFit client support requests."
      />

      {/* Top Summary Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        <div
          onClick={() => setStatus('')}
          className={[
            'cursor-pointer rounded-2xl border p-4 transition-all shadow-xs',
            !status ? 'border-[#005a40] bg-[#e6f5f0]/50 ring-1 ring-[#005a40]' : 'border-[#e8ecf1] bg-white hover:bg-[#f8faf9]'
          ].join(' ')}
        >
          <span className="text-xs text-[#6b7280]">All Tickets</span>
          <p className="mt-1 font-display text-2xl font-bold text-[#111827]">{counts.all}</p>
        </div>

        <div
          onClick={() => setStatus('Open')}
          className={[
            'cursor-pointer rounded-2xl border p-4 transition-all shadow-xs',
            status === 'Open' ? 'border-[#005a40] bg-[#e6f5f0]/50 ring-1 ring-[#005a40]' : 'border-[#e8ecf1] bg-white hover:bg-[#f8faf9]'
          ].join(' ')}
        >
          <span className="text-xs text-[#6b7280]">Open</span>
          <p className="mt-1 font-display text-2xl font-bold text-amber-600">{counts.open}</p>
        </div>

        <div
          onClick={() => setStatus('In Progress')}
          className={[
            'cursor-pointer rounded-2xl border p-4 transition-all shadow-xs',
            status === 'In Progress' ? 'border-[#005a40] bg-[#e6f5f0]/50 ring-1 ring-[#005a40]' : 'border-[#e8ecf1] bg-white hover:bg-[#f8faf9]'
          ].join(' ')}
        >
          <span className="text-xs text-[#6b7280]">In Progress</span>
          <p className="mt-1 font-display text-2xl font-bold text-[#0d9488]">{counts.inProgress}</p>
        </div>

        <div
          onClick={() => setStatus('Pending Client Reply')}
          className={[
            'cursor-pointer rounded-2xl border p-4 transition-all shadow-xs',
            status === 'Pending Client Reply' ? 'border-[#005a40] bg-[#e6f5f0]/50 ring-1 ring-[#005a40]' : 'border-[#e8ecf1] bg-white hover:bg-[#f8faf9]'
          ].join(' ')}
        >
          <span className="text-xs text-[#6b7280]">Pending Reply</span>
          <p className="mt-1 font-display text-2xl font-bold text-amber-700">{counts.pendingReply}</p>
        </div>

        <div
          onClick={() => setStatus('Resolved')}
          className={[
            'cursor-pointer rounded-2xl border p-4 transition-all shadow-xs col-span-2 sm:col-span-1',
            status === 'Resolved' ? 'border-[#005a40] bg-[#e6f5f0]/50 ring-1 ring-[#005a40]' : 'border-[#e8ecf1] bg-white hover:bg-[#f8faf9]'
          ].join(' ')}
        >
          <span className="text-xs text-[#6b7280]">Resolved</span>
          <p className="mt-1 font-display text-2xl font-bold text-[#005a40]">{counts.resolved}</p>
        </div>
      </div>

      {/* Filters Bar */}
      <TicketFilters
        search={search}
        onSearchChange={setSearch}
        category={category}
        onCategoryChange={setCategory}
        status={status}
        onStatusChange={setStatus}
        priority={priority}
        onPriorityChange={setPriority}
        assignedTo={assignedTo}
        onAssignedToChange={setAssignedTo}
        sortBy={sortBy}
        onSortByChange={setSortBy}
        onReset={handleResetFilters}
        hasActiveFilters={hasActiveFilters}
      />

      {/* Ticket Table */}
      <TicketTable
        tickets={filteredTickets}
        officerName={officerName}
        onSelectTicket={handleSelectTicket}
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

      {/* Quick Drawer Preview */}
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
        officerName={officerName}
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
