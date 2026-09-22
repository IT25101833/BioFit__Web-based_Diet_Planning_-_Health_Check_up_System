import { useEffect, useMemo, useState } from 'react'
import {
  Bell,
  CalendarDays,
  Clock3,
  XCircle,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import Button from '../../../components/ui/Button'
import EmptyState from '../../../components/ui/EmptyState'
import ErrorState from '../../../components/ui/ErrorState'
import FilterTabs from '../../../components/ui/FilterTabs'
import LoadingSkeleton from '../../../components/ui/LoadingSkeleton'
import PageHeader from '../../../components/ui/PageHeader'
import StatusBadge from '../../../components/ui/StatusBadge'
import { safeMedicalNotificationLink } from '../shared/medicalNav'
import {
  fetchMedicalNotifications,
  markAllMedicalNotificationsRead,
  markMedicalNotificationRead,
} from './data/medicalNotificationData'

const filters = [
  { value: 'all', label: 'All' },
  { value: 'unread', label: 'Unread' },
  { value: 'appointments', label: 'Appointments' },
  { value: 'assessments', label: 'Assessments' },
  { value: 'alerts', label: 'Health Alerts' },
  { value: 'follow-ups', label: 'Follow-ups' },
  { value: 'records', label: 'Records' },
]

function formatWhen(value) {
  if (!value) return ''
  return new Date(value).toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function notificationIcon(type) {
  const key = String(type || '').toUpperCase()
  if (key === 'APPOINTMENT_BOOKED') {
    return { Icon: CalendarDays, className: 'bg-[#e6f5f0] text-[#005a40]' }
  }
  if (key === 'APPOINTMENT_RESCHEDULED') {
    return { Icon: Clock3, className: 'bg-[#eff6ff] text-[#1d4ed8]' }
  }
  if (key === 'APPOINTMENT_CANCELLED') {
    return { Icon: XCircle, className: 'bg-[#fef2f2] text-[#dc2626]' }
  }
  if (key === 'TODAY_APPOINTMENTS') {
    return { Icon: Bell, className: 'bg-[#fff7ed] text-[#b45309]' }
  }
  if (key.includes('ALERT')) {
    return { Icon: Bell, className: 'bg-[#fff7ed] text-[#b45309]' }
  }
  return { Icon: Bell, className: 'bg-[#f3f4f6] text-[#4b5563]' }
}

function matchesFilter(item, filter) {
  if (filter === 'all') return true
  if (filter === 'unread') return !item.read
  const type = String(item.type || '').toLowerCase()
  if (filter === 'appointments') {
    return (
      type.includes('appointment') ||
      type === 'today_appointments' ||
      type === 'appointments'
    )
  }
  return type === filter || type.includes(filter.replace(/-/g, ''))
}

export default function MedicalNotifications() {
  const navigate = useNavigate()
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

  const filtered = useMemo(
    () => items.filter((item) => matchesFilter(item, filter)),
    [items, filter],
  )

  const unreadCount = items.filter((item) => !item.read).length

  async function handleOpen(item) {
    if (!item.read) {
      try {
        await markMedicalNotificationRead(item.id)
        setItems((prev) =>
          prev.map((n) => (n.id === item.id ? { ...n, read: true } : n)),
        )
      } catch {
        // Still try to navigate if mark-read fails.
      }
    }
    const safeLink = safeMedicalNotificationLink(item.link)
    if (safeLink) navigate(safeLink)
  }

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
          {filtered.map((item) => {
            const safeLink = safeMedicalNotificationLink(item.link)
            const { Icon, className } = notificationIcon(item.type)
            return (
              <article
                key={item.id}
                role={safeLink ? 'button' : undefined}
                tabIndex={safeLink ? 0 : undefined}
                onClick={() => handleOpen(item)}
                onKeyDown={(e) => {
                  if (safeLink && (e.key === 'Enter' || e.key === ' ')) {
                    e.preventDefault()
                    handleOpen(item)
                  }
                }}
                className={[
                  'rounded-[1.25rem] border bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)]',
                  item.read ? 'border-[#e8ecf1]' : 'border-[#005a40]/25 bg-[#f7fbf9]',
                  safeLink ? 'cursor-pointer transition-colors hover:border-[#005a40]/40' : '',
                ].join(' ')}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex min-w-0 flex-1 gap-3">
                    <span
                      className={[
                        'mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
                        className,
                      ].join(' ')}
                    >
                      <Icon className="h-5 w-5" strokeWidth={2.1} />
                    </span>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="font-display text-base font-bold text-[#111827]">
                          {item.title}
                        </h2>
                        <StatusBadge status={item.read ? 'Read' : 'Unread'} />
                      </div>
                      <p className="mt-2 whitespace-pre-line text-sm text-[#4b5563]">
                        {item.message || item.body}
                      </p>
                      <p className="mt-2 text-[12px] text-[#8b93a1]">
                        {formatWhen(item.createdAt || item.at)}
                      </p>
                      {safeLink ? (
                        <p className="mt-2 text-sm font-semibold text-[#005a40]">
                          Open related item
                        </p>
                      ) : null}
                    </div>
                  </div>
                  {!item.read ? (
                    <Button
                      size="sm"
                      variant="outline"
                      className="!border-[#005a40]/25 !text-[#005a40]"
                      onClick={async (e) => {
                        e.stopPropagation()
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
            )
          })}
        </div>
      )}
    </div>
  )
}
