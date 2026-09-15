import { ArrowRight, CheckCircle2 } from 'lucide-react'
import Button from '../ui/Button'

export default function ProgrammeAppointment() {
  return (
    <section id="programme" className="scroll-mt-8">
      <div className="mb-4 flex items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-bold tracking-tight text-[#111827]">
            Your Programme &amp; Appointment
          </h2>
          <p className="mt-1 text-sm text-[#6b7280]">
            Stay focused on what matters next.
          </p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <article className="rounded-[1.25rem] border border-[#e8ecf1] bg-white p-6 shadow-[0_8px_24px_rgba(15,23,42,0.04)] transition-shadow duration-300 hover:shadow-[0_12px_32px_rgba(15,23,42,0.07)]">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[13px] font-medium text-[#6b7280]">
                Current Programme
              </p>
              <h3 className="mt-1 font-display text-xl font-bold tracking-tight text-[#111827]">
                Weight Management
              </h3>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#e6f5f0] px-2.5 py-1 text-[10px] font-bold text-[#005a40] uppercase">
              <span className="h-1.5 w-1.5 rounded-full bg-[#16a34a]" />
              Active
            </span>
          </div>

          <p className="mt-4 text-sm text-[#4b5563]">Week 4 of 12</p>

          <div className="mt-3">
            <div className="mb-1.5 flex items-center justify-between text-[12px]">
              <span className="font-semibold text-[#005a40]">33% Complete</span>
              <span className="text-[#8b93a1]">8 weeks remaining</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-[#eef2f0]">
              <div
                className="bf-progress-fill h-full rounded-full bg-[#005a40]"
                style={{ width: '33%' }}
              />
            </div>
          </div>

          <Button
            href="#programme"
            size="sm"
            className="mt-6 rounded-xl !bg-[#005a40] hover:!bg-[#004833]"
          >
            View Programme
            <ArrowRight className="h-4 w-4" />
          </Button>
        </article>

        <article
          id="appointments"
          className="scroll-mt-8 rounded-[1.25rem] border border-[#e8ecf1] bg-white p-6 shadow-[0_8px_24px_rgba(15,23,42,0.04)] transition-shadow duration-300 hover:shadow-[0_12px_32px_rgba(15,23,42,0.07)]"
        >
          <p className="text-[13px] font-medium text-[#6b7280]">
            Upcoming Appointment
          </p>

          <div className="mt-4 flex gap-4">
            <div className="flex h-[72px] w-[64px] shrink-0 flex-col items-center justify-center rounded-2xl bg-[#e6f5f0] text-[#005a40]">
              <span className="font-display text-2xl font-bold leading-none">08</span>
              <span className="mt-1 text-[11px] font-bold tracking-[0.12em] uppercase">
                Sep
              </span>
            </div>
            <div className="min-w-0">
              <h3 className="font-display text-lg font-bold tracking-tight text-[#111827]">
                Medical Review
              </h3>
              <p className="mt-1 text-sm text-[#4b5563]">Dr. Jordan Lee</p>
              <p className="mt-1 text-sm text-[#6b7280]">9:00 AM – 9:30 AM</p>
              <p className="mt-2 inline-flex items-center gap-1.5 text-[12px] font-semibold text-[#005a40]">
                <CheckCircle2 className="h-3.5 w-3.5" strokeWidth={2.3} />
                Confirmed
              </p>
            </div>
          </div>

          <Button
            href="#appointments"
            variant="outline"
            size="sm"
            className="mt-6 rounded-xl !border-[#cfd8e3] !text-[#005a40] hover:!border-[#005a40] hover:!bg-[#e6f5f0]"
          >
            View Appointment
            <ArrowRight className="h-4 w-4" />
          </Button>
        </article>
      </div>
    </section>
  )
}
