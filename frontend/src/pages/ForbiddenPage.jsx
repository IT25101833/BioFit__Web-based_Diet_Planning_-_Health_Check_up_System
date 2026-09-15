import { Link } from 'react-router-dom'
import Button from '../components/ui/Button'

export default function ForbiddenPage() {
  return (
    <div className="flex min-h-svh items-center justify-center bg-[var(--bf-bg)] px-4">
      <div className="bf-neo max-w-md rounded-[1.5rem] p-8 text-center">
        <p className="text-sm font-semibold tracking-wide text-[var(--bf-primary)] uppercase">403</p>
        <h1 className="mt-2 font-display text-2xl font-bold text-[var(--bf-ink)]">Access denied</h1>
        <p className="mt-3 text-sm text-[var(--bf-muted)]">
          Your account does not have permission to view this area of BioFit.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Button to="/" variant="outline">
            Home
          </Button>
          <Link to="/login" className="text-sm font-semibold text-[var(--bf-primary)]">
            Sign in with another account
          </Link>
        </div>
      </div>
    </div>
  )
}
