import { Link } from 'react-router-dom'
import AuthFooter from '../components/auth/AuthFooter'
import AuthHeader from '../components/auth/AuthHeader'
import ResetPasswordBrandPanel from '../components/auth/ResetPasswordBrandPanel'
import ResetPasswordForm from '../components/auth/ResetPasswordForm'
import Container from '../components/ui/Container'

export default function ResetPasswordPage() {
  return (
    <div className="min-h-svh bg-[#f8f9fb]">
      <AuthHeader
        prompt=""
        actionLabel="Sign In"
        actionTo="/login"
        backLabel="← Back to Login"
        backTo="/login"
      />

      <main className="bf-hero-bg border-b border-[#e8ecf1]/60">
        <Container className="py-8 lg:py-12">
          <div className="mb-6 sm:hidden">
            <Link
              to="/login"
              className="text-sm font-medium text-[#6b7280] hover:text-[#005a40]"
            >
              ← Back to Login
            </Link>
          </div>

          <div className="grid items-center gap-10 lg:grid-cols-[1.08fr_0.92fr] lg:gap-12 xl:gap-16">
            <div className="hidden lg:block">
              <ResetPasswordBrandPanel />
            </div>
            <div className="flex justify-center lg:justify-end">
              <ResetPasswordForm />
            </div>
          </div>
        </Container>
      </main>

      <AuthFooter />
    </div>
  )
}
