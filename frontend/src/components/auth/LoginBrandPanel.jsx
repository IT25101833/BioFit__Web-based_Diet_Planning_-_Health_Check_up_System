import {
  Activity,
  Apple,
  Check,
  Droplets,
  Heart,
  Laptop,
  Lock,
  ShieldCheck,
  Stethoscope,
} from 'lucide-react'

const metrics = [
  {
    icon: Apple,
    iconClass: 'text-[#005a40] bg-[#e6f5f0]',
    label: 'Nutrition Balance',
    value: '94%',
    detail: 'Target Adherence',
  },
  {
    icon: Heart,
    iconClass: 'text-rose-500 bg-rose-50',
    label: 'Resting HR',
    value: '68 bpm',
    detail: 'Optimal Baseline',
  },
  {
    icon: Droplets,
    iconClass: 'text-sky-600 bg-sky-50',
    label: 'Hydration',
    value: '2.8 / 3.0L',
    detail: '93% Completed',
  },
  {
    icon: Stethoscope,
    iconClass: 'text-[#0d9488] bg-[#e0f7f4]',
    label: 'Next Review',
    value: 'Dr. Vance',
    detail: 'Cardiology Consult',
  },
]

const trustPills = [
  { icon: Check, label: 'Personalized Plans' },
  { icon: Lock, label: 'Encrypted Records' },
  { icon: Stethoscope, label: 'Doctor-Supervised' },
]

export default function LoginBrandPanel() {
  return (
    <aside className="flex flex-col justify-center">
      <div className="mb-7 flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-[12px] bg-[#005a40] text-white shadow-ambient">
          <Activity className="h-5 w-5" strokeWidth={2.2} />
        </span>
        <div className="leading-tight">
          <p className="font-display text-[1.35rem] font-bold tracking-tight text-[#111827]">
            BioFit{' '}
            <span className="text-[13px] font-bold tracking-[0.06em] text-[#00a67e] uppercase">
              Health OS
            </span>
          </p>
          <p className="mt-0.5 text-[10px] font-semibold tracking-[0.14em] text-[#9ca3af] uppercase">
            By VitalLife Wellness
          </p>
        </div>
      </div>

      <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl lg:text-[2.55rem] lg:leading-[1.2]">
        <span className="block whitespace-nowrap text-[#1a1c29]">
          Welcome Back to Your
        </span>
        <span className="block whitespace-nowrap text-[#006837]">
          Wellness Journey
        </span>
      </h1>
      <p className="mt-4 max-w-[34rem] font-body text-base font-normal leading-[1.7] text-[#4a4a4a]">
        Access your personalized fitness plans, nutrition guidance, health
        records, appointments, and telemetry progress — consolidated into a
        single unified clinical record.
      </p>

      <div className="mt-8 overflow-hidden rounded-2xl border border-[#e8ecf1] bg-white shadow-[0_16px_40px_rgba(15,23,42,0.06)]">
        <div className="bg-gradient-to-b from-[#eef8f4] to-white px-5 pt-5 pb-4">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#eef2ff] text-[#4f46e5]">
                <Laptop className="h-4 w-4" strokeWidth={2} />
              </span>
              <p className="text-sm font-bold text-[#111827]">
                VitalLife Unified Patient &amp; Provider Sync
              </p>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#d1fae5] px-2.5 py-1 text-[10px] font-bold text-[#065f46]">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
              </span>
              Live Sync
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            {metrics.map((metric) => {
              const Icon = metric.icon
              return (
                <div
                  key={metric.label}
                  className="rounded-xl border border-[#eef0f4] bg-white px-3 py-3"
                >
                  <span
                    className={`mb-2 inline-flex h-7 w-7 items-center justify-center rounded-lg ${metric.iconClass}`}
                  >
                    <Icon className="h-3.5 w-3.5" strokeWidth={2.1} />
                  </span>
                  <p className="text-[10px] font-medium text-[#6b7280]">
                    {metric.label}
                  </p>
                  <p className="mt-0.5 font-display text-[13px] font-bold text-[#111827]">
                    {metric.value}
                  </p>
                  <p className="mt-0.5 text-[10px] text-[#9ca3af]">
                    {metric.detail}
                  </p>
                </div>
              )
            })}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#e8ecf1] bg-[#f4f6fb] px-5 py-3">
          <div className="flex items-center gap-2 text-[12px] font-medium text-[#4b5563]">
            <ShieldCheck className="h-4 w-4 shrink-0 text-[#005a40]" strokeWidth={2.2} />
            Clinical Telemetry active
          </div>
          <svg
            width="80"
            height="18"
            viewBox="0 0 80 18"
            fill="none"
            aria-hidden
            className="text-[#00a67e]"
          >
            <path
              d="M1 9 H16 L20 3 L26 15 L32 6 L38 12 L44 9 H79"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>

      <ul className="mt-5 flex flex-wrap gap-2.5">
        {trustPills.map((item) => {
          const Icon = item.icon
          return (
            <li
              key={item.label}
              className="inline-flex items-center gap-2 rounded-full bg-[#eef2ff] px-3.5 py-2 text-[12px] font-semibold text-[#374151]"
            >
              <Icon className="h-3.5 w-3.5 text-[#005a40]" strokeWidth={2.4} />
              {item.label}
            </li>
          )
        })}
      </ul>
    </aside>
  )
}
