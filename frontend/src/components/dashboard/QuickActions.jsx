import {
  CalendarPlus,
  Dumbbell,
  HeartPulse,
  MessageCircle,
  Utensils,
} from 'lucide-react'
import { Link } from 'react-router-dom'

const actions = [
  { label: 'Book Appointment', icon: CalendarPlus, to: '/client/appointments/book' },
  { label: 'Workout Plan', icon: Dumbbell, to: '/client/workout-plan' },
  { label: 'Meal Plan', icon: Utensils, to: '/client/meal-plan' },
  { label: 'My Health', icon: HeartPulse, to: '/client/health' },
  { label: 'Get Support', icon: MessageCircle, to: '/client/support' },
]

export default function QuickActions() {
  return (
    <section aria-label="Quick actions">
      <div className="flex flex-wrap gap-2.5 sm:gap-3">
        {actions.map(({ label, icon: Icon, to }) => (
          <Link
            key={label}
            to={to}
            className="inline-flex items-center gap-2 rounded-full border border-[#e8ecf1] bg-white px-3.5 py-2.5 text-[13px] font-semibold text-[#374151] shadow-[0_4px_14px_rgba(15,23,42,0.03)] transition-all duration-200 hover:-translate-y-0.5 hover:border-[#005a40]/30 hover:bg-[#e6f5f0] hover:text-[#005a40]"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#e6f5f0] text-[#005a40]">
              <Icon className="h-3.5 w-3.5" strokeWidth={2.2} />
            </span>
            {label}
          </Link>
        ))}
      </div>
    </section>
  )
}
