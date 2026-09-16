import { useEffect, useState } from 'react'
import { CalendarCheck, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../auth/AuthContext'
import { USE_MOCK } from '../../api/client'
import {
  findProfessionalByRoleKey,
  listPendingBookingPopups,
  markBookingNotificationRead,
} from './bookingStore'

/**
 * Shows a popup when someone books an appointment with the signed-in professional.
 */
export default function BookingAlertListener() {
  const { user, role, isAuthenticated } = useAuth()
  const [alert, setAlert] = useState(null)

  useEffect(() => {
    if (!isAuthenticated || !USE_MOCK) return undefined

    function refresh() {
      const professional = findProfessionalByRoleKey(role)
      const userId = professional?.userId || user?.id
      const pending = listPendingBookingPopups(userId)
      if (pending[0]) setAlert(pending[0])
    }

    refresh()
    const onUpdate = () => refresh()
    window.addEventListener('biofit:booking-updated', onUpdate)
    const timer = window.setInterval(refresh, 4000)
    return () => {
      window.removeEventListener('biofit:booking-updated', onUpdate)
      window.clearInterval(timer)
    }
  }, [isAuthenticated, role, user?.id])

  if (!alert) return null

  async function dismiss() {
    await markBookingNotificationRead(alert.id)
    setAlert(null)
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center bg-black/35 p-4 sm:items-center">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="booking-alert-title"
        className="w-full max-w-md rounded-3xl border border-[var(--bf-border)] bg-[var(--bf-surface-raised)] p-5 shadow-[var(--bf-shadow-out)]"
      >
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--bf-primary-soft)] text-[var(--bf-ink)]">
              <CalendarCheck className="h-5 w-5" />
            </span>
            <div>
              <p
                id="booking-alert-title"
                className="font-display text-base font-bold text-[var(--bf-ink)]"
              >
                {alert.title}
              </p>
              <p className="text-xs text-[var(--bf-muted)]">New booking notification</p>
            </div>
          </div>
          <button
            type="button"
            onClick={dismiss}
            className="rounded-xl p-2 text-[var(--bf-muted)] hover:bg-[var(--bf-surface)]"
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <p className="mb-5 text-sm leading-relaxed text-[var(--bf-ink)]">{alert.body}</p>
        <div className="flex flex-wrap justify-end gap-2">
          <button
            type="button"
            onClick={dismiss}
            className="rounded-xl border border-[var(--bf-border)] px-4 py-2 text-sm font-semibold text-[var(--bf-muted)]"
          >
            Dismiss
          </button>
          <Link
            to={
              role === 'WELLNESS_CENTRE_MANAGER'
                ? '/manager/notifications'
                : role === 'MEDICAL_ADVISOR'
                  ? '/medical/notifications'
                  : role === 'NUTRITION_CONSULTANT'
                    ? '/nutrition/notifications'
                    : role === 'FITNESS_COACH'
                      ? '/coach/notifications'
                      : role === 'CUSTOMER_EXPERIENCE_OFFICER'
                        ? '/support/notifications'
                        : '/client/notifications'
            }
            onClick={dismiss}
            className="rounded-xl bg-[var(--bf-primary)] px-4 py-2 text-sm font-semibold text-white"
          >
            View notifications
          </Link>
        </div>
      </div>
    </div>
  )
}
