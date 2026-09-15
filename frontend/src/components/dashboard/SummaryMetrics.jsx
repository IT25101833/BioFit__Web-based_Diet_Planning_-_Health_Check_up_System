import {
  Activity,
  CalendarCheck,
  Flame,
  Target,
} from 'lucide-react'

const iconByTitle = {
  'Current Programme': Target,
  'Next Appointment': CalendarCheck,
  "Today's Focus": Flame,
  'Overall Progress': Activity,
}

const badgeStyles = {
  green: 'bg-[#e6f5f0] text-[#005a40]',
  teal: 'bg-[#ccfbf1] text-[#0f766e]',
  amber: 'bg-[#fff7ed] text-[#b45309]',
}

export default function SummaryMetrics({ cards = [] }) {
  return (
    <section aria-label="Summary">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(({ title, value, support, badge, badgeTone }) => {
          const Icon = iconByTitle[title] || Activity
          return (
            <article
              key={title}
              className="group flex min-h-[148px] flex-col rounded-[1.15rem] border border-[#e8ecf1] bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)] transition-shadow duration-300 hover:shadow-[0_12px_32px_rgba(15,23,42,0.07)]"
            >
              <div className="flex items-start justify-between gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#e6f5f0] text-[#005a40]">
                  <Icon className="h-[18px] w-[18px]" strokeWidth={2.1} />
                </span>
                <span
                  className={[
                    'rounded-full px-2.5 py-1 text-[10px] font-bold tracking-wide uppercase',
                    badgeStyles[badgeTone] || badgeStyles.green,
                  ].join(' ')}
                >
                  {badge}
                </span>
              </div>
              <p className="mt-4 text-[13px] font-medium text-[#6b7280]">{title}</p>
              <p className="mt-1 font-display text-[1.35rem] font-bold tracking-tight text-[#111827]">
                {value}
              </p>
              <p className="mt-1 text-[13px] text-[#8b93a1]">{support}</p>
            </article>
          )
        })}
      </div>
    </section>
  )
}
