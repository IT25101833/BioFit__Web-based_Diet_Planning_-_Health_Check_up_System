import {
  ArrowRight,
  Bell,
  CalendarDays,
  CheckCircle2,
  Leaf,
} from 'lucide-react'

const activities = [
  {
    day: '08',
    month: 'Sep',
    title: 'Medical Review',
    time: '9:00 AM',
  },
  {
    day: '09',
    month: 'Sep',
    title: 'Fitness Assessment',
    time: '4:00 PM',
  },
  {
    day: '11',
    month: 'Sep',
    title: 'Nutrition Consultation',
    time: '10:30 AM',
  },
]

const notifications = [
  {
    icon: CheckCircle2,
    title: 'Appointment confirmed',
    detail: 'Your Medical Review on 08 Sep is confirmed.',
    time: '2h ago',
    tone: 'green',
  },
  {
    icon: Leaf,
    title: 'Meal plan updated',
    detail: 'Today’s meals are ready to review.',
    time: '5h ago',
    tone: 'teal',
  },
  {
    icon: Bell,
    title: 'Workout reminder',
    detail: 'Upper Body Strength is scheduled for today.',
    time: 'Yesterday',
    tone: 'amber',
  },
]

const toneStyles = {
  green: 'bg-[#e6f5f0] text-[#005a40]',
  teal: 'bg-[#ccfbf1] text-[#0f766e]',
  amber: 'bg-[#fff7ed] text-[#b45309]',
}

export default function UpcomingAndNotifications() {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <section>
        <div className="mb-4 flex items-end justify-between gap-3">
          <div>
            <h2 className="font-display text-xl font-bold tracking-tight text-[#111827]">
              Upcoming Activities
            </h2>
            <p className="mt-1 text-sm text-[#6b7280]">
              Your next few wellness moments.
            </p>
          </div>
        </div>

        <div className="rounded-[1.25rem] border border-[#e8ecf1] bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)] sm:p-6">
          <ol className="space-y-0">
            {activities.map(({ day, month, title, time }, index) => (
              <li
                key={title}
                className={[
                  'flex gap-4 py-3.5',
                  index < activities.length - 1
                    ? 'border-b border-[#eef2f0]'
                    : '',
                ].join(' ')}
              >
                <div className="flex h-14 w-12 shrink-0 flex-col items-center justify-center rounded-xl bg-[#f4f6fb] text-[#005a40]">
                  <span className="font-display text-lg font-bold leading-none">
                    {day}
                  </span>
                  <span className="mt-0.5 text-[10px] font-bold tracking-[0.1em] uppercase">
                    {month}
                  </span>
                </div>
                <div className="min-w-0 pt-0.5">
                  <p className="text-sm font-semibold text-[#111827]">{title}</p>
                  <p className="mt-1 inline-flex items-center gap-1.5 text-[13px] text-[#6b7280]">
                    <CalendarDays className="h-3.5 w-3.5" strokeWidth={2.1} />
                    {time}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section id="notifications" className="scroll-mt-8">
        <div className="mb-4 flex items-end justify-between gap-3">
          <div>
            <h2 className="font-display text-xl font-bold tracking-tight text-[#111827]">
              Notifications
            </h2>
            <p className="mt-1 text-sm text-[#6b7280]">
              Latest updates for your account.
            </p>
          </div>
          <a
            href="#notifications"
            className="hidden text-sm font-semibold text-[#005a40] hover:underline sm:inline-flex"
          >
            View all
          </a>
        </div>

        <div className="rounded-[1.25rem] border border-[#e8ecf1] bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)] sm:p-6">
          <ul className="space-y-0">
            {notifications.map(({ icon: Icon, title, detail, time, tone }) => (
              <li
                key={title}
                className="flex gap-3 border-b border-[#eef2f0] py-3.5 last:border-0 last:pb-0 first:pt-0"
              >
                <span
                  className={[
                    'mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full',
                    toneStyles[tone],
                  ].join(' ')}
                >
                  <Icon className="h-4 w-4" strokeWidth={2.1} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-semibold text-[#111827]">{title}</p>
                    <span className="shrink-0 text-[11px] text-[#9ca3af]">
                      {time}
                    </span>
                  </div>
                  <p className="mt-0.5 text-[13px] leading-snug text-[#6b7280]">
                    {detail}
                  </p>
                </div>
              </li>
            ))}
          </ul>

          <a
            href="#notifications"
            className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-[#005a40] hover:underline"
          >
            View All Notifications
            <ArrowRight className="h-3.5 w-3.5" />
          </a>
        </div>
      </section>
    </div>
  )
}
