import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import MedicalSidebar from './MedicalSidebar'
import PortalTopbar from './PortalTopbar'
import { fetchMedicalNotifications } from '../../features/medical/notifications/data/medicalNotificationData'

export default function MedicalLayout({ children, title = 'Dashboard', breadcrumb }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    let cancelled = false

    async function refreshUnread() {
      try {
        const items = await fetchMedicalNotifications()
        if (cancelled) return
        const list = Array.isArray(items) ? items : []
        setUnreadCount(list.filter((n) => !n.read).length)
      } catch {
        if (!cancelled) setUnreadCount(0)
      }
    }

    refreshUnread()
    const id = window.setInterval(refreshUnread, 60_000)
    return () => {
      cancelled = true
      window.clearInterval(id)
    }
  }, [])

  return (
    <div className="bf-shell min-h-svh">
      <MedicalSidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
      <div className="flex min-h-svh min-w-0 flex-col lg:pl-[260px]">
        <PortalTopbar
          title={title}
          breadcrumb={breadcrumb}
          notificationsTo="/medical/notifications"
          profileTo="/medical/profile"
          fallbackName="Elena Costa"
          fallbackRole="Medical Advisor"
          onOpenMenu={() => setMobileOpen(true)}
          unreadCount={unreadCount}
        />
        {mobileOpen ? (
          <button type="button" className="fixed inset-0 z-40 bg-[#111827]/35 lg:hidden" aria-label="Close menu" onClick={() => setMobileOpen(false)} />
        ) : null}
        {mobileOpen ? (
          <button type="button" onClick={() => setMobileOpen(false)} className="fixed top-4 right-4 z-50 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--bf-surface-raised)] shadow-md lg:hidden" aria-label="Close menu">
            <X className="h-5 w-5" />
          </button>
        ) : null}
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <div className="mx-auto w-full max-w-[1280px]">{children}</div>
        </main>
      </div>
    </div>
  )
}
