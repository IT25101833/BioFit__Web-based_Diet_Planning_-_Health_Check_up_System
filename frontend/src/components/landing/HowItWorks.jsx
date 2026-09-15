import {
  ClipboardCheck,
  LineChart,
  UserRound,
  Sparkles,
} from 'lucide-react'
import Container from '../ui/Container'
import FadeIn from '../ui/FadeIn'
import SectionHeading from '../ui/SectionHeading'

const steps = [
  {
    icon: UserRound,
    title: 'Create Your Profile',
    description:
      'Set up your BioFit account with basic details and wellness preferences.',
  },
  {
    icon: ClipboardCheck,
    title: 'Complete Health Assessment',
    description:
      'Share health history, goals, restrictions and lifestyle factors securely.',
  },
  {
    icon: Sparkles,
    title: 'Receive Personalized Plans',
    description:
      'Get fitness and nutrition programmes shaped around your assessment.',
  },
  {
    icon: LineChart,
    title: 'Track Your Progress',
    description:
      'Monitor improvements, adjust plans and stay accountable over time.',
  },
]

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="bf-section bg-surface">
      <Container>
        <FadeIn>
          <SectionHeading
            eyebrow="How BioFit Works"
            title="Four clear steps to better wellness"
            description="A simple journey from profile setup to measurable progress — guided by professionals at every stage."
          />
        </FadeIn>

        <ol className="relative grid gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
          <div
            className="pointer-events-none absolute top-10 right-[12%] left-[12%] hidden h-px bg-gradient-to-r from-primary/20 via-primary/40 to-primary/20 lg:block"
            aria-hidden
          />

          {steps.map((step, index) => {
            const Icon = step.icon
            return (
              <FadeIn key={step.title} delay={index * 100} as="li">
                <div className="relative flex flex-col items-center text-center">
                  <span className="relative z-10 mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-outline-variant bg-surface text-primary shadow-ambient">
                    <Icon className="h-7 w-7" strokeWidth={1.8} />
                    <span className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-on-primary">
                      {index + 1}
                    </span>
                  </span>
                  <h3 className="font-display text-base font-semibold text-on-surface">
                    {step.title}
                  </h3>
                  <p className="mt-2 max-w-[220px] text-sm leading-relaxed text-on-surface-variant">
                    {step.description}
                  </p>
                </div>
              </FadeIn>
            )
          })}
        </ol>
      </Container>
    </section>
  )
}
