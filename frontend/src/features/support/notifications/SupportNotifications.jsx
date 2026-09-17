import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Bell, CheckCheck, Clock, ExternalLink, Inbox, ShieldAlert, Ticket } from 'lucide-react'
import PageHeader from '../../../components/ui/PageHeader'
import LoadingSkeleton from '../../../components/ui/LoadingSkeleton'
import ErrorState from '../../../components/ui/ErrorState'
import Button from '../../../components/ui/Button'
import EmptyState from '../../../components/ui/EmptyState'
import Toast from '../../../components/ui/Toast'
import {
  fetchSupportNotifications,
  markSupportNotificationRead,
  markAllSupportNotificationsRead,
} from './data/supportNotificationsData'
import { subscribeSupportMock } from '../data/supportMockStore'

const filterTabs = [
  { id: 'all', label: 'All Notifications' },
  { id: 'unread', label: 'Unread' },
  { id: 'tickets', label: 'Tickets' },
  { id: 'escalations', label: 'Escalations' },
  { id: 'feedback', label: 'Feedback & Complaints' },
  { id: 'system', label: 'System' },
]

export default function SupportNotifications() {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeFilter, setActiveFilter] = useState('all')
  const [toast, setToast] = useState('')

  async function load({ quiet = false } = {}) {
    if (!quiet) setLoading(true)
    setError('')
    try {
      const data = await fetchSupportNotifications()
      setNotifications(data)
    } catch {
      setError('We couldn’t load notifications.')
    } finally {
      if (!quiet) setLoading(false)
    }
  }

  useEffect(() => {
    load()
    return subscribeSupportMock(() => load({ quiet: true }))
  }, [])

  const filtered = useMemo(() => {
    if (activeFilter === 'all') return notifications
    if (activeFilter === 'unread') return notifications.filter((n) => !n.read)
    return notifications.filter((n) => n.type === activeFilter)
  }, [notifications, activeFilter])

  const unreadCount = notifications.filter((n) => !n.read).length

  async function handleMarkRead(id) {
    await markSupportNotificationRead(id)
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
  }

  async function handleMarkAllRead() {
    await markAllSupportNotificationsRead()
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    setToast('All notifications marked as read.')
  }

  if (loading) return <LoadingSkeleton rows={5} />
  if (error) return <ErrorState title={error} onRetry={load} />

  return (
    <div className="space-y-6">
      <PageHeader
        title="Support Notifications"
        description="Stay updated on ticket assignments, client responses, specialist escalations, and clinic alerts."
        actions={
          unreadCount > 0 ? (
            <Button
              variant="outline"
              size="sm"
              onClick={handleMarkAllRead}
              className="!border-[#005a40]/30 !text-[#005a40]"
            >
              <CheckCheck className="h-4 w-4 mr-1.5" />
              Mark All as Read ({unreadCount})
            </Button>
          ) : null
        }
      />

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 border-b border-[#e8ecf1] pb-2 overflow-x-auto scrollbar-none">
        {filterTabs.map((tab) => {
          const isActive = activeFilter === tab.id
          const count =
            tab.id === 'all'
              ? notifications.length
              : tab.id === 'unread'
              ? unreadCount
              : notifications.filter((n) => n.type === tab.id).length

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveFilter(tab.id)}
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

      {/* Notification Items */}
      {filtered.length === 0 ? (
        <div className="rounded-3xl border border-[#e8ecf1] bg-white p-8">
          <EmptyState
            icon={Bell}
            title="No notifications"
            description="You are completely up to date. New queue alerts will appear here."
          />
        </div>
      ) : (
        <div className="rounded-3xl border border-[#e8ecf1] bg-white shadow-xs overflow-hidden divide-y divide-[#e8ecf1]">
          {filtered.map((item) => (
            <div
              key={item.id}
              className={[
                'p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors',
                !item.read ? 'bg-[#f0fdf4]/50' : 'hover:bg-[#f8faf9]',
              ].join(' ')}
            >
              <div className="flex items-start gap-3 min-w-0">
                <span
                  className={[
                    'mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl',
                    item.type === 'escalations'
                      ? 'bg-purple-100 text-purple-800'
                      : item.type === 'feedback'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-[#e6f5f0] text-[#005a40]',
                  ].join(' ')}
                >
                  <Bell className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-xs sm:text-sm text-[#111827]">
                      {item.title}
                    </h3>
                    {!item.read ? (
                      <span className="h-2 w-2 rounded-full bg-[#005a40]" />
                    ) : null}
                  </div>
                  <p className="text-xs text-[#4b5563] mt-0.5 leading-relaxed">
                    {item.message}
                  </p>
                  <span className="text-[11px] text-[#8b93a1] mt-1 block">
                    {new Date(item.at).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                {!item.read ? (
                  <button
                    type="button"
                    onClick={() => handleMarkRead(item.id)}
                    className="rounded-xl border border-[#e8ecf1] bg-white px-3 py-1.5 text-xs font-semibold text-[#4b5563] hover:bg-[#f4f6fb] transition-colors"
                  >
                    Mark as Read
                  </button>
                ) : null}
                {item.link ? (
                  <Link
                    to={item.link}
                    onClick={() => handleMarkRead(item.id)}
                    className="inline-flex items-center gap-1 rounded-xl bg-[#005a40] px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-[#004833] transition-colors"
                  >
                    <span>View</span>
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      )}

      <Toast open={!!toast} message={toast} onClose={() => setToast('')} />
    </div>
  )
}
