import { ArrowRight, LifeBuoy } from 'lucide-react'
import Button from '../ui/Button'

export default function SupportCard() {
  return (
    <section id="support" className="scroll-mt-8">
      <article className="relative overflow-hidden rounded-[1.25rem] border border-[var(--bf-border)] bg-[var(--bf-primary-soft)] px-6 py-7 sm:px-8">
        <div
          className="pointer-events-none absolute -top-8 -right-8 h-32 w-32 rounded-full bg-[var(--bf-primary)]/10"
          aria-hidden
        />
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-xl">
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-[var(--bf-surface-raised)] text-[var(--bf-ink)] shadow-[var(--bf-shadow-out)]">
              <LifeBuoy className="h-5 w-5" strokeWidth={2.1} />
            </div>
            <h2 className="whitespace-nowrap font-display text-xl font-bold tracking-tight text-[var(--bf-ink)]">
              Need a little help?
            </h2>
            <p className="mt-2 whitespace-nowrap text-sm leading-relaxed text-[var(--bf-muted)]">
              Our BioFit support team is here if you have questions about your
              programme, appointments or account.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              href="#support"
              size="md"
              className="rounded-xl !bg-[var(--bf-primary)] !text-[var(--color-on-primary)] hover:opacity-90"
            >
              Create Support Ticket
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button
              href="#support"
              variant="outline"
              size="md"
              className="rounded-xl !border-[var(--bf-border)] !bg-[var(--bf-surface-raised)] !text-[var(--bf-ink)] hover:!border-[var(--bf-primary)]"
            >
              My Tickets
            </Button>
          </div>
        </div>
      </article>
    </section>
  )
}
