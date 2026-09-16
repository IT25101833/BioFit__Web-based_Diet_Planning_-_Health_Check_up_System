import { Link } from 'react-router-dom'
import Button from '../ui/Button'
import Container from '../ui/Container'
import FadeIn from '../ui/FadeIn'

export default function CallToAction() {
  return (
    <section id="get-started" className="bf-section pt-0">
      <Container>
        <FadeIn>
          <div className="bf-gradient-cta relative overflow-hidden rounded-2xl px-6 py-14 text-center shadow-ambient sm:px-10 lg:px-16 lg:py-16">
            <div
              className="pointer-events-none absolute inset-0 opacity-30"
              style={{
                backgroundImage:
                  'radial-gradient(circle at 20% 20%, rgba(255,255,255,0.25), transparent 40%), radial-gradient(circle at 80% 80%, rgba(255,255,255,0.18), transparent 35%)',
              }}
            />
            <div className="relative mx-auto max-w-2xl">
              <h2 className="font-h2 text-h2 text-white">
                Ready to Start Your Wellness Journey?
              </h2>
              <p className="mt-4 text-base leading-relaxed text-white/85">
                Join BioFit and bring fitness, nutrition, health check-ups and
                wellness appointments into one clear, personalized experience.
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                <Button
                  to="/register"
                  size="lg"
                  className="!bg-[var(--bf-surface-raised)] !text-[var(--bf-ink)] hover:!bg-[var(--bf-surface)]"
                >
                  Get Started
                </Button>
                <Link
                  to="/login"
                  className="text-sm font-semibold text-white underline-offset-4 hover:underline"
                >
                  Already have an account? Login
                </Link>
              </div>
            </div>
          </div>
        </FadeIn>
      </Container>
    </section>
  )
}
