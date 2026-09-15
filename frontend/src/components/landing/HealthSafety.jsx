import { Check } from 'lucide-react'
import Container from '../ui/Container'
import FadeIn from '../ui/FadeIn'
import healthVisual from '../../assets/health-safety.png'

const points = [
  'Health history and medical considerations inform programme design',
  'Allergies and dietary restrictions stay visible to care teams',
  'Fitness and nutrition recommendations remain health-safe by default',
  'Professionals collaborate around one shared client wellness profile',
]

export default function HealthSafety() {
  return (
    <section className="bf-section bg-surface">
      <Container>
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <FadeIn>
            <div className="relative">
              <div className="pointer-events-none absolute -inset-4 rounded-3xl bg-gradient-to-tr from-primary-container/50 to-tertiary-container/40 blur-xl" />
              <img
                src={healthVisual}
                alt="Health-safe wellness planning with medical and dietary considerations"
                className="relative w-full rounded-2xl object-cover shadow-ambient"
              />
            </div>
          </FadeIn>

          <FadeIn delay={120}>
            <p className="font-label-caps text-label-caps uppercase text-primary">
              Health & Safety
            </p>
            <h2 className="mt-3 font-h2 text-h2 text-on-surface">
              Wellness Designed Around Your Health
            </h2>
            <p className="mt-4 leading-relaxed text-on-surface-variant">
              BioFit treats your health information as the foundation of every
              plan. Allergies, dietary restrictions and medical considerations
              can be considered when managing fitness and nutrition programmes —
              so guidance stays relevant, responsible and trustworthy.
            </p>
            <ul className="mt-6 space-y-3">
              {points.map((point) => (
                <li key={point} className="flex gap-3 text-sm text-on-surface">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary-container text-primary">
                    <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
                  </span>
                  {point}
                </li>
              ))}
            </ul>
          </FadeIn>
        </div>
      </Container>
    </section>
  )
}
