import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Leaf, Menu, X } from 'lucide-react'
import Button from '../ui/Button'
import Container from '../ui/Container'
import ThemeToggle from '../ui/ThemeToggle'

const links = [
  { label: 'Home', to: '/' },
  { label: 'Services', to: '/services' },
  { label: 'Fitness', to: '/fitness' },
  { label: 'Nutrition', to: '/nutrition' },
  { label: 'Health Check-ups', to: '/health-checkups' },
  { label: 'About', to: '/about' },
  { label: 'Contact', to: '/contact' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const location = useLocation()

  return (
    <header className="bf-topbar sticky top-0 z-50 backdrop-blur-md">
      <Container className="flex h-[72px] items-center justify-between gap-4">
        <Link to="/" className="inline-flex shrink-0 items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--bf-primary)] text-white shadow-[var(--bf-shadow-out)]">
            <Leaf className="h-4 w-4" strokeWidth={2.4} />
          </span>
          <span className="leading-tight">
            <span className="block font-display text-[1.45rem] font-bold tracking-tight text-[var(--bf-ink)]">
              BioFit
            </span>
            <span className="block text-[9px] font-semibold tracking-[0.14em] text-[var(--bf-primary)] uppercase">
              VitalLife Wellness
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-0.5 xl:flex" aria-label="Primary">
          {links.map((link) => {
            const isActive = location.pathname === link.to
            return (
              <Link
                key={link.label}
                to={link.to}
                className={[
                  'rounded-full px-3.5 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-[var(--bf-primary-soft)] text-[var(--bf-ink)]'
                    : 'text-[var(--bf-muted)] hover:bg-[var(--bf-surface)] hover:text-[var(--bf-ink)]',
                ].join(' ')}
              >
                {link.label}
              </Link>
            )
          })}
        </nav>

        <div className="hidden items-center gap-2.5 sm:flex">
          <ThemeToggle />
          <Button
            to="/login"
            size="sm"
            className="rounded-full !bg-[var(--bf-primary-soft)] !px-5 !text-[var(--bf-primary)] hover:opacity-90 shadow-[var(--bf-shadow-out)]"
          >
            Login
          </Button>
          <Button
            to="/register"
            size="sm"
            className="rounded-full !bg-[var(--bf-primary)] !px-5 !text-white hover:opacity-90"
          >
            Get Started
          </Button>
        </div>

        <div className="flex items-center gap-2 xl:hidden">
          <ThemeToggle />
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-lg p-2 text-[var(--bf-ink)]"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? 'Close menu' : 'Open menu'}
            onClick={() => setOpen((prev) => !prev)}
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </Container>

      {open ? (
        <div id="mobile-nav" className="border-t border-[var(--bf-border)] bg-[var(--bf-surface-raised)] xl:hidden">
          <Container className="flex flex-col gap-1 py-4">
            {links.map((link) => {
              const isActive = location.pathname === link.to
              return (
                <Link
                  key={link.label}
                  to={link.to}
                  className={[
                    'rounded-full px-3 py-2.5 text-sm font-medium',
                    isActive
                      ? 'bg-[var(--bf-primary-soft)] text-[var(--bf-ink)]'
                      : 'text-[var(--bf-muted)] hover:bg-[var(--bf-surface)]',
                  ].join(' ')}
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                </Link>
              )
            })}
            <div className="mt-3 flex flex-col gap-2 border-t border-[var(--bf-border)] pt-3 sm:hidden">
              <Button
                to="/login"
                size="md"
                className="rounded-full !bg-[var(--bf-primary-soft)] !text-[var(--bf-primary)]"
              >
                Login
              </Button>
              <Button
                to="/register"
                size="md"
                className="rounded-full !bg-[var(--bf-primary)] !text-white"
              >
                Get Started
              </Button>
            </div>
          </Container>
        </div>
      ) : null}
    </header>
  )
}
