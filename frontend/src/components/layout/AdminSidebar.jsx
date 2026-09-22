import { Link, NavLink, useNavigate } from 'react-router-dom'
import {
  Bell,
  ClipboardList,
  DatabaseBackup,
  LayoutDashboard,
  Leaf,
  LogOut,
  MonitorCog,
  Settings,
  ShieldAlert,
  ShieldCheck,
  UserRound,
  UsersRound,
} from 'lucide-react'
import { useAuth } from '../../auth/AuthContext'
import Avatar from '../ui/Avatar'

const navItems = [
  { label: 'Dashboard', to: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'User Management', to: '/admin/users', icon: UsersRound },
  { label: 'Roles & Access', to: '/admin/roles-access', icon: ShieldCheck },
  { label: 'System Monitoring', to: '/admin/system-monitoring', icon: MonitorCog },
  { label: 'Audit Logs', to: '/admin/audit-logs', icon: ClipboardList },
  { label: 'Backup Management', to: '/admin/backups', icon: DatabaseBackup },
  { label: 'Erasure Requests', to: '/admin/erasure-requests', icon: ShieldAlert },
  { label: 'Notifications', to: '/admin/notifications', icon: Bell },
]

export default function AdminSidebar({ mobileOpen, onClose }) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const name = user?.fullName || 'Jordan Lee'

  return (
    <aside
      className={[
        'fixed inset-y-0 left-0 z-50 flex h-svh w-[260px] flex-col border-r border-[var(--bf-border)] bg-[var(--bf-surface-raised)] transition-transform duration-300',
        mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
      ].join(' ')}
    >
      <div className="flex h-[72px] items-center gap-2.5 border-b border-[var(--bf-border)] px-5">
        <Link to="/admin/dashboard" className="inline-flex items-center gap-2.5" onClick={onClose}>
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#005a40] text-white">
            <Leaf className="h-4 w-4" />
          </span>
          <span>
            <span className="block font-display text-lg font-bold text-[var(--bf-ink)]">BioFit</span>
            <span className="block text-[9px] font-semibold tracking-[.14em] text-[#005a40] uppercase">
              Digital Operations
            </span>
          </span>
        </Link>
      </div>
      <nav className="min-h-0 flex-1 space-y-1 overflow-y-auto px-3 py-5" aria-label="Digital Operations">
        {navItems.map(({ label, to, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/admin/dashboard' || to === '/admin/users'}
            onClick={onClose}
            className={({ isActive }) =>
              [
                'flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all',
                isActive
                  ? 'bg-[var(--bf-primary-soft)] text-[#005a40] shadow-[inset_3px_0_0_#005a40]'
                  : 'text-[var(--bf-muted)] hover:bg-[var(--bf-surface)] hover:text-[var(--bf-ink)]',
              ].join(' ')
            }
          >
            {({ isActive }) => (
              <>
                <span
                  className={[
                    'flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
                    isActive ? 'bg-white text-[#005a40]' : 'bg-[var(--bf-surface)] text-[var(--bf-muted)]',
                  ].join(' ')}
                >
                  <Icon className="h-4 w-4" />
                </span>
                {label}
              </>
            )}
          </NavLink>
        ))}
      </nav>
      <div className="border-t border-[var(--bf-border)] p-4">
        <Link
          to="/admin/profile"
          onClick={onClose}
          className="mb-3 flex items-center gap-3 rounded-2xl bg-[var(--bf-surface)] px-3 py-2.5"
        >
          <Avatar name={name} size="sm" />
          <span className="min-w-0">
            <span className="block truncate text-sm font-semibold text-[var(--bf-ink)]">{name}</span>
            <span className="block truncate text-[11px] text-[var(--bf-muted)]">Digital Operations</span>
          </span>
        </Link>
        <div className="flex gap-2">
          <Link
            to="/admin/profile"
            className="inline-flex flex-1 items-center justify-center gap-1 rounded-full border border-[var(--bf-border)] px-2 py-2 text-xs"
          >
            <UserRound className="h-3.5 w-3.5" />
            Profile
          </Link>
          <Link
            to="/admin/settings"
            className="inline-flex flex-1 items-center justify-center gap-1 rounded-full border border-[var(--bf-border)] px-2 py-2 text-xs"
          >
            <Settings className="h-3.5 w-3.5" />
            Settings
          </Link>
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-full border border-[var(--bf-border)] px-2 text-[var(--bf-muted)]"
            aria-label="Sign out"
            onClick={() => {
              onClose?.()
              navigate('/logout')
            }}
          >
            <LogOut className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </aside>
  )
}
