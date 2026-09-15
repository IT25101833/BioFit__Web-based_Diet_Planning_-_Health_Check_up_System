import { Navigate, useLocation } from 'react-router-dom'
import LoadingSkeleton from '../components/ui/LoadingSkeleton'
import { useAuth } from './AuthContext'

export function ProtectedRoute({ children, roles }) {
  const { user, loading, role } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-svh bg-[var(--bf-bg)] p-8">
        <LoadingSkeleton rows={4} />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  if (roles?.length) {
    const allowed = user.roles?.some((r) => roles.includes(r)) || roles.includes(role)
    if (!allowed) {
      return <Navigate to="/forbidden" replace />
    }
  }

  return children
}
