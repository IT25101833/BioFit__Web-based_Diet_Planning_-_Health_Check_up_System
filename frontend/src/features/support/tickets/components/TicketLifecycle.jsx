import { Check, Clock, AlertCircle } from 'lucide-react'

const lifecycleSteps = [
  'Created',
  'Assigned',
  'In Progress',
  'Pending Client Reply',
  'Resolved',
  'Closed',
]

export default function TicketLifecycle({ status }) {
  const isEscalated = status === 'Escalated'

  function getStepStatus(step) {
    if (isEscalated) {
      if (step === 'Created' || step === 'Assigned') return 'completed'
      if (step === 'In Progress') return 'active-escalated'
      return 'upcoming'
    }

    const currentIndex = lifecycleSteps.indexOf(status)
    const stepIndex = lifecycleSteps.indexOf(step)

    if (stepIndex < currentIndex) return 'completed'
    if (stepIndex === currentIndex) return 'current'
    return 'upcoming'
  }

  return (
    <div className="rounded-2xl border border-[#e8ecf1] bg-white p-4 sm:p-5 shadow-xs mb-6">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-[#8b93a1]">
          Ticket Lifecycle
        </span>
        {isEscalated ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-800 border border-amber-200">
            <AlertCircle className="h-3 w-3" />
            Specialist Review Active
          </span>
        ) : null}
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-6 sm:gap-1">
        {lifecycleSteps.map((step, idx) => {
          const state = getStepStatus(step)

          return (
            <div key={step} className="flex flex-col items-center text-center p-2 rounded-xl relative">
              <div
                className={[
                  'flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-colors mb-1.5',
                  state === 'completed'
                    ? 'bg-[#005a40] text-white'
                    : state === 'current'
                    ? 'bg-[#005a40] text-white ring-4 ring-[#e6f5f0]'
                    : state === 'active-escalated'
                    ? 'bg-amber-600 text-white ring-4 ring-amber-100'
                    : 'bg-[#f4f6fb] text-[#9ca3af]',
                ].join(' ')}
              >
                {state === 'completed' ? (
                  <Check className="h-3.5 w-3.5 stroke-[2.5]" />
                ) : (
                  <span>{idx + 1}</span>
                )}
              </div>
              <span
                className={[
                  'text-[11px] font-medium leading-tight',
                  state === 'current'
                    ? 'font-bold text-[#005a40]'
                    : state === 'completed'
                    ? 'text-[#111827]'
                    : state === 'active-escalated'
                    ? 'font-bold text-amber-700'
                    : 'text-[#9ca3af]',
                ].join(' ')}
              >
                {step}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
