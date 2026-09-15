import {
  Activity,
  CalendarDays,
  ChartColumnIncreasing,
  Salad,
  ShieldAlert,
  HeartPulse,
} from 'lucide-react'
import Container from '../ui/Container'
import FadeIn from '../ui/FadeIn'
import SectionHeading from '../ui/SectionHeading'

const features = [
  {
    icon: Activity,
    title: 'Workout Planning',
    description: 'Build and follow fitness routines matched to your capacity.',
  },
  {
    icon: Salad,
    title: 'Meal Planning',
    description: 'Plan balanced meals that fit your preferences and schedule.',
  },
  {
    icon: CalendarDays,
    title: 'Appointment Scheduling',
    description: 'Book wellness sessions without juggling separate systems.',
  },
  {
    icon: ChartColumnIncreasing,
    title: 'Fitness Progress Tracking',
    description: 'Visualize trends so you know what is working over time.',
  },
  {
    icon: ShieldAlert,
    title: 'Dietary Restriction Management',
    description: 'Keep allergies and restrictions visible across every plan.',
  },
  {
    icon: HeartPulse,
    title: 'Medical Health Monitoring',
    description: 'Stay connected to check-ups and health signals that matter.',
  },
]

export default function LifestyleFeatures() {
  return (
    <section id="about" className="bf-section bg-surface-muted">
      <Container>
        <FadeIn>
          <SectionHeading
            eyebrow="Platform Capabilities"
            title="Everything You Need for a Healthier Lifestyle"
            description="BioFit unifies the tools clients and wellness teams rely on — so healthier habits are easier to plan, follow and sustain."
          />
        </FadeIn>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <FadeIn key={feature.title} delay={index * 70}>
                <div className="flex gap-4 rounded-xl border border-transparent p-4 transition-colors hover:border-outline-variant hover:bg-surface">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-secondary-container text-secondary">
                    <Icon className="h-5 w-5" strokeWidth={1.9} />
                  </span>
                  <div>
                    <h3 className="font-display text-base font-semibold text-on-surface">
                      {feature.title}
                    </h3>
                    <p className="mt-1 text-sm leading-relaxed text-on-surface-variant">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </FadeIn>
            )
          })}
        </div>
      </Container>
    </section>
  )
}
