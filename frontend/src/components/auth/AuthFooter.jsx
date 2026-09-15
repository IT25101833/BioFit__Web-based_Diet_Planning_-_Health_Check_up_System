import { Link } from 'react-router-dom'
import Container from '../ui/Container'

export default function AuthFooter() {
  return (
    <footer className="border-t border-[#e8ecf1] bg-white">
      <Container className="flex flex-col gap-3 py-5 text-[12px] text-[#6b7280] sm:flex-row sm:items-center sm:justify-between">
        <nav className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <Link to="/#privacy" className="hover:text-[#005a40]">
            Privacy Policy
          </Link>
          <span aria-hidden>·</span>
          <Link to="/#terms" className="hover:text-[#005a40]">
            Terms &amp; Conditions
          </Link>
          <span aria-hidden>·</span>
          <Link to="/#contact" className="hover:text-[#005a40]">
            Help &amp; Support
          </Link>
        </nav>
        <p>
          © 2026 BioFit – VitalLife Wellness. All rights reserved. HIPAA &amp; ISO
          27001 Certified.
        </p>
      </Container>
    </footer>
  )
}
