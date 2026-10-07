import {
  ArrowRight,
  Bell,
  CalendarDays,
  CheckCircle2,
  Leaf,
  ShieldCheck,
} from 'lucide-react'
import { Link } from 'react-router-dom'

const iconByKey = {
  health: Leaf,
  appointment: CheckCircle2,
  reminder: Bell,
  access: ShieldCheck,
  default: Bell,
}

const toneStyles = {
  green: 'bg-[#e6f5f0] text-[#005a40]',
  teal: 'bg-[#ccfbf1] text-[#0f766e]',
  amber: 'bg-[#fff7ed] text-[#b45309]',
}

const emptyActivity = { day: '-', month: '-', title: '-', time: '-' }

export default function UpcomingAndNotifications({
  upcoming = [],
  notifications = [],
}) {
  const activities = upcoming.length > 0 ? upcoming : [emptyActivity]
  const hasNotifications = notifications.length > 0

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
                key={`${title}-${day}-${month}-${index}`}
                className={[
                  'flex gap-4 py-3.5',
                  index < activities.length - 1
                    ? 'border-b border-[#eef2f0]'
                    : '',
                ].join(' ')}
              >
                <div className="flex h-14 w-12 shrink-0 flex-col items-center justify-center rounded-xl bg-[#f4f6fb] text-[#005a40]">
                  <span className="font-display text-lg font-bold leading-none">
                    {day ?? '-'}
                  </span>
                  <span className="mt-0.5 text-[10px] font-bold tracking-[0.1em] uppercase">
                    {month ?? '-'}
                  </span>
                </div>
                <div className="min-w-0 pt-0.5">
                  <p className="text-sm font-semibold text-[#111827]">
                    {title ?? '-'}
                  </p>
                  <p className="mt-1 inline-flex items-center gap-1.5 text-[13px] text-[#6b7280]">
                    <CalendarDays className="h-3.5 w-3.5" strokeWidth={2.1} />
                    {time ?? '-'}
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
          <Link
            to="/client/notifications"
            className="hidden text-sm font-semibold text-[#005a40] hover:underline sm:inline-flex"
          >
            View all
          </Link>
        </div>

        <div className="rounded-[1.25rem] border border-[#e8ecf1] bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)] sm:p-6">
          {hasNotifications ? (
            <ul className="space-y-0">
              {notifications.map(({ icon, title, detail, time, tone }, index) => {
                const Icon = iconByKey[icon] || iconByKey.default
                const accessRequest = /access request/i.test(title || '')
                return (
                  <li
                    key={`${title}-${index}`}
                    className="flex gap-3 border-b border-[#eef2f0] py-3.5 last:border-0 last:pb-0 first:pt-0"
                  >
                    <span
                      className={[
                        'mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full',
                        toneStyles[tone] || toneStyles.green,
                      ].join(' ')}
                    >
                      <Icon className="h-4 w-4" strokeWidth={2.1} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-semibold text-[#111827]">
                          {title ?? '-'}
                        </p>
                        <span className="shrink-0 text-[11px] text-[#9ca3af]">
                          {time ?? '-'}
                        </span>
                      </div>
                      <p className="mt-0.5 text-[13px] leading-snug text-[#6b7280]">
                        {detail ?? '-'}
                      </p>
                      {accessRequest ? (
                        <Link
                          to="/client/plan-access"
                          className="mt-1 inline-flex text-[13px] font-semibold text-[#005a40] hover:underline"
                        >
                          Review request
                        </Link>
                      ) : null}
                    </div>
                  </li>
                )
              })}
            </ul>
          ) : (
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <span className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-[#f4f6fb] text-[#6b7280]">
                <Bell className="h-4 w-4" strokeWidth={2.1} />
              </span>
              <p className="text-sm font-semibold text-[#111827]">No notifications yet</p>
              <p className="mt-1 text-[13px] text-[#6b7280]">
                Updates about appointments and your wellness plan will appear here.
              </p>
            </div>
          )}

          <Link
            to="/client/notifications"
            className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-[#005a40] hover:underline"
          >
            View All Notifications
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </section>
    </div>
  )
}
