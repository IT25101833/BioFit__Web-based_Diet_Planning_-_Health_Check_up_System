import { Link } from 'react-router-dom'
import { ArrowRight, Apple, CalendarCheck, Dumbbell, Stethoscope } from 'lucide-react'
import Container from '../ui/Container'
import FadeIn from '../ui/FadeIn'
import SectionHeading from '../ui/SectionHeading'

const services = [
  {
    icon: Dumbbell,
    title: 'Fitness Programmes',
    description:
      'Structured workout plans designed around your fitness level, preferences and health considerations.',
    to: '/fitness',
  },
  {
    icon: Apple,
    title: 'Nutrition Planning',
    description:
      'Balanced meal plans that respect dietary restrictions, allergies and your wellness goals.',
    to: '/nutrition',
  },
  {
    icon: Stethoscope,
    title: 'Health Check-ups',
    description:
      'Schedule and track medical health assessments to keep your wellness journey informed and safe.',
    to: '/health-checkups',
  },
  {
    icon: CalendarCheck,
    title: 'Wellness Appointments',
    description:
      'Book sessions with fitness coaches, nutrition consultants and medical advisors in one place.',
    to: '/contact',
  },
]

export default function Services() {
  return (
    <section id="services" className="bf-section bg-surface-soft">
      <Container>
        <FadeIn>
          <SectionHeading
            eyebrow="Our Wellness Services"
            title="Care that covers every part of your health"
            description="From movement and meals to check-ups and appointments — BioFit centralizes the services that keep you well."
          />
        </FadeIn>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((service, index) => {
            const Icon = service.icon
            return (
              <FadeIn key={service.title} delay={index * 90}>
                <article className="bf-card flex h-full flex-col p-6">
                  <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-tertiary-container text-tertiary">
                    <Icon className="h-6 w-6" strokeWidth={1.8} />
                  </span>
                  <h3 className="font-h3 text-lg font-semibold text-on-surface">
                    {service.title}
                  </h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-on-surface-variant">
                    {service.description}
                  </p>
                  <Link
                    to={service.to}
                    className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-primary transition-colors hover:text-primary-hover"
                  >
                    Learn More
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </article>
              </FadeIn>
            )
          })}
        </div>
      </Container>
    </section>
  )
}
