import { useState } from 'react'
import {
  ArrowRight,
  Check,
  HelpCircle,
  KeyRound,
  Loader2,
  Mail,
  ShieldCheck,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import Button from '../ui/Button'
import Input from '../ui/Input'

function validateEmail(value) {
  if (!value.trim()) return 'Email address is required.'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) {
    return 'Enter a valid email address.'
  }
  return ''
}

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [sent, setSent] = useState(false)
  const [resending, setResending] = useState(false)

  function handleSubmit(event) {
    event.preventDefault()
    setFormError('')
    const nextError = validateEmail(email)
    setError(nextError)
    if (nextError) return

    setSubmitting(true)
    window.setTimeout(() => {
      setSubmitting(false)
      setSent(true)
    }, 800)
  }

  function handleResend() {
    setResending(true)
    window.setTimeout(() => {
      setResending(false)
    }, 800)
  }

  if (sent) {
    return (
      <div className="w-full max-w-[440px]">
        <div className="rounded-[1.25rem] border border-[#e8ecf1] bg-white p-7 text-center shadow-[0_20px_50px_rgba(15,23,42,0.08)] sm:p-8">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#e6f5f0] text-[#005a40]">
            <Check className="h-7 w-7" strokeWidth={2.4} />
          </span>
          <h2 className="mt-5 font-display text-2xl font-bold tracking-tight text-[#111827]">
            Check Your Email
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-[#6b7280]">
            If an account exists for the email address you entered, password
            reset instructions have been sent.
          </p>
          <p className="mt-2 text-sm leading-relaxed text-[#6b7280]">
            Please check your inbox and follow the link to create a new
            password.
          </p>

          <Button
            to="/login"
            size="lg"
            className="mt-7 w-full rounded-xl !bg-[#005a40] hover:!bg-[#004833]"
          >
            Back to Sign In
          </Button>

          <button
            type="button"
            onClick={handleResend}
            disabled={resending}
            className="mt-4 text-sm font-semibold text-[#005a40] hover:underline disabled:opacity-60"
          >
            {resending ? 'Sending…' : 'Resend Reset Email'}
          </button>

          <p className="mt-4 text-[12px] leading-relaxed text-[#9ca3af]">
            Didn&apos;t receive the email? Check your spam or junk folder
            before requesting another one.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-[440px]">
      <div className="rounded-[1.25rem] border border-[#e8ecf1] bg-white p-7 shadow-[0_20px_50px_rgba(15,23,42,0.08)] sm:p-8">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#e6f5f0] text-[#005a40]">
          <KeyRound className="h-5 w-5" strokeWidth={2.1} />
        </span>

        <h2 className="mt-4 font-display text-2xl font-bold tracking-tight text-[#111827]">
          Forgot Your Password?
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-[#6b7280]">
          No worries. Enter the email address associated with your BioFit
          account and we&apos;ll send you instructions to reset your password.
        </p>

        {formError ? (
          <div
            className="mt-5 rounded-xl border border-error/20 bg-error-container px-3.5 py-3 text-sm text-error"
            role="alert"
          >
            {formError}
          </div>
        ) : null}

        <form className="mt-6 space-y-5" onSubmit={handleSubmit} noValidate>
          <Input
            id="forgot-email"
            label="Email Address"
            required
            labelHint="Associated with your chart"
            type="email"
            name="email"
            autoComplete="email"
            placeholder="Enter your registered email address"
            leftIcon={Mail}
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              if (error) setError('')
              if (formError) setFormError('')
            }}
            error={error}
            disabled={submitting}
            footNote={
              !error
                ? 'We will dispatch an encrypted one-time recovery token valid for 15 minutes.'
                : undefined
            }
          />

          <div className="flex items-start gap-2.5 rounded-xl bg-[#eef2ff] px-3.5 py-3 text-[12px] leading-relaxed text-[#4b5563]">
            <ShieldCheck
              className="mt-0.5 h-4 w-4 shrink-0 text-[#005a40]"
              strokeWidth={2.2}
            />
            <p>
              For your safety, resetting credentials ends all active BioFit
              sessions across devices, wearables and connected sensors.
            </p>
          </div>

          <Button
            type="submit"
            size="lg"
            className="w-full rounded-xl !bg-[#005a40] hover:!bg-[#004833]"
            disabled={submitting}
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Sending…
              </>
            ) : (
              <>
                Send Reset Link
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-[#6b7280]">
          Remember your password?{' '}
          <Link
            to="/login"
            className="font-semibold text-[#005a40] transition-colors hover:text-[#004833]"
          >
            Back to Sign In
          </Link>
        </p>
      </div>

      <p className="mt-5 flex items-center justify-center gap-1.5 text-center text-[12px] text-[#6b7280]">
        <HelpCircle className="h-3.5 w-3.5" strokeWidth={2} />
        Having trouble?{' '}
        <Link
          to="/#contact"
          className="font-semibold text-[#005a40] hover:underline"
        >
          Speak with Support
        </Link>
      </p>
    </div>
  )
}
