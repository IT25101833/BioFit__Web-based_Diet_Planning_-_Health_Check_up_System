import { useState } from 'react'
import { X } from 'lucide-react'
import ManagerSidebar from './ManagerSidebar'
import PortalTopbar from './PortalTopbar'

export default function ManagerLayout({ children, title = 'Dashboard', breadcrumb }) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="bf-shell min-h-svh">
      <ManagerSidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

      <div className="flex min-h-svh min-w-0 flex-col lg:pl-[260px]">
        <PortalTopbar
          title={title}
          breadcrumb={breadcrumb}
          notificationsTo="/manager/notifications"
          profileTo="/manager/profile"
          fallbackName="Sarah Williams"
          fallbackRole="Wellness Centre Manager"
          onOpenMenu={() => setMobileOpen(true)}
        />

        {mobileOpen ? (
          <button
            type="button"
            className="fixed inset-0 z-40 bg-[#111827]/35 lg:hidden"
            aria-label="Close menu"
            onClick={() => setMobileOpen(false)}
          />
        ) : null}

        {mobileOpen ? (
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="fixed top-4 right-4 z-50 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--bf-surface-raised)] text-[var(--bf-ink)] shadow-md lg:hidden"
            aria-label="Close menu"
          >
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
