import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Leaf, Menu, X } from 'lucide-react'
import Button from '../ui/Button'
import Container from '../ui/Container'

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
    <header className="sticky top-0 z-50 border-b border-[#e8ecf1] bg-[#f8f9fe]/95 backdrop-blur-md">
      <Container className="flex h-[72px] items-center justify-between gap-4">
        <Link to="/" className="inline-flex shrink-0 items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#005a40] text-white">
            <Leaf className="h-4 w-4" strokeWidth={2.4} />
          </span>
          <span className="leading-tight">
            <span className="block font-display text-[1.45rem] font-bold tracking-tight text-[#111827]">
              BioFit
            </span>
            <span className="block text-[9px] font-semibold tracking-[0.14em] text-[#005a40] uppercase">
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
                    ? 'bg-[#e8eaf6] text-[#111827]'
                    : 'text-[#374151] hover:bg-[#eef0f7] hover:text-[#111827]',
                ].join(' ')}
              >
                {link.label}
              </Link>
            )
          })}
        </nav>

        <div className="hidden items-center gap-2.5 sm:flex">
          <Button
            to="/login"
            size="sm"
            className="rounded-full !bg-[#9ff5ea] !px-5 !text-[#0f766e] hover:!bg-[#7deedf] shadow-none"
          >
            Login
          </Button>
          <Button
            to="/register"
            size="sm"
            className="rounded-full !bg-[#005a40] !px-5 !text-white hover:!bg-[#004833]"
          >
            Get Started
          </Button>
        </div>

        <button
          type="button"
          className="inline-flex items-center justify-center rounded-lg p-2 text-[#111827] xl:hidden"
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? 'Close menu' : 'Open menu'}
          onClick={() => setOpen((prev) => !prev)}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </Container>

      {open ? (
        <div id="mobile-nav" className="border-t border-[#e8ecf1] bg-white xl:hidden">
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
                      ? 'bg-[#e8eaf6] text-[#111827]'
                      : 'text-[#374151] hover:bg-[#e8eaf6]',
                  ].join(' ')}
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                </Link>
              )
            })}
            <div className="mt-3 flex flex-col gap-2 border-t border-[#e8ecf1] pt-3 sm:hidden">
              <Button
                to="/login"
                size="md"
                className="rounded-full !bg-[#9ff5ea] !text-[#0f766e]"
              >
                Login
              </Button>
              <Button
                to="/register"
                size="md"
                className="rounded-full !bg-[#005a40] !text-white"
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
