import {
  Activity,
  AlertTriangle,
  Bell,
  CalendarDays,
  ChartColumn,
  Dumbbell,
  HeartPulse,
  HelpCircle,
  LayoutDashboard,
  Leaf,
  LogOut,
  Settings,
  UserRound,
  Utensils,
} from 'lucide-react'
import { Link, NavLink } from 'react-router-dom'
import Avatar from '../ui/Avatar'

const navItems = [
  { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
  { label: 'My Profile', to: '/profile', icon: UserRound },
  { label: 'My Programmes', to: '/client/programmes', icon: Activity },
  { label: 'My Appointments', to: '/client/appointments', icon: CalendarDays },
  { label: 'My Workout Plan', to: '/client/workout-plan', icon: Dumbbell },
  { label: 'Fitness Progress', to: '/client/fitness-progress', icon: ChartColumn },
  { label: 'My Meal Plan', to: '/client/meal-plan', icon: Utensils },
  { label: 'Nutrition Progress', to: '/client/nutrition-progress', icon: Leaf },
  { label: 'My Health', to: '/client/health', icon: HeartPulse },
  { label: 'Health Risk Alerts', to: '/client/health-alerts', icon: AlertTriangle },
  { label: 'My Support Tickets', to: '/client/support', icon: HelpCircle },
  { label: 'Notifications', to: '/client/notifications', icon: Bell },
]

export default function DashboardSidebar({ mobileOpen, onClose }) {
  return (
    <aside
      className={[
        'fixed inset-y-0 left-0 z-50 flex h-svh w-[260px] flex-col border-r border-[#e8ecf1] bg-white transition-transform duration-300',
        mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
      ].join(' ')}
    >
      <div className="flex h-[72px] shrink-0 items-center gap-2.5 border-b border-[#e8ecf1] px-5">
        <Link to="/" className="inline-flex items-center gap-2.5" onClick={onClose}>
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#005a40] text-white">
            <Leaf className="h-4 w-4" strokeWidth={2.4} />
          </span>
          <span className="leading-tight">
            <span className="block font-display text-lg font-bold tracking-tight text-[#111827]">
              BioFit
            </span>
            <span className="block text-[9px] font-semibold tracking-[0.14em] text-[#005a40] uppercase">
              VitalLife Wellness
            </span>
          </span>
        </Link>
      </div>

      <nav
        className="min-h-0 flex-1 space-y-1 overflow-y-auto px-3 py-5"
        aria-label="Client"
      >
        {navItems.map(({ label, to, icon: Icon }) => (
          <NavLink
            key={label}
            to={to}
            end={to === '/dashboard' || to === '/client/support'}
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
                    isActive
                      ? 'bg-white text-[#005a40]'
                      : 'bg-[#f4f6fb] text-[#6b7280]',
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
          to="/profile"
          onClick={onClose}
          className="mb-3 flex items-center gap-3 rounded-2xl bg-[#f4f6fb] px-3 py-2.5 transition-colors hover:bg-[#eef2f0]"
        >
          <Avatar name="Alex Perera" size="sm" />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold whitespace-nowrap text-[#111827]">
              Alex Perera
            </p>
            <p className="text-[11px] whitespace-nowrap text-[#6b7280]">Client</p>
          </div>
        </Link>
        <div className="flex gap-2">
          <Link
            to="/profile"
            onClick={onClose}
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full border border-[#e8ecf1] bg-white px-3 py-2 text-xs font-semibold whitespace-nowrap text-[#4b5563] transition-colors hover:bg-[#f4f6fb]"
          >
            <Settings className="h-3.5 w-3.5 shrink-0" strokeWidth={2.1} />
            Settings
          </Link>
          <Link
            to="/logout"
            onClick={onClose}
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full border border-[#e8ecf1] bg-white px-3 py-2 text-xs font-semibold whitespace-nowrap text-[#4b5563] transition-colors hover:bg-[#f4f6fb]"
          >
            <LogOut className="h-3.5 w-3.5 shrink-0" strokeWidth={2.1} />
            Sign out
          </Link>
        </div>
      </div>
    </aside>
  )
}
