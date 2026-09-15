import { Check, Stethoscope } from 'lucide-react'
import MarketingLayout from '../../components/marketing/MarketingLayout'
import MarketingPageHero from '../../components/marketing/MarketingPageHero'
import Container from '../../components/ui/Container'
import FadeIn from '../../components/ui/FadeIn'

const highlights = [
  'Book medical health assessments with advisors',
  'Keep health records and follow-ups organised',
  'Surface risk alerts that need professional attention',
  'Connect check-up outcomes to fitness and nutrition plans',
]

export default function HealthCheckupsPage() {
  return (
    <MarketingLayout>
      <MarketingPageHero
        eyebrow="Health Check-ups"
        title="Medical insight that guides your wellness path"
        description="Health check-ups in BioFit help medical advisors monitor your progress, raise timely alerts and keep programmes safe."
      />
      <section className="bf-section">
        <Container>
          <div className="grid items-start gap-10 lg:grid-cols-2 lg:gap-16">
            <FadeIn>
              <div className="rounded-[1.75rem] bg-[#0f766e] px-8 py-10 text-white">
                <Stethoscope className="h-8 w-8" strokeWidth={1.8} />
                <h2 className="mt-5 font-display text-2xl font-bold">
                  Informed care
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-white/85">
                  Assessments, alerts and health notes stay connected to your
                  programmes so every recommendation remains health-aware.
                </p>
              </div>
            </FadeIn>
            <FadeIn delay={100}>
              <h2 className="font-display text-2xl font-bold text-[#111827]">
                Check-up experience
              </h2>
              <ul className="mt-6 space-y-4">
                {highlights.map((item) => (
                  <li key={item} className="flex gap-3 text-sm text-[#374151]">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#e6f5f0] text-[#005a40]">
                      <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </FadeIn>
          </div>
        </Container>
      </section>
    </MarketingLayout>
  )
}
