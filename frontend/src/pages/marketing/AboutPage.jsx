import { Check, Leaf } from 'lucide-react'
import MarketingLayout from '../../components/marketing/MarketingLayout'
import MarketingPageHero from '../../components/marketing/MarketingPageHero'
import Container from '../../components/ui/Container'
import FadeIn from '../../components/ui/FadeIn'

const values = [
  'Integrated fitness, nutrition and medical wellness in one platform',
  'Role-based portals for clients and care professionals',
  'Health-safe planning grounded in clinical awareness',
  'Clear progress tracking across programmes and appointments',
]

export default function AboutPage() {
  return (
    <MarketingLayout>
      <MarketingPageHero
        eyebrow="About BioFit"
        title="VitalLife Wellness, powered by BioFit"
        description="BioFit is the digital wellness platform behind VitalLife — connecting clients, coaches, nutrition consultants, medical advisors and support teams."
        primaryLabel="Join BioFit"
        secondaryLabel="Contact us"
        secondaryTo="/contact"
      />
      <section className="bf-section bg-surface-soft">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
            <FadeIn>
              <div className="rounded-[1.75rem] border border-[#e8ecf1] bg-white px-8 py-10">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#005a40] text-white">
                  <Leaf className="h-5 w-5" strokeWidth={2.4} />
                </span>
                <h2 className="mt-5 font-display text-2xl font-bold text-[#111827]">
                  Our mission
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-[#6b7280]">
                  Make lifelong wellness practical by bringing personalised programmes,
                  professional guidance and health safety into one trusted experience.
                </p>
              </div>
            </FadeIn>
            <FadeIn delay={100}>
              <h2 className="font-display text-2xl font-bold text-[#111827]">
                What we stand for
              </h2>
              <ul className="mt-6 space-y-4">
                {values.map((item) => (
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
