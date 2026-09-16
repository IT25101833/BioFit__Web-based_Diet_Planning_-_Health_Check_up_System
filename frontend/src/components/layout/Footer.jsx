import { Leaf, Mail, MapPin, Phone } from 'lucide-react'
import { Link } from 'react-router-dom'
import Container from '../ui/Container'

const quickLinks = [
  { label: 'Home', href: '/' },
  { label: 'About Us', href: '/about' },
  { label: 'Our Specialists', href: '/about' },
  { label: 'Careers', href: '/contact' },
  { label: 'Press', href: '/contact' },
]

const services = [
  { label: 'Diet Planning', href: '/nutrition' },
  { label: 'Fitness Programmes', href: '/fitness' },
  { label: 'Health Check-ups', href: '/health-checkups' },
  { label: 'Medical Advisory', href: '/health-checkups' },
  { label: 'Corporate Wellness', href: '/services' },
]

const support = [
  { label: 'Help Center', href: '/contact' },
  { label: 'Patient Portal', href: '/login' },
  { label: 'Schedule Appointment', href: '/login' },
  { label: 'FAQs', href: '/about' },
]

const legalLinks = [
  { label: 'Privacy Policy', href: '/#privacy' },
  { label: 'Terms of Service', href: '/#terms' },
  { label: 'HIPAA & Health Data Compliance', href: '/#privacy' },
  { label: 'Cookie Settings', href: '/#privacy' },
]

export default function Footer() {
  return (
    <footer id="contact" className="border-t border-[var(--bf-border)] bg-[var(--bf-surface)]">
      <Container className="px-6 pt-16 pb-8 sm:px-8 lg:pt-20 lg:pb-10">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.35fr_0.9fr_0.95fr_0.9fr_1.15fr] lg:gap-x-10 xl:gap-x-14">
          <div>
            <Link to="/" className="inline-flex items-center gap-2.5">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[var(--bf-primary)] text-[var(--color-on-primary)]">
                <Leaf className="h-4 w-4" strokeWidth={2.4} />
              </span>
              <span className="leading-none">
                <span className="block font-display text-[1.35rem] font-bold tracking-tight text-[var(--bf-ink)]">
                  BioFit
                </span>
                <span className="mt-1 block text-[9px] font-semibold tracking-[0.16em] text-[var(--bf-primary)] uppercase">
                  VitalLife Wellness
                </span>
              </span>
            </Link>

            <p className="mt-5 max-w-[280px] text-[13px] leading-[1.7] text-[var(--bf-muted)]">
              Empowering lifelong human vitality through clinical precision,
              preventive diagnostic telemetry, and data-backed personalized
              nutrition planning.
            </p>

            <div className="mt-6 flex flex-wrap gap-2">
              <TrustBadge label="HIPAA Compliant" />
              <TrustBadge label="ISO 27001 Certified" />
            </div>
          </div>

          <FooterColumn title="Quick Links" links={quickLinks} />
          <FooterColumn title="Services" links={services} />
          <FooterColumn title="Support" links={support} />

          <div>
            <h3 className="mb-5 text-[15px] font-bold text-[var(--bf-ink)]">
              Contact Us
            </h3>
            <ul className="space-y-4">
              <ContactItem icon={MapPin}>
                VitalLife Clinic, 450 Health Parkway, Suite 800, Medical City
              </ContactItem>
              <ContactItem icon={Mail} href="mailto:care@biofitvitallife.com">
                care@biofitvitallife.com
              </ContactItem>
              <ContactItem icon={Phone} href="tel:+18004588482">
                +1 (800) 458-VITA
              </ContactItem>
            </ul>
          </div>
        </div>

        <div className="mt-14 rounded-2xl bg-[var(--bf-surface-raised)] px-5 py-4 text-[12px] text-[var(--bf-muted)] sm:mt-16 lg:mt-20">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p>
              © 2024 VitalLife Wellness Inc. All rights reserved. BioFit clinical
              diagnostics and telemetry systems.
            </p>
            <nav className="flex flex-wrap gap-x-5 gap-y-2" aria-label="Legal">
              {legalLinks.map((link) => (
                <Link
                  key={link.label}
                  to={link.href}
                  className="transition-colors hover:text-[var(--bf-primary)]"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </Container>
    </footer>
  )
}

function TrustBadge({ label }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-[var(--bf-primary-soft)] px-3 py-1.5 text-[11px] font-semibold text-[var(--bf-ink)]">
      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--bf-primary)]" />
      {label}
    </span>
  )
}

function FooterColumn({ title, links }) {
  return (
    <div>
      <h3 className="mb-5 text-[15px] font-bold text-[var(--bf-ink)]">{title}</h3>
      <ul className="space-y-3">
        {links.map((link) => (
          <li key={link.label}>
            <Link
              to={link.href}
              className="text-[13px] font-normal text-[var(--bf-muted)] transition-colors hover:text-[var(--bf-primary)]"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

function ContactItem({ icon: Icon, children, href }) {
  const content = (
    <>
      <Icon
        className="mt-0.5 h-[15px] w-[15px] shrink-0 text-[var(--bf-primary)]"
        strokeWidth={1.8}
      />
      <span className="text-[13px] leading-snug text-[var(--bf-muted)]">{children}</span>
    </>
  )

  if (href) {
    return (
      <li>
        <a
          href={href}
          className="flex items-start gap-2.5 transition-colors hover:[&_span]:text-[var(--bf-primary)]"
        >
          {content}
        </a>
      </li>
    )
  }

  return <li className="flex items-start gap-2.5">{content}</li>
}
