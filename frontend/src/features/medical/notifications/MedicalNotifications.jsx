import { useEffect, useMemo, useState } from 'react'
import { Bell } from 'lucide-react'
import { Link } from 'react-router-dom'
import Button from '../../../components/ui/Button'
import EmptyState from '../../../components/ui/EmptyState'
import ErrorState from '../../../components/ui/ErrorState'
import FilterTabs from '../../../components/ui/FilterTabs'
import LoadingSkeleton from '../../../components/ui/LoadingSkeleton'
import PageHeader from '../../../components/ui/PageHeader'
import StatusBadge from '../../../components/ui/StatusBadge'
import {
  fetchMedicalNotifications,
  markAllMedicalNotificationsRead,
  markMedicalNotificationRead,
} from './data/medicalNotificationData'

const filters = [
  { value: 'all', label: 'All' },
  { value: 'unread', label: 'Unread' },
  { value: 'assessments', label: 'Assessments' },
  { value: 'alerts', label: 'Health Alerts' },
  { value: 'appointments', label: 'Appointments' },
  { value: 'follow-ups', label: 'Follow-ups' },
  { value: 'records', label: 'Records' },
]

function formatWhen(value) {
  return new Date(value).toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function MedicalNotifications() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('all')

  async function load() {
    setLoading(true)
    setError('')
    try {
      setItems(await fetchMedicalNotifications())
    } catch {
      setError('We couldn’t load notifications.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const filtered = useMemo(() => {
    if (filter === 'all') return items
    if (filter === 'unread') return items.filter((item) => !item.read)
    return items.filter((item) => item.type === filter)
  }, [items, filter])

  const unreadCount = items.filter((item) => !item.read).length

  if (loading) return <LoadingSkeleton rows={4} />
  if (error) return <ErrorState title="We couldn’t load notifications." onRetry={load} />

  return (
    <div>
      <PageHeader
        title="Notifications"
        description="Stay updated on assessments, health alerts, follow-ups and medical appointments."
        actions={
          unreadCount > 0 ? (
            <Button
              variant="outline"
              className="!border-[#005a40]/25 !text-[#005a40]"
              onClick={async () => {
                await markAllMedicalNotificationsRead()
                setItems((prev) => prev.map((item) => ({ ...item, read: true })))
              }}
            >
              Mark All as Read
            </Button>
          ) : null
        }
      />

      <div className="mb-5 overflow-x-auto">
        <FilterTabs
          ariaLabel="Notification filters"
          value={filter}
          onChange={setFilter}
          options={filters}
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="No notifications in this view"
          description="New medical updates will appear here."
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((item) => (
            <article
              key={item.id}
              className={[
                'rounded-[1.25rem] border bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)]',
                item.read ? 'border-[#e8ecf1]' : 'border-[#005a40]/25 bg-[#f7fbf9]',
              ].join(' ')}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-display text-base font-bold text-[#111827]">
                      {item.title}
                    </h2>
                    <StatusBadge status={item.read ? 'Read' : 'Unread'} />
                  </div>
                  <p className="mt-2 text-sm text-[#4b5563]">{item.message || item.body}</p>
                  <p className="mt-2 text-[12px] text-[#8b93a1]">
                    {formatWhen(item.createdAt)}
                  </p>
                  {item.link ? (
                    <Link
                      to={item.link}
                      className="mt-2 inline-block text-sm font-semibold text-[#005a40] hover:underline"
                    >
                      Open related item
                    </Link>
                  ) : null}
                </div>
                {!item.read ? (
                  <Button
                    size="sm"
                    variant="outline"
                    className="!border-[#005a40]/25 !text-[#005a40]"
                    onClick={async () => {
                      await markMedicalNotificationRead(item.id)
                      setItems((prev) =>
                        prev.map((n) => (n.id === item.id ? { ...n, read: true } : n)),
                      )
                    }}
                  >
                    Mark as Read
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
