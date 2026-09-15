import { ArrowRight, CalendarDays, Leaf, Star } from 'lucide-react'
import Button from '../ui/Button'
import Container from '../ui/Container'
import BioIntelligenceDashboard from './BioIntelligenceDashboard'

export default function Hero() {
  return (
    <section id="home" className="bf-hero-bg relative overflow-hidden">
      <Container className="grid items-center gap-10 py-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12 lg:py-16 xl:gap-14">
        <div className="bf-animate-fade-up max-w-[540px]">
          <div className="mb-6 inline-flex max-w-full items-center gap-2 rounded-full bg-lavender px-3.5 py-2 text-[10px] font-semibold tracking-[0.07em] text-on-lavender uppercase sm:text-[11px]">
            <Leaf className="h-3.5 w-3.5 shrink-0 text-primary" strokeWidth={2.5} />
            <span className="truncate">
              Integrated VitalLife Platform
              <span className="mx-1.5 text-on-lavender/50">·</span>
              ISO &amp; HIPAA Compliant
            </span>
          </div>

          <h1 className="font-h1 text-h1-mobile leading-[1.08] text-on-surface sm:text-h1">
            Your Health.{' '}
            <span className="text-primary">Your Plan. Your Progress.</span>
          </h1>

          <p className="mt-5 max-w-[480px] text-[15px] leading-[1.7] text-on-surface-variant sm:text-base">
            BioFit brings personalized fitness programmes, clinical nutrition
            planning, real-time bio-metric telemetry, and wellness appointments
            together in one unified, evidence-based system. Guided by accredited
            medical advisors and board-certified clinicians.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Button to="/login" size="lg" className="rounded-full px-7">
              Start Your Wellness Journey
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button
              href="#services"
              variant="secondary"
              size="lg"
              className="rounded-full px-6"
            >
              <CalendarDays className="h-4 w-4" />
              Explore Services
            </Button>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-3 border-t border-outline-variant pt-6 text-sm text-on-surface-variant">
            <div className="flex items-center gap-2">
              <div className="flex text-primary">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className="h-3.5 w-3.5 fill-current"
                    strokeWidth={0}
                  />
                ))}
              </div>
              <span>
                <span className="font-bold text-on-surface">4.9/5</span>{' '}
                Clinical Satisfaction
              </span>
            </div>
            <span className="hidden h-4 w-px bg-outline-variant sm:block" aria-hidden />
            <p>
              <span className="font-bold text-on-surface">38,000+</span> active
              members
              <span className="mx-1.5 text-outline">·</span>
              <span className="font-bold text-on-surface">250+</span> licensed
              clinicians
            </p>
          </div>
        </div>

        <div
          className="bf-animate-fade-in relative flex justify-center lg:justify-end"
          style={{ animationDelay: '160ms' }}
        >
          <div
            className="pointer-events-none absolute top-1/2 left-1/2 h-[120%] w-[120%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(167,243,208,0.45)_0%,rgba(204,251,241,0.2)_40%,transparent_70%)]"
            aria-hidden
          />
          <BioIntelligenceDashboard />
        </div>
      </Container>
    </section>
  )
}
