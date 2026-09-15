import { Check } from 'lucide-react'

const steps = [
  { id: 1, label: 'Personal Details' },
  { id: 2, label: 'Contact & Account' },
  { id: 3, label: 'Review & Create' },
]

export default function Stepper({ currentStep = 1 }) {
  return (
    <ol className="mb-8 flex items-start justify-between gap-2">
      {steps.map((step, index) => {
        const isComplete = currentStep > step.id
        const isActive = currentStep === step.id
        const isLast = index === steps.length - 1

        return (
          <li key={step.id} className="relative flex flex-1 flex-col items-center text-center">
            {!isLast ? (
              <span
                className={[
                  'absolute top-4 left-[calc(50%+18px)] right-[calc(-50%+18px)] h-0.5',
                  currentStep > step.id ? 'bg-[#005a40]' : 'bg-[#e8ecf1]',
                ].join(' ')}
                aria-hidden
              />
            ) : null}

            <span
              className={[
                'relative z-10 flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold',
                isComplete || isActive
                  ? 'bg-[#005a40] text-white'
                  : 'bg-[#e8ecf1] text-[#9ca3af]',
              ].join(' ')}
            >
              {isComplete ? (
                <Check className="h-4 w-4" strokeWidth={2.5} />
              ) : (
                step.id
              )}
            </span>

            <span
              className={[
                'mt-2 text-[11px] font-semibold sm:text-xs',
                isActive
                  ? 'text-[#005a40]'
                  : isComplete
                    ? 'text-[#00a67e]'
                    : 'text-[#9ca3af]',
              ].join(' ')}
            >
              {step.id}. {step.label}
            </span>
          </li>
        )
      })}
    </ol>
  )
}
