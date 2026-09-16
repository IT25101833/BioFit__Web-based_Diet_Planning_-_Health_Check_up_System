import { Link } from 'react-router-dom'
import Button from '../components/ui/Button'

export default function ForbiddenPage() {
  return (
    <div className="grid min-h-svh w-full place-items-center bg-[var(--bf-bg)] px-4 py-8">
      <div className="bf-neo w-[min(100%,28rem)] rounded-[1.5rem] p-8 text-center">
        <p className="text-sm font-semibold tracking-wide text-[var(--bf-primary)] uppercase">403</p>
        <h1 className="mt-2 font-display text-2xl font-bold text-[var(--bf-ink)]">Access denied</h1>
        <p className="mt-3 text-sm leading-relaxed text-[var(--bf-muted)]">
          Your account does not have permission to view this area of BioFit.
        </p>
        <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button to="/" variant="outline">
            Home
          </Button>
          <Link
            to="/login"
            className="text-sm font-semibold text-[var(--bf-primary)] hover:underline"
          >
            Sign in with another account
          </Link>
        </div>
      </div>
    </div>
  )
}
