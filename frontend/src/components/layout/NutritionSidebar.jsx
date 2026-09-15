import {
  Bell,
  CalendarDays,
  ChartColumn,
  LayoutDashboard,
  Leaf,
  LogOut,
  Settings,
  ShieldAlert,
  UserRound,
  Users,
  Utensils,
} from 'lucide-react'
import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '../../auth/AuthContext'
import Avatar from '../ui/Avatar'

const navItems = [
  { label: 'Dashboard', to: '/nutrition/dashboard', icon: LayoutDashboard },
  { label: 'My Clients', to: '/nutrition/clients', icon: Users },
  { label: 'Meal Plans', to: '/nutrition/meal-plans', icon: Utensils },
  { label: 'Dietary Restrictions', to: '/nutrition/dietary-restrictions', icon: ShieldAlert },
  { label: 'Nutrition Progress', to: '/nutrition/progress', icon: ChartColumn },
  { label: 'Appointments', to: '/nutrition/appointments', icon: CalendarDays },
  { label: 'Notifications', to: '/nutrition/notifications', icon: Bell },
]

export default function NutritionSidebar({ mobileOpen, onClose }) {
  const { user } = useAuth()
  const displayName = user?.fullName || 'Team member'
  return (
    <aside
      className={[
        'fixed inset-y-0 left-0 z-50 flex h-svh w-[260px] flex-col border-r border-[#e8ecf1] bg-white transition-transform duration-300',
        mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
      ].join(' ')}
    >
      <div className="flex h-[72px] shrink-0 items-center gap-2.5 border-b border-[#e8ecf1] px-5">
        <Link
          to="/nutrition/dashboard"
          className="inline-flex items-center gap-2.5"
          onClick={onClose}
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#005a40] text-white">
            <Leaf className="h-4 w-4" strokeWidth={2.4} />
          </span>
          <span className="leading-tight">
            <span className="block font-display text-lg font-bold tracking-tight text-[#111827]">
              BioFit
            </span>
            <span className="block text-[9px] font-semibold tracking-[0.14em] text-[#005a40] uppercase">
              Nutrition Portal
            </span>
          </span>
        </Link>
      </div>

      <nav
        className="min-h-0 flex-1 space-y-1 overflow-y-auto px-3 py-5"
        aria-label="Nutrition Consultant"
      >
        {navItems.map(({ label, to, icon: Icon }) => (
          <NavLink
            key={label}
            to={to}
            end={
              to === '/nutrition/dashboard' ||
              to === '/nutrition/clients' ||
              to === '/nutrition/meal-plans' ||
              to === '/nutrition/dietary-restrictions' ||
              to === '/nutrition/progress' ||
              to === '/nutrition/appointments'
            }
            onClick={onClose}
            className={({ isActive }) =>
              [
                'flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium whitespace-nowrap transition-all duration-200',
                isActive
                  ? 'bg-[#e6f5f0] text-[#005a40] shadow-[inset_3px_0_0_#005a40]'
                  : 'text-[#4b5563] hover:bg-[#f4f6fb] hover:text-[#111827]',
              ].join(' ')
            }
          >
            {({ isActive }) => (
              <>
                <span
                  className={[
                    'flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors',
                    isActive ? 'bg-white text-[#005a40]' : 'bg-[#f4f6fb] text-[#6b7280]',
                  ].join(' ')}
                >
                  <Icon className="h-4 w-4" strokeWidth={2.1} />
                </span>
                {label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto shrink-0 border-t border-[#e8ecf1] bg-white p-4">
        <Link
          to="/nutrition/profile"
          onClick={onClose}
          className="mb-3 flex items-center gap-3 rounded-2xl bg-[#f4f6fb] px-3 py-2.5 transition-colors hover:bg-[#eef2f0]"
        >
          <Avatar name={displayName} size="sm" />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-[#111827]">{displayName}</p>
            <p className="truncate text-[11px] text-[#6b7280]">Nutrition Consultant</p>
          </div>
        </Link>
        <div className="flex gap-2">
          <Link
            to="/nutrition/profile"
            onClick={onClose}
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full border border-[#e8ecf1] bg-white px-3 py-2 text-xs font-semibold text-[#4b5563] hover:bg-[#f4f6fb]"
          >
            <UserRound className="h-3.5 w-3.5" strokeWidth={2.1} />
            Profile
          </Link>
          <Link
            to="/nutrition/profile"
            onClick={onClose}
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full border border-[#e8ecf1] bg-white px-3 py-2 text-xs font-semibold text-[#4b5563] hover:bg-[#f4f6fb]"
          >
            <Settings className="h-3.5 w-3.5" strokeWidth={2.1} />
            Settings
          </Link>
          <Link
            to="/logout"
            onClick={onClose}
            className="inline-flex items-center justify-center gap-1.5 rounded-full border border-[#e8ecf1] bg-white px-3 py-2 text-xs font-semibold text-[#4b5563] hover:bg-[#f4f6fb]"
            aria-label="Sign out"
          >
            <LogOut className="h-3.5 w-3.5" strokeWidth={2.1} />
          </Link>
        </div>
      </div>
    </aside>
  )
}
