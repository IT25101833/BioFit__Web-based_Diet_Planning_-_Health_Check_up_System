import { Bell, Menu } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../auth/AuthContext'
import Avatar from '../ui/Avatar'

const ROLE_LABELS = {
  CLIENT: 'Client',
  WELLNESS_CENTRE_MANAGER: 'Wellness Centre Manager',
  FITNESS_COACH: 'Fitness Coach',
  NUTRITION_CONSULTANT: 'Nutrition Consultant',
  DIGITAL_OPERATIONS_EXECUTIVE: 'Digital Operations',
  CUSTOMER_EXPERIENCE_OFFICER: 'Customer Experience',
  MEDICAL_ADVISOR: 'Medical Advisor',
  ADMIN: 'Administrator',
}

export default function PortalTopbar({
  title,
  breadcrumb,
  notificationsTo,
  profileTo,
  fallbackName,
  fallbackRole,
  onOpenMenu,
  unreadCount,
}) {
  const { user, role } = useAuth()
  const name = user?.fullName || fallbackName || 'BioFit User'
  const roleLabel = ROLE_LABELS[role] || fallbackRole || 'Team member'
  const showNumericBadge = typeof unreadCount === 'number'
  const unread = showNumericBadge ? Math.max(0, unreadCount) : 0

  return (
    <header className="bf-topbar sticky top-0 z-30">
      <div className="flex h-14 items-center justify-between gap-3 px-4 sm:px-6 lg:h-16 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={onOpenMenu}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-[var(--bf-muted)] hover:bg-[var(--bf-surface)] lg:hidden"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" strokeWidth={2.1} />
          </button>
          <div className="min-w-0">
            {breadcrumb ? (
              <p className="truncate text-[11px] font-medium text-[var(--bf-muted)]">{breadcrumb}</p>
            ) : null}
            <p className="truncate font-display text-sm font-bold text-[var(--bf-ink)] lg:text-base">
              {title}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            to={notificationsTo}
            className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--bf-border)] bg-[var(--bf-surface-raised)] text-[var(--bf-muted)] shadow-[var(--bf-shadow-out)] hover:text-[var(--bf-ink)]"
            aria-label={
              showNumericBadge
                ? `Notifications${unread > 0 ? `, ${unread} unread` : ''}`
                : 'Notifications'
            }
          >
            <Bell className="h-4.5 w-4.5" strokeWidth={2.1} />
            {showNumericBadge ? (
              unread > 0 ? (
                <span className="absolute -top-1 -right-1 inline-flex min-h-[1.15rem] min-w-[1.15rem] items-center justify-center rounded-full bg-[var(--bf-primary)] px-1 text-[10px] font-bold text-white">
                  {unread > 9 ? '9+' : unread}
                </span>
              ) : null
            ) : (
              <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-[var(--bf-primary)]" />
            )}
          </Link>
          <Link
            to={profileTo}
            className="hidden items-center gap-2.5 rounded-2xl border border-[var(--bf-border)] bg-[var(--bf-surface-raised)] py-1.5 pr-3 pl-1.5 shadow-[var(--bf-shadow-out)] hover:bg-[var(--bf-surface)] sm:inline-flex"
          >
            <Avatar name={name} size="sm" />
            <span className="min-w-0">
              <span className="block truncate text-sm font-semibold text-[var(--bf-ink)]">{name}</span>
              <span className="block truncate text-[11px] text-[var(--bf-muted)]">{roleLabel}</span>
            </span>
          </Link>
        </div>
      </div>
    </header>
  )
}
