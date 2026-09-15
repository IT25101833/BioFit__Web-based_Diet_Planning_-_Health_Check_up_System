import {
  Check,
  Fingerprint,
  HeartPulse,
  Lock,
  ShieldCheck,
} from 'lucide-react'

const trustPills = [
  'Protected Health Telemetry',
  'End-to-End Encrypted Verification',
  'Clinical Identity Safeguard',
]

export default function ForgotPasswordBrandPanel() {
  return (
    <aside className="flex flex-col justify-center">
      <span className="mb-6 inline-flex w-fit items-center gap-2 rounded-full bg-[#e6f5f0] px-3.5 py-1.5 text-[10px] font-bold tracking-[0.06em] text-[#005a40] uppercase">
        <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
        HIPAA-Compliant &amp; ISO 27001 Protected Identity
      </span>

      <h1 className="max-w-xl font-display text-3xl font-bold tracking-tight sm:text-4xl lg:text-[2.55rem] lg:leading-[1.15]">
        <span className="block whitespace-nowrap text-[#1a1c29]">
          We&apos;ll Help You
        </span>
        <span className="block whitespace-nowrap text-[#006837]">
          Get Back In
        </span>
      </h1>
      <p className="mt-4 max-w-[34rem] font-body text-base font-normal leading-[1.7] text-[#4a4a4a]">
        <span className="lg:block lg:whitespace-nowrap">
          Reset your password securely and continue managing your clinical{' '}
        </span>
        <span className="lg:block lg:whitespace-nowrap">
          nutrition, biometric diagnostics, physician appointments, and daily{' '}
        </span>
        <span className="lg:block lg:whitespace-nowrap">
          wellness telemetry with BioFit.
        </span>
      </p>

      <div className="mt-8 overflow-hidden rounded-2xl border border-[#e8ecf1] bg-white shadow-[0_16px_40px_rgba(15,23,42,0.06)]">
        <div className="bg-gradient-to-b from-[#eef8f4] to-white px-5 pt-5 pb-4">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#e6f5f0] text-[#005a40]">
                <ShieldCheck className="h-4 w-4" strokeWidth={2.1} />
              </span>
              <p className="text-sm font-bold text-[#111827]">
                VitalLife Security &amp; Wellness Safeguard
              </p>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#d1fae5] px-2.5 py-1 text-[10px] font-bold text-[#065f46]">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Active Encrypted Session
            </span>
          </div>

          <div className="grid gap-2.5 sm:grid-cols-2">
            <div className="rounded-xl bg-[#eef2ff] px-3.5 py-3">
              <span className="mb-2 inline-flex h-8 w-8 items-center justify-center rounded-lg bg-white text-[#005a40] shadow-sm">
                <Fingerprint className="h-4 w-4" strokeWidth={2} />
              </span>
              <p className="text-sm font-bold text-[#111827]">
                256-Bit Vault Encryption
              </p>
              <p className="mt-1 text-[11px] text-[#6b7280]">
                FIPS 140-3 Standard
              </p>
            </div>
            <div className="rounded-xl bg-[#eef2ff] px-3.5 py-3">
              <span className="mb-2 inline-flex h-8 w-8 items-center justify-center rounded-lg bg-white text-[#005a40] shadow-sm">
                <Lock className="h-4 w-4" strokeWidth={2} />
              </span>
              <p className="text-sm font-bold text-[#111827]">
                Zero-Knowledge Shield
              </p>
              <p className="mt-1 text-[11px] text-[#6b7280]">
                Privacy-First Routing
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#e8ecf1] bg-[#f4f6fb] px-5 py-3 text-[12px]">
          <span className="font-medium text-[#4b5563]">
            Emergency Clinician Fallback
          </span>
          <a
            href="#contact"
            className="font-semibold text-[#005a40] hover:underline"
          >
            Contact Desk →
          </a>
        </div>
      </div>

      <div className="mt-5 flex items-start gap-2.5 text-sm text-[#4b5563]">
        <HeartPulse className="mt-0.5 h-4 w-4 shrink-0 text-[#005a40]" strokeWidth={2.1} />
        <p>Your account and personal wellness information are protected.</p>
      </div>

      <ul className="mt-5 flex flex-wrap gap-2.5">
        {trustPills.map((label) => (
          <li
            key={label}
            className="inline-flex items-center gap-2 rounded-full bg-[#eef2ff] px-3.5 py-2 text-[12px] font-semibold text-[#374151]"
          >
            <ShieldCheck className="h-3.5 w-3.5 text-[#005a40]" strokeWidth={2.4} />
            {label}
          </li>
        ))}
      </ul>
    </aside>
  )
}
