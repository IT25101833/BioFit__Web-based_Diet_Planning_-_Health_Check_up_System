import { useEffect, useMemo, useRef, useState } from 'react'
import { ArrowLeft, Loader2, Mail, RefreshCw, ShieldCheck } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import {
  getPendingVerificationEmail,
  setPendingVerificationEmail,
} from '../../api/authApi'
import { USE_MOCK } from '../../api/client'
import { useAuth } from '../../auth/AuthContext'
import Button from '../ui/Button'
import Input from '../ui/Input'

const RESEND_COOLDOWN_SECONDS = 60
const DEV_OTP_KEY = 'biofit-dev-otp'

function readStoredDevOtp() {
  try {
    return sessionStorage.getItem(DEV_OTP_KEY) || ''
  } catch {
    return ''
  }
}

function storeDevOtp(value) {
  try {
    if (value) sessionStorage.setItem(DEV_OTP_KEY, value)
    else sessionStorage.removeItem(DEV_OTP_KEY)
  } catch {
    // ignore
  }
}

export default function VerifyEmailForm({ initialEmail = '', initialDevOtp = '' }) {
  const navigate = useNavigate()
  const { verifyEmail, resendVerification } = useAuth()

  const [email, setEmail] = useState(
    () => initialEmail || getPendingVerificationEmail() || '',
  )
  const [otp, setOtp] = useState('')
  const [devOtp, setDevOtp] = useState(
    () => initialDevOtp || readStoredDevOtp() || '',
  )
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [resending, setResending] = useState(false)
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN_SECONDS)
  const cooldownStarted = useRef(false)

  useEffect(() => {
    if (email) setPendingVerificationEmail(email)
  }, [email])

  useEffect(() => {
    if (initialDevOtp) {
      setDevOtp(initialDevOtp)
      storeDevOtp(initialDevOtp)
    }
  }, [initialDevOtp])

  useEffect(() => {
    storeDevOtp(devOtp)
  }, [devOtp])

  useEffect(() => {
    if (!cooldownStarted.current) {
      cooldownStarted.current = true
      setCooldown(RESEND_COOLDOWN_SECONDS)
    }
  }, [])

  useEffect(() => {
    if (cooldown <= 0) return undefined
    const timer = window.setInterval(() => {
      setCooldown((prev) => (prev <= 1 ? 0 : prev - 1))
    }, 1000)
    return () => window.clearInterval(timer)
  }, [cooldown])

  const maskedEmail = useMemo(() => {
    const value = email.trim().toLowerCase()
    if (!value.includes('@')) return value || 'your email'
    const [local, domain] = value.split('@')
    if (local.length <= 2) return `***@${domain}`
    return `${local[0]}***${local[local.length - 1]}@${domain}`
  }, [email])

  async function handleVerify(event) {
    event.preventDefault()
    setError('')
    setInfo('')

    const trimmedEmail = email.trim().toLowerCase()
    const code = otp.replace(/\D/g, '')

    if (!trimmedEmail) {
      setError('Email address is required.')
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setError('Please enter a valid email address.')
      return
    }
    if (!/^\d{6}$/.test(code)) {
      setError('Please enter the 6-digit verification code.')
      return
    }

    setSubmitting(true)
    try {
      await verifyEmail(trimmedEmail, code)
      storeDevOtp('')
      navigate('/login', {
        replace: true,
        state: {
          verified: true,
          message: 'Email verified successfully. You can now sign in.',
        },
      })
    } catch (err) {
      setError(err.message || 'Unable to verify your code. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleResend() {
    setError('')
    setInfo('')
    const trimmedEmail = email.trim().toLowerCase()
    if (!trimmedEmail) {
      setError('Email address is required to resend a code.')
      return
    }

    setResending(true)
    try {
      const result = await resendVerification(trimmedEmail)
      setOtp('')
      setCooldown(RESEND_COOLDOWN_SECONDS)
      if (result?.devOtp) {
        setDevOtp(result.devOtp)
        setInfo(
          result.message ||
            'Email could not be sent. Development mode: use the code shown on screen.',
        )
      } else {
        setDevOtp('')
        setInfo(result?.message || 'We sent a verification code to your email.')
      }
    } catch (err) {
      setError(err.message || 'Unable to resend the verification code.')
    } finally {
      setResending(false)
    }
  }

  if (!email && !initialEmail) {
    return (
      <div className="w-full rounded-2xl border border-[#e8ecf1] bg-white p-8 text-center shadow-[0_16px_40px_rgba(15,23,42,0.06)] sm:p-10">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#e6f5f0] text-[#005a40]">
          <Mail className="h-8 w-8" strokeWidth={2.2} />
        </span>
        <h2 className="mt-5 font-display text-2xl font-bold text-[#111827]">
          Verify Your Email
        </h2>
        <p className="mx-auto mt-3 w-full max-w-[28rem] text-sm leading-relaxed text-[#6b7280]">
          We could not find a pending registration for this session. Please create
          a new account first, or sign in if you have already verified your email.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button
            type="button"
            size="lg"
            className="rounded-xl !bg-[#005a40] hover:!bg-[#004833]"
            onClick={() => navigate('/register', { replace: true })}
          >
            Create Account
          </Button>
          <Button
            type="button"
            size="lg"
            className="rounded-xl !bg-[#e8eaf6] !text-[#1a1c29] hover:!bg-[#dce0f2] shadow-none"
            onClick={() => navigate('/login', { replace: true })}
          >
            Sign In
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full rounded-2xl border border-[#e8ecf1] bg-white p-6 shadow-[0_16px_40px_rgba(15,23,42,0.06)] sm:p-8">
      <div className="mb-6 w-full text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#e6f5f0] text-[#005a40]">
          <ShieldCheck className="h-7 w-7" strokeWidth={2.2} />
        </span>
        <h2 className="mt-4 font-display text-xl font-bold text-[#111827] sm:text-2xl">
          Verify Your Email
        </h2>
        <p className="mx-auto mt-2 w-full max-w-[28rem] text-sm leading-relaxed text-[#6b7280]">
          {devOtp ? (
            <>
              Email delivery failed in development mode. Use the verification code shown
              below for{' '}
              <span className="font-semibold text-[#111827]">{maskedEmail}</span>.
            </>
          ) : (
            <>
              We sent a verification code to{' '}
              <span className="font-semibold text-[#111827]">{maskedEmail}</span>.
              Please enter that code below to activate your BioFit account.
            </>
          )}
        </p>
        {USE_MOCK ? (
          <p className="mx-auto mt-3 w-full max-w-[28rem] rounded-xl border border-[#fde68a] bg-[#fffbeb] px-3 py-2 text-xs leading-relaxed text-[#92400e]">
            Mock API mode cannot deliver a real email. Set{' '}
            <span className="font-semibold">VITE_USE_MOCK=false</span>, configure
            SMTP in <span className="font-semibold">backend/.env</span>, then
            restart the backend to receive your verification email.
          </p>
        ) : null}
      </div>

      <form
        className="mx-auto w-full max-w-[28rem] space-y-5"
        onSubmit={handleVerify}
        noValidate
      >
        <Input
          id="verify-email"
          label="Email Address"
          required
          type="email"
          leftIcon={Mail}
          value={email}
          onChange={(e) => {
            setEmail(e.target.value)
            setError('')
          }}
          disabled={submitting}
          footNote="Please use the same email address you used during registration."
        />

        {devOtp ? (
          <div
            className="rounded-xl border border-[#fde68a] bg-[#fffbeb] px-4 py-3 text-sm text-[#92400e]"
            role="status"
          >
            <p>
              Development mode: email could not be sent. Your verification code is:{' '}
              <span className="font-mono font-bold tracking-widest text-[#78350f]">
                {devOtp}
              </span>
            </p>
            <button
              type="button"
              className="mt-2 text-sm font-semibold text-[#005a40] hover:underline"
              onClick={() => {
                setOtp(String(devOtp).replace(/\D/g, '').slice(0, 6))
                setError('')
                setInfo('')
              }}
            >
              Use this code
            </button>
          </div>
        ) : null}

        <Input
          id="verify-otp"
          label="Verification Code"
          required
          inputMode="numeric"
          autoComplete="one-time-code"
          placeholder="Enter 6-digit code"
          value={otp}
          maxLength={6}
          onChange={(e) => {
            const next = e.target.value.replace(/\D/g, '').slice(0, 6)
            setOtp(next)
            setError('')
            setInfo('')
          }}
          disabled={submitting}
          footNote="This verification code will expire in 5 minutes."
        />

        {error ? (
          <div
            className="rounded-xl border border-error/20 bg-error-container px-4 py-3 text-sm text-error"
            role="alert"
          >
            {error}
          </div>
        ) : null}

        {info ? (
          <div
            className="rounded-xl border border-[#d1fae5] bg-[#ecfdf5] px-4 py-3 text-sm text-[#065f46]"
            role="status"
          >
            {info}
          </div>
        ) : null}

        <Button
          type="submit"
          size="lg"
          className="w-full rounded-xl !bg-[#005a40] hover:!bg-[#004833]"
          disabled={submitting}
        >
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Verifying…
            </>
          ) : (
            'Verify'
          )}
        </Button>

        <div className="flex flex-col items-center gap-3 border-t border-[#eef0f4] pt-5">
          <button
            type="button"
            onClick={handleResend}
            disabled={resending || cooldown > 0 || submitting}
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#005a40] transition-colors hover:underline disabled:cursor-not-allowed disabled:text-[#9ca3af] disabled:no-underline"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${resending ? 'animate-spin' : ''}`} />
            {cooldown > 0
              ? `You can resend the code in ${cooldown} seconds.`
              : resending
                ? 'Sending a new code…'
                : 'Resend verification code'}
          </button>

          <Link
            to="/register/contact"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-[#6b7280] hover:text-[#005a40]"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Go back to change your email
          </Link>
        </div>
      </form>
    </div>
  )
}
