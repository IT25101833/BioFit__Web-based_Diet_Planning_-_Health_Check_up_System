import {
  BadgeCheck,
  Droplets,
  Dumbbell,
  Heart,
  Play,
} from 'lucide-react'

const macros = [
  { label: 'Protein', value: '145g', pct: 82 },
  { label: 'Carbs', value: '210g', pct: 70 },
  { label: 'Healthy Fats', value: '55g', pct: 58 },
]

const metrics = [
  {
    label: 'Resting HR',
    value: '68 bpm',
    status: 'Normal Range',
    icon: Heart,
    iconClass: 'text-rose-500',
  },
  {
    label: 'Fasting Glucose',
    value: '92 mg/dL',
    status: 'Optimal Tier',
    icon: Droplets,
    iconClass: 'text-teal-600',
  },
  {
    label: 'Hydration',
    value: '2.8 / 3.0L',
    status: '93% Achieved',
    icon: Droplets,
    iconClass: 'text-sky-600',
  },
]

export default function BioIntelligenceDashboard() {
  return (
    <aside
      className="bf-animate-float relative z-10 w-full max-w-[460px] rounded-[1.5rem] border border-outline-variant/80 bg-surface p-5 shadow-dashboard sm:p-6"
      aria-label="Live Bio-Intelligence Dashboard preview"
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          <h2 className="font-display text-[10px] font-bold tracking-[0.14em] text-on-surface uppercase sm:text-[11px]">
            Live Bio-Intelligence Dashboard
          </h2>
        </div>
        <span className="shrink-0 rounded-full bg-lavender px-2.5 py-1 text-[10px] font-semibold text-on-lavender sm:text-[11px]">
          Sync: Just Now
        </span>
      </div>

      {/* Nutrition profile */}
      <div className="rounded-2xl bg-lavender/70 p-4">
        <div className="mb-1 flex items-start justify-between gap-2">
          <div>
            <p className="text-sm font-bold text-on-surface">
              Target Nutrition Profile
            </p>
            <p className="mt-0.5 text-[11px] leading-snug text-on-surface-variant">
              Optimal caloric intake calibrated for metabolic recovery
            </p>
          </div>
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-primary px-2.5 py-1 text-[10px] font-bold text-on-primary">
            <BadgeCheck className="h-3 w-3" strokeWidth={2.5} />
            94% Balanced
          </span>
        </div>

        <div className="mt-3 grid grid-cols-3 gap-2">
          {macros.map((macro) => (
            <div
              key={macro.label}
              className="rounded-xl bg-surface px-2.5 py-2.5 shadow-sm"
            >
              <p className="text-[10px] font-medium text-on-surface-variant">
                {macro.label}
              </p>
              <p className="mt-0.5 font-display text-sm font-bold text-on-surface">
                {macro.value}
              </p>
              <div className="mt-2 h-1 overflow-hidden rounded-full bg-outline-variant">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${macro.pct}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Metrics */}
      <div className="mt-3 grid grid-cols-3 gap-2">
        {metrics.map((metric) => {
          const Icon = metric.icon
          return (
            <div
              key={metric.label}
              className="rounded-xl border border-outline-variant bg-surface px-2.5 py-3"
            >
              <div className="mb-2 flex items-center gap-1.5">
                <Icon className={`h-3.5 w-3.5 ${metric.iconClass}`} strokeWidth={2.2} />
                <p className="text-[10px] font-medium text-on-surface-variant">
                  {metric.label}
                </p>
              </div>
              <p className="font-display text-[13px] font-bold tracking-tight text-on-surface">
                {metric.value}
              </p>
              <p className="mt-1 text-[10px] font-semibold text-primary">
                {metric.status}
              </p>
            </div>
          )
        })}
      </div>

      {/* Today's regimen */}
      <div className="mt-3 flex items-center gap-3 rounded-2xl bg-lavender px-3.5 py-3.5">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-on-primary">
          <Dumbbell className="h-4 w-4" strokeWidth={2} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold tracking-[0.12em] text-secondary uppercase">
            Today&apos;s Regimen
          </p>
          <p className="truncate text-sm font-bold text-on-surface">
            Low-Impact Cardio &amp; Core
          </p>
          <p className="mt-0.5 text-[11px] text-on-surface-variant">
            45 min · Tailored for Joint Protection
          </p>
        </div>
        <button
          type="button"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-outline-variant bg-surface text-on-surface-variant transition-colors hover:border-primary hover:text-primary"
          aria-label="Start today's regimen"
        >
          <Play className="h-3.5 w-3.5 fill-current" />
        </button>
      </div>

      {/* Verification */}
      <div className="mt-3 flex items-center gap-3 rounded-2xl bg-lavender/50 px-3.5 py-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#c7d2fe] text-[11px] font-bold text-[#3730a3]">
          AT
        </span>
        <div className="min-w-0">
          <p className="flex flex-wrap items-center gap-1 text-[12px] text-on-surface">
            <span>Verified by</span>
            <span className="font-bold">Dr. Aris Thorne, MD</span>
            <BadgeCheck className="h-3.5 w-3.5 text-primary" strokeWidth={2.4} />
          </p>
          <p className="mt-0.5 text-[11px] text-on-surface-variant">
            VitalLife Clinical Advisory · Reviewed 4 hrs ago
          </p>
        </div>
      </div>
    </aside>
  )
}
