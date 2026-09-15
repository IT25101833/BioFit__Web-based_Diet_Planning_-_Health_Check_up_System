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
    <section className="relative overflow-hidden rounded-[1.25rem] border border-[#e8ecf1] bg-white px-6 py-7 shadow-[0_8px_30px_rgba(15,23,42,0.04)] sm:px-8 sm:py-8">
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden
        style={{
          background:
            'radial-gradient(ellipse 60% 80% at 100% 0%, rgba(204,251,241,0.55) 0%, transparent 55%), radial-gradient(ellipse 45% 60% at 0% 100%, rgba(230,245,240,0.7) 0%, transparent 50%), linear-gradient(135deg, #ffffff 0%, #f7faf9 100%)',
        }}
      />
      <div
        className="pointer-events-none absolute top-6 right-8 hidden h-24 w-24 rounded-full border border-[#005a40]/10 sm:block"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute top-14 right-16 hidden h-10 w-10 rounded-full bg-[#e6f5f0] sm:block"
        aria-hidden
      />

      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-xl">
          <h1 className="whitespace-nowrap font-display text-[1.75rem] leading-tight font-bold tracking-tight text-[#111827] sm:text-[2rem]">
            {getGreeting()}, {name}
          </h1>
          <p className="mt-2 whitespace-nowrap text-[15px] leading-relaxed text-[#5b6577]">
            Here&apos;s a calm look at your wellness today.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button
            href="#todays-plan"
            size="md"
            className="rounded-xl !bg-[#005a40] !px-5 hover:!bg-[#004833]"
          >
            View Today&apos;s Plan
          </Button>
          <Button
            href="#appointments"
            variant="outline"
            size="md"
            className="rounded-xl !border-[#cfd8e3] !text-[#005a40] hover:!border-[#005a40] hover:!bg-[#e6f5f0]"
          >
            <CalendarPlus className="h-4 w-4" strokeWidth={2.1} />
            Book Appointment
          </Button>
        </div>
      </div>
    </section>
  )
}
