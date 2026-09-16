import { Leaf } from 'lucide-react'
import { Link } from 'react-router-dom'
import Button from '../ui/Button'
import Container from '../ui/Container'
import ThemeToggle from '../ui/ThemeToggle'

export default function AuthHeader({
  prompt = 'Already have an account?',
  actionLabel = 'Sign In',
  actionTo = '/login',
  backLabel = '← Back to Home',
  backTo = '/',
}) {
  return (
    <header className="bf-topbar backdrop-blur-md">
      <Container className="flex h-16 items-center justify-between gap-4 lg:h-[72px]">
        <div className="flex items-center gap-4 sm:gap-6">
          <Link to="/" className="inline-flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--bf-primary)] text-white shadow-[var(--bf-shadow-out)]">
              <Leaf className="h-4 w-4" strokeWidth={2.4} />
            </span>
            <span className="leading-tight">
              <span className="block font-display text-xl font-bold tracking-tight text-[var(--bf-ink)]">
                BioFit
              </span>
              <span className="hidden text-[9px] font-semibold tracking-[0.14em] text-[var(--bf-primary)] uppercase sm:block">
                VitalLife Wellness
              </span>
            </span>
          </Link>
          <Link
            to={backTo}
            className="hidden text-sm font-medium text-[var(--bf-muted)] transition-colors hover:text-[var(--bf-primary)] sm:inline-flex"
          >
            
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          {prompt ? (
            <p className="hidden text-sm text-[var(--bf-muted)] md:block">{prompt}</p>
          ) : null}
          <Button
            to={actionTo}
            variant="outline"
            size="sm"
            className="rounded-full !border-[var(--bf-border)] !px-5 !text-[var(--bf-primary)] hover:!bg-[var(--bf-primary-soft)]"
          >
            {actionLabel}
          </Button>
        </div>
      </Container>
    </header>
  )
}
