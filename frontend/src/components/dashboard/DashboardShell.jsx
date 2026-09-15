import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import ThemeToggle from '../ui/ThemeToggle'
import DashboardSidebar from './DashboardSidebar'

export default function DashboardShell({ children, title = 'Dashboard' }) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="bf-shell min-h-svh">
      <DashboardSidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

      <div className="flex min-h-svh min-w-0 flex-col lg:pl-[260px]">
        <header className="bf-topbar sticky top-0 z-30 lg:hidden">
          <div className="flex h-14 items-center justify-between px-4">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-[var(--bf-muted)] hover:bg-[var(--bf-surface)]"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" strokeWidth={2.1} />
            </button>
            <p className="font-display text-sm font-bold text-[var(--bf-ink)]">{title}</p>
            <ThemeToggle />
          </div>
        </header>

        <div className="hidden items-center justify-end gap-2 px-8 pt-4 lg:flex">
          <ThemeToggle />
        </div>

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
          <div className="mx-auto w-full max-w-[1120px]">{children}</div>
        </main>
      </div>
    </div>
  )
}
