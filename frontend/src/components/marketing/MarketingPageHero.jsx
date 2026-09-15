import Button from '../ui/Button'
import Container from '../ui/Container'

export default function MarketingPageHero({
  eyebrow,
  title,
  description,
  primaryTo = '/register',
  primaryLabel = 'Get Started',
  secondaryTo = '/login',
  secondaryLabel = 'Login',
}) {
  return (
    <section className="bf-hero-bg relative overflow-hidden border-b border-[#e8ecf1]">
      <Container className="max-w-3xl py-14 text-center lg:py-20">
        {eyebrow ? (
          <p className="text-[12px] font-semibold tracking-[0.14em] text-[#005a40] uppercase">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="mt-3 font-display text-3xl font-bold tracking-tight text-[#111827] sm:text-4xl lg:text-[2.75rem]">
          {title}
        </h1>
        {description ? (
          <p className="mx-auto mt-4 max-w-2xl text-[15px] leading-relaxed text-[#6b7280] sm:text-base">
            {description}
          </p>
        ) : null}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button to={primaryTo} size="lg" className="rounded-full px-7">
            {primaryLabel}
          </Button>
          <Button to={secondaryTo} variant="outline" size="lg" className="rounded-full px-7">
            {secondaryLabel}
          </Button>
        </div>
      </Container>
    </section>
  )
}
