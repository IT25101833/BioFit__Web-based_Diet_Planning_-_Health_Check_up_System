import { Leaf } from 'lucide-react'
import { Link } from 'react-router-dom'
import Button from '../ui/Button'
import Container from '../ui/Container'

export default function AuthHeader({
  prompt = 'Already have an account?',
  actionLabel = 'Sign In',
  actionTo = '/login',
  backLabel = '← Back to Home',
  backTo = '/',
}) {
  return (
    <header className="border-b border-[#e8ecf1] bg-white/95 backdrop-blur-md">
      <Container className="flex h-16 items-center justify-between gap-4 lg:h-[72px]">
        <div className="flex items-center gap-4 sm:gap-6">
          <Link to="/" className="inline-flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#005a40] text-white">
              <Leaf className="h-4 w-4" strokeWidth={2.4} />
            </span>
            <span className="leading-tight">
              <span className="block font-display text-xl font-bold tracking-tight text-[#111827]">
                BioFit
              </span>
              <span className="hidden text-[9px] font-semibold tracking-[0.14em] text-[#005a40] uppercase sm:block">
                VitalLife Wellness
              </span>
            </span>
          </Link>
          <Link
            to={backTo}
            className="hidden text-sm font-medium text-[#6b7280] transition-colors hover:text-[#005a40] sm:inline-flex"
          >
            {backLabel}
          </Link>
        </div>

        <div className="flex items-center gap-3">
          {prompt ? (
            <p className="hidden text-sm text-[#6b7280] md:block">{prompt}</p>
          ) : null}
          <Button
            to={actionTo}
            variant="outline"
            size="sm"
            className="rounded-full !border-[#cfd8e3] !px-5 !text-[#005a40] hover:!border-[#005a40] hover:!bg-[#e6f5f0]"
          >
            {actionLabel}
          </Button>
        </div>
      </Container>
    </header>
  )
}
