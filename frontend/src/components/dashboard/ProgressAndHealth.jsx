import { ArrowRight, ShieldCheck } from 'lucide-react'
import Button from '../ui/Button'

export default function ProgressAndHealth({ progressItems = [], healthItems = [] }) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <section>
        <div className="mb-4">
          <h2 className="font-display text-xl font-bold tracking-tight text-[#111827]">
            Your Progress
          </h2>
          <p className="mt-1 text-sm text-[#6b7280]">
            A simple view of how you&apos;re doing this month.
          </p>
        </div>

        <div className="space-y-4 rounded-[1.25rem] border border-[#e8ecf1] bg-white p-6 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
          {progressItems.map(({ label, value, detail }) => (
            <div key={label}>
              <div className="mb-2 flex items-end justify-between gap-3">
                <div>
                  <p className="text-[13px] font-medium text-[#6b7280]">{label}</p>
                  <p className="mt-0.5 text-[13px] text-[#8b93a1]">{detail}</p>
                </div>
                <p className="font-display text-[1.65rem] font-bold tracking-tight text-[#111827]">
                  {value}%
                </p>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-[#eef2f0]">
                <div
                  className="bf-progress-fill h-full rounded-full bg-[#005a40]"
                  style={{ width: `${value}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="health" className="scroll-mt-8">
        <div className="mb-4">
          <h2 className="font-display text-xl font-bold tracking-tight text-[#111827]">
            Health Summary
          </h2>
          <p className="mt-1 text-sm text-[#6b7280]">
            A calm snapshot of your latest health status.
          </p>
        </div>

        <article className="rounded-[1.25rem] border border-[#e8ecf1] bg-white p-6 shadow-[0_8px_24px_rgba(15,23,42,0.04)] transition-shadow duration-300 hover:shadow-[0_12px_32px_rgba(15,23,42,0.07)]">
          <div className="mb-5 flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#e6f5f0] text-[#005a40]">
              <ShieldCheck className="h-5 w-5" strokeWidth={2.1} />
            </span>
            <div>
              <p className="text-sm font-semibold text-[#111827]">Your health looks steady</p>
              <p className="text-[12px] text-[#6b7280]">No urgent attention needed right now</p>
            </div>
          </div>

          <dl className="grid gap-3 sm:grid-cols-2">
            {healthItems.map(({ label, value }) => (
              <div key={label} className="rounded-2xl bg-[#f8faf9] px-4 py-3">
                <dt className="text-[12px] font-medium text-[#8b93a1]">{label}</dt>
                <dd className="mt-1 text-sm font-semibold text-[#111827]">{value}</dd>
              </div>
            ))}
          </dl>

          <Button
            to="/client/health"
            variant="outline"
            className="mt-5 !border-[#005a40]/25 !text-[#005a40]"
          >
            View health details
            <ArrowRight className="h-4 w-4" />
          </Button>
        </article>
      </section>
    </div>
  )
}
