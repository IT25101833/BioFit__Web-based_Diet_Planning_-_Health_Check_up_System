import { Check, Dumbbell } from 'lucide-react'
import MarketingLayout from '../../components/marketing/MarketingLayout'
import MarketingPageHero from '../../components/marketing/MarketingPageHero'
import Container from '../../components/ui/Container'
import FadeIn from '../../components/ui/FadeIn'

const highlights = [
  'Personalised workout plans matched to your fitness level',
  'Progress tracking across strength, mobility and recovery',
  'Coach guidance aligned with your medical considerations',
  'Session booking and programme updates in one portal',
]

export default function FitnessPage() {
  return (
    <MarketingLayout>
      <MarketingPageHero
        eyebrow="Fitness"
        title="Movement plans built for lasting progress"
        description="BioFit fitness programmes combine structured training, coach oversight and health-aware recommendations so your workouts stay effective and safe."
      />
      <section className="bf-section">
        <Container>
          <div className="grid items-start gap-10 lg:grid-cols-2 lg:gap-16">
            <FadeIn>
              <div className="rounded-[1.75rem] bg-[#005a40] px-8 py-10 text-white">
                <Dumbbell className="h-8 w-8" strokeWidth={1.8} />
                <h2 className="mt-5 font-display text-2xl font-bold">
                  Train with clarity
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-white/85">
                  Follow weekly plans, review completed sessions and stay aligned with
                  coaches who understand your wellness goals.
                </p>
              </div>
            </FadeIn>
            <FadeIn delay={100}>
              <h2 className="font-display text-2xl font-bold text-[#111827]">
                What you get
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
