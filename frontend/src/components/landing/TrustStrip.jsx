import {
  Activity,
  BriefcaseMedical,
  ShieldCheck,
  SlidersHorizontal,
} from 'lucide-react'
import Container from '../ui/Container'
import FadeIn from '../ui/FadeIn'

const items = [
  {
    icon: SlidersHorizontal,
    iconBg: 'bg-emerald-50 text-primary',
    title: '100% Personalized Plans',
    detail:
      'Every programme is calibrated to metabolic rate, biomarkers, and clinical history — never one-size-fits-all.',
  },
  {
    icon: BriefcaseMedical,
    iconBg: 'bg-teal-50 text-teal-700',
    title: '250+ Accredited Experts',
    detail:
      'Clinical dietitians, physiotherapists, and medical advisors guide every plan on the VitalLife network.',
  },
  {
    icon: ShieldCheck,
    iconBg: 'bg-sky-50 text-sky-700',
    title: 'Zero Generic Health-Safe Guidance',
    detail:
      'Chronic indicators and pharmacotherapy safeguards keep fitness and nutrition recommendations health-safe.',
  },
  {
    icon: Activity,
    iconBg: 'bg-violet-50 text-violet-700',
    title: 'Real-Time Bio-Metric Telemetry',
    detail:
      'Continuous sync across wearables and daily metrics so progress stays visible to you and your care team.',
  },
]

export default function TrustStrip() {
  return (
    <section
      className="bf-hero-bg border-b border-outline-variant/50 pb-14 lg:pb-16"
      aria-label="Trust highlights"
    >
      <Container>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item, index) => {
            const Icon = item.icon
            return (
              <FadeIn key={item.title} delay={index * 70}>
                <article className="h-full rounded-2xl border border-outline-variant bg-surface p-5 shadow-ambient">
                  <span
                    className={`mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl ${item.iconBg}`}
                  >
                    <Icon className="h-5 w-5" strokeWidth={1.9} />
                  </span>
                  <h3 className="font-display text-sm font-bold text-on-surface">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-xs leading-relaxed text-on-surface-variant">
                    {item.detail}
                  </p>
                </article>
              </FadeIn>
            )
          })}
        </div>
      </Container>
    </section>
  )
}
