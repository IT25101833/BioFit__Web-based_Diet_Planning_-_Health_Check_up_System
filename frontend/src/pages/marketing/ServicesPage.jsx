import { Link } from 'react-router-dom'
import {
  Apple,
  ArrowRight,
  CalendarCheck,
  Dumbbell,
  Stethoscope,
} from 'lucide-react'
import MarketingLayout from '../../components/marketing/MarketingLayout'
import MarketingPageHero from '../../components/marketing/MarketingPageHero'
import Container from '../../components/ui/Container'
import FadeIn from '../../components/ui/FadeIn'

const services = [
  {
    to: '/fitness',
    icon: Dumbbell,
    title: 'Fitness Programmes',
    description:
      'Structured workout plans designed around your fitness level, preferences and health considerations.',
  },
  {
    to: '/nutrition',
    icon: Apple,
    title: 'Nutrition Planning',
    description:
      'Balanced meal plans that respect dietary restrictions, allergies and your wellness goals.',
  },
  {
    to: '/health-checkups',
    icon: Stethoscope,
    title: 'Health Check-ups',
    description:
      'Schedule and track medical health assessments to keep your wellness journey informed and safe.',
  },
  {
    to: '/contact',
    icon: CalendarCheck,
    title: 'Wellness Appointments',
    description:
      'Book sessions with fitness coaches, nutrition consultants and medical advisors in one place.',
  },
]

export default function ServicesPage() {
  return (
    <MarketingLayout>
      <MarketingPageHero
        eyebrow="Our Wellness Services"
        title="Care that covers every part of your health"
        description="From movement and meals to check-ups and appointments — BioFit centralizes the services that keep you well."
      />
      <section className="bf-section bg-surface-soft">
        <Container>
          <div className="grid gap-6 sm:grid-cols-2">
            {services.map((service, index) => {
              const Icon = service.icon
              return (
                <FadeIn key={service.title} delay={index * 80}>
                  <article className="bf-card flex h-full flex-col p-7">
                    <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#e6f5f0] text-[#005a40]">
                      <Icon className="h-6 w-6" strokeWidth={1.8} />
                    </span>
                    <h2 className="font-display text-xl font-bold text-[#111827]">
                      {service.title}
                    </h2>
                    <p className="mt-2 flex-1 text-sm leading-relaxed text-[#6b7280]">
                      {service.description}
                    </p>
                    <Link
                      to={service.to}
                      className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-[#005a40] hover:underline"
                    >
                      Explore
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </article>
                </FadeIn>
              )
            })}
          </div>
        </Container>
      </section>
    </MarketingLayout>
  )
}
