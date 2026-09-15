import {
  Check,
  HeartPulse,
  Lock,
  ShieldCheck,
} from 'lucide-react'

const trustItems = [
  {
    icon: Lock,
    title: 'Secure Account Access',
    detail: 'Protected credential update',
  },
  {
    icon: HeartPulse,
    title: 'Protected Wellness Information',
    detail: 'Your health data stays private',
  },
  {
    icon: ShieldCheck,
    title: 'Privacy-Focused Experience',
    detail: 'Calm, transparent recovery',
  },
]

export default function ResetPasswordBrandPanel() {
  return (
    <aside className="flex flex-col justify-center">
      <span className="mb-6 inline-flex w-fit items-center gap-2 rounded-full bg-[#e6f5f0] px-3.5 py-1.5 text-[10px] font-bold tracking-[0.06em] text-[#005a40] uppercase">
        <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
        HIPAA-Compliant &amp; ISO 27001 Encrypted Session
      </span>

      <h1 className="max-w-xl font-display text-3xl font-bold tracking-tight sm:text-4xl lg:text-[2.55rem] lg:leading-[1.15]">
        <span className="block whitespace-nowrap text-[#1a1c29]">
          Create a New
        </span>
        <span className="block whitespace-nowrap text-[#006837]">
          Secure Password
        </span>
      </h1>
      <p className="mt-4 max-w-[34rem] font-body text-base font-normal leading-[1.7] text-[#4a4a4a]">
        Secure your BioFit account and continue managing your personalized
        fitness, nutrition, health and wellness journey.
      </p>

      <div className="mt-8 overflow-hidden rounded-2xl border border-[#e8ecf1] bg-white shadow-[0_16px_40px_rgba(15,23,42,0.06)]">
        <div className="bg-gradient-to-b from-[#eef8f4] to-white px-5 pt-5 pb-4">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#e6f5f0] text-[#005a40]">
                <ShieldCheck className="h-4 w-4" strokeWidth={2.1} />
              </span>
              <p className="text-sm font-bold text-[#111827]">
                VitalLife Account &amp; Wellness Shield
              </p>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#d1fae5] px-2.5 py-1 text-[10px] font-bold text-[#065f46]">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Secure Reset Session
            </span>
          </div>

          <div className="grid gap-2.5 sm:grid-cols-2">
            <div className="rounded-xl bg-[#eef2ff] px-3.5 py-3">
              <span className="mb-2 inline-flex h-8 w-8 items-center justify-center rounded-lg bg-white text-[#005a40] shadow-sm">
                <Lock className="h-4 w-4" strokeWidth={2} />
              </span>
              <p className="text-sm font-bold text-[#111827]">
                Encrypted Password Update
              </p>
              <p className="mt-1 text-[11px] text-[#6b7280]">
                Private credential change
              </p>
            </div>
            <div className="rounded-xl bg-[#eef2ff] px-3.5 py-3">
              <span className="mb-2 inline-flex h-8 w-8 items-center justify-center rounded-lg bg-white text-[#005a40] shadow-sm">
                <HeartPulse className="h-4 w-4" strokeWidth={2} />
              </span>
              <p className="text-sm font-bold text-[#111827]">
                Wellness Data Protected
              </p>
              <p className="mt-1 text-[11px] text-[#6b7280]">
                Privacy-first recovery
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#e8ecf1] bg-[#f4f6fb] px-5 py-3 text-[12px]">
          <span className="font-medium text-[#4b5563]">
            Need help with your account?
          </span>
          <a
            href="/#contact"
            className="font-semibold text-[#005a40] hover:underline"
          >
            Contact Support →
          </a>
        </div>
      </div>

      <ul className="mt-6 grid gap-3 sm:grid-cols-3">
        {trustItems.map(({ icon: Icon, title, detail }) => (
          <li key={title} className="flex items-start gap-2.5">
            <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#e6f5f0] text-[#005a40]">
              <Icon className="h-4 w-4" strokeWidth={2.1} />
            </span>
            <div>
              <p className="text-[13px] font-semibold text-[#111827]">{title}</p>
              <p className="mt-0.5 text-[11px] text-[#6b7280]">{detail}</p>
            </div>
          </li>
        ))}
      </ul>
    </aside>
  )
}
