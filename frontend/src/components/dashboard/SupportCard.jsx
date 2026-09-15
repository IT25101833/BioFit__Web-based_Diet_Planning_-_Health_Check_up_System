import { ArrowRight, LifeBuoy } from 'lucide-react'
import Button from '../ui/Button'

export default function SupportCard() {
  return (
    <section id="support" className="scroll-mt-8">
      <article className="relative overflow-hidden rounded-[1.25rem] border border-[#d7eee6] bg-gradient-to-br from-[#eefaf6] via-[#f4fcf9] to-[#e8f7f3] px-6 py-7 sm:px-8">
        <div
          className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-[#005a40]/5"
          aria-hidden
        />
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-xl">
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-white text-[#005a40] shadow-sm">
              <LifeBuoy className="h-5 w-5" strokeWidth={2.1} />
            </div>
            <h2 className="whitespace-nowrap font-display text-xl font-bold tracking-tight text-[#111827]">
              Need a little help?
            </h2>
            <p className="mt-2 whitespace-nowrap text-sm leading-relaxed text-[#4b5563]">
              Our BioFit support team is here if you have questions about your
              programme, appointments or account.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              href="#support"
              size="md"
              className="rounded-xl !bg-[#005a40] hover:!bg-[#004833]"
            >
              Create Support Ticket
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button
              href="#support"
              variant="outline"
              size="md"
              className="rounded-xl !border-[#b7d9cb] !bg-white/70 !text-[#005a40] hover:!border-[#005a40] hover:!bg-white"
            >
              My Tickets
            </Button>
          </div>
        </div>
      </article>
    </section>
  )
}
