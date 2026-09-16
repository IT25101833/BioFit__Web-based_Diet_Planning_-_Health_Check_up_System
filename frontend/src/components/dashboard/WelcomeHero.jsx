import { CalendarPlus } from 'lucide-react'
import Button from '../ui/Button'

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good Morning'
  if (hour < 17) return 'Good Afternoon'
  return 'Good Evening'
}

export default function WelcomeHero({ name = 'Alex' }) {
  return (
    <section className="relative overflow-hidden rounded-[1.25rem] border border-[var(--bf-border)] bg-[var(--bf-surface-raised)] px-6 py-7 shadow-[var(--bf-shadow-out)] sm:px-8 sm:py-8">
      <div
        className="pointer-events-none absolute inset-0 bf-hero-bg opacity-80"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute top-6 right-8 hidden h-24 w-24 rounded-full border border-[var(--bf-border)] sm:block"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute top-14 right-16 hidden h-10 w-10 rounded-full bg-[var(--bf-primary-soft)] sm:block"
        aria-hidden
      />

      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-xl">
          <h1 className="whitespace-nowrap font-display text-[1.75rem] leading-tight font-bold tracking-tight text-[var(--bf-ink)] sm:text-[2rem]">
            {getGreeting()}, {name}
          </h1>
          <p className="mt-2 whitespace-nowrap text-[15px] leading-relaxed text-[var(--bf-muted)]">
            Here&apos;s a calm look at your wellness today.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button
            href="#todays-plan"
            size="md"
            className="rounded-xl !bg-[var(--bf-primary)] !px-5 !text-[var(--color-on-primary)] hover:opacity-90"
          >
            View Today&apos;s Plan
          </Button>
          <Button
            href="#appointments"
            variant="outline"
            size="md"
            className="rounded-xl !border-[var(--bf-border)] !text-[var(--bf-ink)] hover:!border-[var(--bf-primary)] hover:!bg-[var(--bf-primary-soft)]"
          >
            <CalendarPlus className="h-4 w-4" strokeWidth={2.1} />
            Book Appointment
          </Button>
        </div>
      </div>
    </section>
  )
}
