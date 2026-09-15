import { Link } from 'react-router-dom'
import LoginBrandPanel from '../components/auth/LoginBrandPanel'
import LoginForm from '../components/auth/LoginForm'
import Footer from '../components/layout/Footer'
import Navbar from '../components/layout/Navbar'
import Container from '../components/ui/Container'

export default function LoginPage() {
  return (
    <div className="min-h-svh bg-[#f8f9fb]">
      {/* Header.png */}
      <Navbar />

      {/* Main.png */}
      <main>
        <Container className="py-8 lg:py-10">
          <div className="mb-8 flex flex-wrap items-center justify-between gap-3 lg:mb-10">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-[#6b7280] transition-colors hover:text-[#005a40]"
            >
              ← Back to Home
            </Link>
            <span className="inline-flex items-center gap-2 rounded-full bg-[#e8eefc] px-3.5 py-1.5 text-[11px] font-semibold text-[#3d4a63]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#3b82f6]" />
              Clinical Identity Gateway 2.4
            </span>
          </div>

          <div className="grid items-center gap-10 lg:grid-cols-[1.08fr_0.92fr] lg:gap-12 xl:gap-16">
            <LoginBrandPanel />
            <div className="flex justify-center lg:justify-end">
              <LoginForm />
            </div>
          </div>

          {/* Main.png bottom compliance strip */}
          <div className="mt-12 flex flex-col gap-3 border-t border-[#e8ecf1] pt-6 text-[12px] text-[#6b7280] sm:flex-row sm:items-center sm:justify-between">
            <p>
              © 2026 BioFit – VitalLife Wellness Systems. All health telemetry is
              protected under HIPAA and ISO 27001.
            </p>
            <nav className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <Link to="/#privacy" className="hover:text-[#005a40]">
                Privacy Policy
              </Link>
              <span aria-hidden>·</span>
              <Link to="/#terms" className="hover:text-[#005a40]">
                Terms of Service
              </Link>
              <span aria-hidden>·</span>
              <Link to="/#contact" className="hover:text-[#005a40]">
                Help &amp; Clinical Support
              </Link>
            </nav>
          </div>
        </Container>
      </main>

      {/* Footer.png */}
      <Footer />
    </div>
  )
}
