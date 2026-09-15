import { useEffect, useMemo, useState } from 'react'
import { Bell } from 'lucide-react'
import Button from '../../../components/ui/Button'
import EmptyState from '../../../components/ui/EmptyState'
import ErrorState from '../../../components/ui/ErrorState'
import FilterTabs from '../../../components/ui/FilterTabs'
import LoadingSkeleton from '../../../components/ui/LoadingSkeleton'
import PageHeader from '../../../components/ui/PageHeader'
import StatusBadge from '../../../components/ui/StatusBadge'
import {
  fetchClientNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from './data/notificationData'

const typeFilters = [
  { value: 'all', label: 'All' },
  { value: 'appointment', label: 'Appointments' },
  { value: 'programme', label: 'Programme' },
  { value: 'workout', label: 'Workout' },
  { value: 'meal', label: 'Meal plan' },
  { value: 'support', label: 'Support' },
  { value: 'health', label: 'Health' },
]

function formatDateTime(value) {
  return new Date(value).toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function ClientNotifications() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('all')

  async function load() {
    setLoading(true)
    setError('')
    try {
      setItems(await fetchClientNotifications())
    } catch {
      setError('We couldn’t load your notifications right now.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const filtered = useMemo(() => {
    if (filter === 'all') return items
    return items.filter((item) => item.type === filter)
  }, [items, filter])

  const unreadCount = items.filter((item) => !item.read).length

  async function handleMarkRead(id) {
    await markNotificationRead(id)
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, read: true } : item)),
    )
  }

  async function handleMarkAll() {
    await markAllNotificationsRead()
    setItems((prev) => prev.map((item) => ({ ...item, read: true })))
  }

  if (loading) return <LoadingSkeleton rows={4} />
  if (error) {
    return (
      <ErrorState
        title="We couldn’t load your notifications right now."
        onRetry={load}
      />
    )
  }

  return (
    <div>
      <PageHeader
        title="Notifications"
        description="Stay gently informed about appointments, plans, support, and health updates."
        actions={
          unreadCount > 0 ? (
            <Button
              variant="outline"
              onClick={handleMarkAll}
              className="!border-[#005a40]/25 !text-[#005a40]"
            >
              Mark all read
            </Button>
          ) : null
        }
      />

      <div className="mb-5">
        <FilterTabs
          ariaLabel="Notification type"
          value={filter}
          onChange={setFilter}
          options={typeFilters}
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="No notifications in this view"
          description="New updates from your wellness journey will appear here."
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((item) => (
            <article
              key={item.id}
              className={[
                'rounded-[1.25rem] border bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)] sm:p-5',
                item.read ? 'border-[#e8ecf1]' : 'border-[#005a40]/25 bg-[#f7fbf9]',
              ].join(' ')}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-display text-base font-bold text-[#111827]">
                      {item.title}
                    </h2>
                    <StatusBadge status={item.read ? 'Read' : 'Unread'} />
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-[#4b5563]">
                    {item.body}
                  </p>
                  <p className="mt-2 text-[12px] text-[#8b93a1]">
                    {formatDateTime(item.createdAt)}
                  </p>
                </div>
                {!item.read ? (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleMarkRead(item.id)}
                    className="!border-[#005a40]/25 !text-[#005a40]"
                  >
                    Mark as read
                  </Button>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
