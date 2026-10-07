import { ShieldCheck } from 'lucide-react'
import Button from '../ui/Button'

export default function PlanAccessRequestCard({ requests = [] }) {
  const pending = requests.filter((item) => item?.status === 'PENDING')
  if (pending.length === 0) return null

  return (
    <section aria-label="Plan access requests" className="space-y-4">
      {pending.map((item) => {
        const advisor = item.requestedBy || 'Your Medical Advisor'
        const resource = item.resource || 'plan'
        return (
          <article
            key={item.id}
            className="rounded-[1.25rem] border border-[#e8ecf1] bg-white p-6 shadow-[0_8px_24px_rgba(15,23,42,0.04)]"
          >
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#e6f5f0] text-[#005a40]">
                  <ShieldCheck className="h-5 w-5" strokeWidth={2.1} />
                </span>
                <div>
                  <p className="text-[13px] font-medium text-[#6b7280]">Plan access request</p>
                  <h2 className="mt-1 font-display text-xl font-bold tracking-tight text-[#111827]">
                    {advisor} wants to view your {resource}.
                  </h2>
                  {item.reason ? (
                    <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#4b5563]">{item.reason}</p>
                  ) : null}
                </div>
              </div>
              <Button
                to="/client/plan-access"
                size="sm"
                className="rounded-xl !bg-[#005a40] hover:!bg-[#004833]"
              >
                Review request
              </Button>
            </div>
          </article>
        )
      })}
    </section>
  )
}
