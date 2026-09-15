import { Building2, Lock, Shield } from 'lucide-react'
import { Link } from 'react-router-dom'
import AuthFooter from '../components/auth/AuthFooter'
import AuthHeader from '../components/auth/AuthHeader'
import RegisterForm, { TrustBanner } from '../components/auth/RegisterForm'
import Container from '../components/ui/Container'

const trustItems = [
  { icon: Lock, label: '256-Bit SSL/TLS' },
  { icon: Building2, label: 'HIPAA Compliant Record Vault' },
  { icon: Shield, label: 'Zero Commercial Telemetry Reselling' },
]

export default function RegisterPage() {
  return (
    <div className="flex min-h-svh flex-col bg-[#f8f9fb]">
      <AuthHeader />

      <main className="flex-1">
        <Container className="max-w-4xl py-8 lg:py-12">
          <div className="mb-4 text-center sm:hidden">
            <Link
              to="/"
              className="text-sm font-medium text-[#6b7280] hover:text-[#005a40]"
            >
              ← Back to Home
            </Link>
          </div>

          <div className="mb-6 flex justify-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-[#e6f5f0] px-4 py-1.5 text-[11px] font-semibold text-[#005a40]">
              <Shield className="h-3.5 w-3.5" strokeWidth={2.2} />
              HIPAA-Compliant &amp; 256-Bit Encrypted Architecture
            </span>
          </div>

          <div className="mb-8 text-center">
            <h1 className="font-display text-3xl font-bold tracking-tight text-[#111827] sm:text-4xl">
              Create Your BioFit Account
            </h1>
            <p className="mx-auto mt-3 text-sm font-normal leading-[1.65] text-[#6b7280] sm:text-base">
              <span className="block sm:whitespace-nowrap">
                Start your personalized wellness journey with clinical nutrition,
                preventive vitals
              </span>
              <span className="block sm:whitespace-nowrap">
                tracking, and bio-telemetry all in one place.
              </span>
            </p>
          </div>

          <div className="mx-auto max-w-3xl">
            <TrustBanner />
            <RegisterForm />
          </div>

          <ul className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
            {trustItems.map((item) => {
              const Icon = item.icon
              return (
                <li
                  key={item.label}
                  className="inline-flex items-center gap-2 text-xs font-semibold text-[#005a40]"
                >
                  <Icon className="h-3.5 w-3.5" strokeWidth={2.2} />
                  {item.label}
                </li>
              )
            })}
          </ul>
        </Container>
      </main>

      <AuthFooter />
    </div>
  )
}
