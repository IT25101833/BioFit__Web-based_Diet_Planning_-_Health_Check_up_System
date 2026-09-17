import { useEffect, useState } from 'react'
import LoadingSkeleton from '../../../components/ui/LoadingSkeleton'
import ErrorState from '../../../components/ui/ErrorState'
import SupportStats from './components/SupportStats'
import AttentionTickets from './components/AttentionTickets'
import QueuePreview from './components/QueuePreview'
import RecentInquiriesList from './components/RecentInquiriesList'
import SupportCategoryChart from './components/SupportCategoryChart'
import TicketStatusDonut from './components/TicketStatusDonut'
import SupportActivity from './components/SupportActivity'
import FeedbackPreview from './components/FeedbackPreview'
import SupportPerformance from './components/SupportPerformance'
import SupportQuickActions from './components/SupportQuickActions'
import { fetchSupportDashboard } from './data/supportDashboardData'
import { fetchSupportTickets } from '../tickets/data/supportTicketsData'
import { subscribeSupportMock } from '../data/supportMockStore'

export default function SupportDashboard() {
  const [data, setData] = useState(null)
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function load({ quiet = false } = {}) {
    if (!quiet) setLoading(true)
    setError('')
    try {
      const [dashData, ticketsData] = await Promise.all([
        fetchSupportDashboard(),
        fetchSupportTickets(),
      ])
      setData(dashData)
      setTickets(ticketsData)
    } catch {
      setError('We couldn’t load the support dashboard.')
    } finally {
      if (!quiet) setLoading(false)
    }
  }

  useEffect(() => {
    load()
    return subscribeSupportMock(() => load({ quiet: true }))
  }, [])

  if (loading) return <LoadingSkeleton rows={6} />
  if (error || !data) {
    return (
      <div className="w-full">
        <ErrorState title={error || 'Failed to load dashboard'} onRetry={load} />
      </div>
    )
  }

  const todayLabel = new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
  const ticketList = Array.isArray(tickets) ? tickets : []
  const attentionTickets = (() => {
    const live = ticketList
      .filter((t) => ['Open', 'Escalated', 'Assigned'].includes(t.status) || !t.assignedTo)
      .slice(0, 6)
      .map((t) => ({
        id: t.id,
        subject: t.subject,
        client: t.client?.name,
        clientId: t.client?.id,
        status: t.status,
        priority: t.priority,
        reason: !t.assignedTo
          ? `Unassigned · ${t.priority || 'Normal'} priority`
          : `${t.status} · ${t.category}`,
        waitingTime: t.waitingTimeMinutes != null ? `Waiting ${t.waitingTimeMinutes} min` : 'Just now',
        category: t.category,
      }))
    if (live.length > 0) return live
    return Array.isArray(data.attentionTickets) ? data.attentionTickets : []
  })()
  const categoryBreakdown = Array.isArray(data.categoryBreakdown) ? data.categoryBreakdown : []
  const statusOverview = Array.isArray(data.statusOverview) ? data.statusOverview : []
  const recentInquiries = Array.isArray(data.recentInquiries) ? data.recentInquiries : []
  const recentFeedback = Array.isArray(data.recentFeedback) ? data.recentFeedback : []
  const recentActivity = Array.isArray(data.recentActivity) ? data.recentActivity : []
  const performance = data.performance || {}

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="mb-2">
        <p className="text-[12px] font-semibold tracking-wide text-[#005a40] uppercase">
          {todayLabel}
        </p>
        <h1 className="mt-1 font-display text-2xl font-bold tracking-tight text-[#111827] sm:text-[1.75rem]">
          Good morning, {data.officerName}
        </h1>
        <p className="mt-1.5 text-sm text-[#6b7280]">
          Here’s an overview of current support requests and client service activity.
        </p>
      </div>

      {/* Top 4 Summary Stat Cards */}
      <SupportStats
        stats={{
          openTickets: {
            value: ticketList.filter((t) => t.status === 'Open' || !t.assignedTo).length,
            hint: 'Awaiting action',
          },
          inProgress: {
            value: ticketList.filter((t) => t.status === 'In Progress' || t.status === 'Assigned').length,
            hint: 'Currently being handled',
          },
          resolvedToday: {
            value: ticketList.filter((t) => t.status === 'Resolved' || t.status === 'Closed').length,
            hint: 'Resolved or closed',
          },
          pendingReply: {
            value: ticketList.filter((t) => t.status === 'Pending Client Reply').length,
            hint: 'Awaiting client response',
          },
        }}
      />

      {/* Tickets Requiring Attention */}
      <AttentionTickets items={attentionTickets} />

      {/* Quick Navigation Shortcuts */}
      <SupportQuickActions />

      {/* Main Ticket Queue Preview */}
      <QueuePreview tickets={ticketList} />

      {/* Visual Charts: Category Breakdown & Status Donut */}
      <div className="grid gap-6 lg:grid-cols-2">
        <SupportCategoryChart categories={categoryBreakdown} />
        <TicketStatusDonut statusOverview={statusOverview} />
      </div>

      {/* Inquiries & Feedback Section */}
      <div className="grid gap-6 lg:grid-cols-2">
        <RecentInquiriesList inquiries={recentInquiries} />
        <FeedbackPreview feedback={recentFeedback} />
      </div>

      {/* Real-Time Activity Feed & Performance Benchmarks */}
      <div className="grid gap-6 lg:grid-cols-2">
        <SupportActivity activities={recentActivity} />
        <SupportPerformance performance={performance} />
      </div>
    </div>
  )
}
