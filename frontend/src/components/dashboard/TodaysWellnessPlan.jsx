import { ArrowRight, Dumbbell, Leaf } from 'lucide-react'
import Button from '../ui/Button'

export default function TodaysWellnessPlan() {
  return (
    <section id="todays-plan" className="scroll-mt-8">
      <div className="mb-4">
        <h2 className="font-display text-xl font-bold tracking-tight text-[#111827]">
          Today&apos;s Wellness Plan
        </h2>
        <p className="mt-1 text-sm text-[#6b7280]">
          Your workout and meals for today, in one place.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <article className="rounded-[1.25rem] border border-[#e8ecf1] bg-white p-6 shadow-[0_8px_24px_rgba(15,23,42,0.04)] transition-shadow duration-300 hover:shadow-[0_12px_32px_rgba(15,23,42,0.07)]">
          <div className="flex items-start justify-between gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#e6f5f0] text-[#005a40]">
              <Dumbbell className="h-5 w-5" strokeWidth={2.1} />
            </span>
            <span className="rounded-full bg-[#fff7ed] px-2.5 py-1 text-[10px] font-bold text-[#b45309] uppercase">
              Not Started
            </span>
          </div>

          <p className="mt-4 text-[13px] font-medium text-[#6b7280]">
            Today&apos;s Workout
          </p>
          <h3 className="mt-1 font-display text-xl font-bold tracking-tight text-[#111827]">
            Upper Body Strength
          </h3>
          <p className="mt-2 text-sm text-[#6b7280]">6 exercises · ~45 min</p>

          <Button
            href="#todays-plan"
            size="sm"
            className="mt-6 rounded-xl !bg-[#005a40] hover:!bg-[#004833]"
          >
            Start Workout
            <ArrowRight className="h-4 w-4" />
          </Button>
        </article>

        <article className="rounded-[1.25rem] border border-[#e8ecf1] bg-white p-6 shadow-[0_8px_24px_rgba(15,23,42,0.04)] transition-shadow duration-300 hover:shadow-[0_12px_32px_rgba(15,23,42,0.07)]">
          <div className="flex items-start justify-between gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#ccfbf1] text-[#0f766e]">
              <Leaf className="h-5 w-5" strokeWidth={2.1} />
            </span>
            <span className="rounded-full bg-[#e6f5f0] px-2.5 py-1 text-[10px] font-bold text-[#005a40] uppercase">
              On Track
            </span>
          </div>

          <p className="mt-4 text-[13px] font-medium text-[#6b7280]">
            Today&apos;s Meal Plan
          </p>
          <h3 className="mt-1 font-display text-xl font-bold tracking-tight text-[#111827]">
            5 Meals Planned
          </h3>
          <p className="mt-2 text-sm text-[#6b7280]">3 recorded so far today</p>

          <Button
            href="#todays-plan"
            variant="outline"
            size="sm"
            className="mt-6 rounded-xl !border-[#cfd8e3] !text-[#005a40] hover:!border-[#005a40] hover:!bg-[#e6f5f0]"
          >
            View Meal Plan
            <ArrowRight className="h-4 w-4" />
          </Button>
        </article>
      </div>
    </section>
  )
}
