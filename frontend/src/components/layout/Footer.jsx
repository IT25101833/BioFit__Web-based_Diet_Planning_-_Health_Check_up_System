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
    <footer id="contact" className="bg-[#f4f7ff]">
      <Container className="px-6 pt-16 pb-8 sm:px-8 lg:pt-20 lg:pb-10">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.35fr_0.9fr_0.95fr_0.9fr_1.15fr] lg:gap-x-10 xl:gap-x-14">
          <div>
            <Link to="/" className="inline-flex items-center gap-2.5">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[#005a40] text-white">
                <Leaf className="h-4 w-4" strokeWidth={2.4} />
              </span>
              <span className="leading-none">
                <span className="block font-display text-[1.35rem] font-bold tracking-tight text-[#111827]">
                  BioFit
                </span>
                <span className="mt-1 block text-[9px] font-semibold tracking-[0.16em] text-[#005a40] uppercase">
                  VitalLife Wellness
                </span>
              </span>
            </Link>

            <p className="mt-5 max-w-[280px] text-[13px] leading-[1.7] text-[#6b7280]">
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
            <h3 className="mb-5 text-[15px] font-bold text-[#111827]">
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

        {/* Rounded copyright bar — matches Footer.png */}
        <div className="mt-14 rounded-2xl bg-[#e8eefc] px-5 py-4 text-[12px] text-[#6b7280] sm:mt-16 lg:mt-20">
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
                  className="transition-colors hover:text-[#005a40]"
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
    <span className="inline-flex items-center gap-2 rounded-full bg-[#e4eaf5] px-3 py-1.5 text-[11px] font-semibold text-[#3d4a63]">
      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#005a40]" />
      {label}
    </span>
  )
}

function FooterColumn({ title, links }) {
  return (
    <div>
      <h3 className="mb-5 text-[15px] font-bold text-[#111827]">{title}</h3>
      <ul className="space-y-3">
        {links.map((link) => {
          const className = [
            'text-[13px] transition-colors hover:text-[#005a40]',
            link.active
              ? 'font-semibold text-[#005a40]'
              : 'font-normal text-[#6b7280]',
          ].join(' ')

          return (
            <li key={link.label}>
              <Link to={link.href} className={className}>
                {link.label}
              </Link>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

function ContactItem({ icon: Icon, children, href }) {
  const content = (
    <>
      <Icon
        className="mt-0.5 h-[15px] w-[15px] shrink-0 text-[#4a9d9c]"
        strokeWidth={1.8}
      />
      <span className="text-[13px] leading-snug text-[#6b7280]">{children}</span>
    </>
  )

  if (href) {
    return (
      <li>
        <a
          href={href}
          className="flex items-start gap-2.5 transition-colors hover:[&_span]:text-[#005a40]"
        >
          {content}
        </a>
      </li>
    )
  }

  return <li className="flex items-start gap-2.5">{content}</li>
}
