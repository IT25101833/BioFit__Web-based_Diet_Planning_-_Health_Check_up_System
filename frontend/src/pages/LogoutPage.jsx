import { useEffect, useRef, useState } from 'react'
import { Leaf } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

const LOGOUT_MS = 5000

export default function LogoutPage() {
  const navigate = useNavigate()
  const { logout } = useAuth()
  const [secondsLeft, setSecondsLeft] = useState(5)
  const started = useRef(false)

  useEffect(() => {
    if (started.current) return
    started.current = true

    let cancelled = false

    async function run() {
      try {
        await logout()
      } catch {
        // Continue to login even if API logout fails
      }
    }

    run()

    const tick = setInterval(() => {
      if (!cancelled) setSecondsLeft((s) => Math.max(0, s - 1))
    }, 1000)

    const done = setTimeout(() => {
      if (!cancelled) navigate('/login', { replace: true })
    }, LOGOUT_MS)

    return () => {
      cancelled = true
      clearInterval(tick)
      clearTimeout(done)
    }
    // Run once on mount only
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="flex min-h-svh items-center justify-center bg-[#f4f7f6] px-4">
      <div className="w-full max-w-md rounded-[1.5rem] border border-[#e8ecf1] bg-white px-8 py-10 text-center shadow-[0_16px_40px_rgba(15,23,42,0.06)]">
        <span className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-[#005a40] text-white">
          <Leaf className="h-5 w-5" strokeWidth={2.4} />
        </span>
        <h1 className="font-display text-2xl font-bold tracking-tight text-[#111827]">
          Signing you out
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-[#6b7280]">
          Your BioFit session is ending securely. You’ll be taken to the login page in a
          moment.
        </p>
        <div className="mx-auto mt-6 h-1.5 w-full max-w-[220px] overflow-hidden rounded-full bg-[#eef2f0]">
          <div
            className="h-full rounded-full bg-[#005a40] transition-[width] duration-1000 ease-linear"
            style={{ width: `${((5 - secondsLeft) / 5) * 100}%` }}
          />
        </div>
        <p className="mt-3 text-xs font-semibold tracking-wide text-[#005a40] uppercase">
          {secondsLeft > 0 ? `Redirecting in ${secondsLeft}s` : 'Redirecting…'}
        </p>
      </div>
    </div>
  )
}
