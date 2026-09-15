import { Apple, Check } from 'lucide-react'
import MarketingLayout from '../../components/marketing/MarketingLayout'
import MarketingPageHero from '../../components/marketing/MarketingPageHero'
import Container from '../../components/ui/Container'
import FadeIn from '../../components/ui/FadeIn'

const highlights = [
  'Meal plans tailored to your goals and preferences',
  'Dietary restrictions and allergies kept visible to your care team',
  'Nutrition consultant reviews and follow-up appointments',
  'Practical weekly guidance you can actually follow',
]

export default function NutritionPage() {
  return (
    <MarketingLayout>
      <MarketingPageHero
        eyebrow="Nutrition"
        title="Meal planning that respects your health"
        description="BioFit nutrition support helps you build sustainable eating habits with consultant oversight, restriction-aware planning and clear progress reviews."
      />
      <section className="bf-section bg-surface-soft">
        <Container>
          <div className="grid items-start gap-10 lg:grid-cols-2 lg:gap-16">
            <FadeIn>
              <h2 className="font-display text-2xl font-bold text-[#111827]">
                Nutrition with clinical care in mind
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-[#6b7280]">
                Every meal plan can account for allergies, intolerances and medical
                notes so recommendations stay relevant and responsible.
              </p>
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
            <FadeIn delay={100}>
              <div className="rounded-[1.75rem] border border-[#e8ecf1] bg-white px-8 py-10 shadow-[0_12px_32px_rgba(15,23,42,0.05)]">
                <Apple className="h-8 w-8 text-[#005a40]" strokeWidth={1.8} />
                <h2 className="mt-5 font-display text-2xl font-bold text-[#111827]">
                  Eat with intention
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-[#6b7280]">
                  Review meal plans, track adherence and keep nutrition consultants
                  informed as your wellness programme evolves.
                </p>
              </div>
            </FadeIn>
          </div>
        </Container>
      </section>
    </MarketingLayout>
  )
}
