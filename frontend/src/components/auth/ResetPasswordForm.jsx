import { useMemo, useState } from 'react'
import {
  ArrowRight,
  Check,
  Circle,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  ShieldAlert,
  ShieldCheck,
} from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'
import Button from '../ui/Button'
import Input from '../ui/Input'

function passwordChecks(password) {
  return {
    length: password.length >= 8,
    upper: /[A-Z]/.test(password),
    lower: /[a-z]/.test(password),
    number: /\d/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  }
}

function passwordStrength(password) {
  if (!password) return { score: 0, label: '', segments: 0 }
  const met = Object.values(passwordChecks(password)).filter(Boolean).length
  if (met <= 1) return { score: 1, label: 'Weak', segments: 1 }
  if (met === 2) return { score: 2, label: 'Fair', segments: 2 }
  if (met <= 4) return { score: 3, label: 'Good', segments: 3 }
  return { score: 4, label: 'Strong', segments: 4 }
}

function allRequirementsMet(password) {
  return Object.values(passwordChecks(password)).every(Boolean)
}

export default function ResetPasswordForm() {
  const [searchParams] = useSearchParams()
  const initiallyExpired =
    searchParams.get('expired') === '1' ||
    searchParams.get('status') === 'expired' ||
    searchParams.get('status') === 'invalid'

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [view, setView] = useState(initiallyExpired ? 'expired' : 'form')

  const checks = useMemo(() => passwordChecks(password), [password])
  const strength = useMemo(() => passwordStrength(password), [password])
  const passwordsMatch =
    password.length > 0 &&
    confirmPassword.length > 0 &&
    password === confirmPassword
  const canSubmit =
    allRequirementsMet(password) && passwordsMatch && !submitting

  function validate() {
    const next = {}
    if (!password) next.password = 'Please enter a new password.'
    else if (!allRequirementsMet(password)) {
      next.password = 'Your password does not meet the security requirements.'
    }
    if (!confirmPassword) next.confirmPassword = 'Please confirm your password.'
    else if (password !== confirmPassword) {
      next.confirmPassword = 'Passwords do not match.'
    }
    return next
  }

  function handleSubmit(event) {
    event.preventDefault()
    setFormError('')
    const nextErrors = validate()
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) return

    setSubmitting(true)
    window.setTimeout(() => {
      setSubmitting(false)
      setView('success')
    }, 900)
  }

  if (view === 'success') {
    return (
      <div className="w-full max-w-[440px]">
        <div className="rounded-[1.25rem] border border-[#e8ecf1] bg-white p-7 text-center shadow-[0_20px_50px_rgba(15,23,42,0.08)] sm:p-8">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#e6f5f0] text-[#005a40]">
            <Check className="h-7 w-7" strokeWidth={2.4} />
          </span>
          <h2 className="mt-5 font-display text-2xl font-bold tracking-tight text-[#111827]">
            Password Reset Successfully!
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-[#6b7280]">
            Your BioFit password has been updated. You can now sign in using
            your new password.
          </p>
          <Button
            to="/login"
            size="lg"
            className="mt-7 w-full rounded-xl !bg-[#005a40] hover:!bg-[#004833]"
          >
            Continue to Sign In
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    )
  }

  if (view === 'expired') {
    return (
      <div className="w-full max-w-[440px]">
        <div className="rounded-[1.25rem] border border-[#e8ecf1] bg-white p-7 text-center shadow-[0_20px_50px_rgba(15,23,42,0.08)] sm:p-8">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#fff4e5] text-[#b45309]">
            <ShieldAlert className="h-7 w-7" strokeWidth={2.1} />
          </span>
          <h2 className="mt-5 font-display text-2xl font-bold tracking-tight text-[#111827]">
            Reset Link Expired
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-[#6b7280]">
            This password reset link is no longer valid. Request a new link to
            continue.
          </p>
          <Button
            to="/forgot-password"
            size="lg"
            className="mt-7 w-full rounded-xl !bg-[#005a40] hover:!bg-[#004833]"
          >
            Request New Reset Link
            <ArrowRight className="h-4 w-4" />
          </Button>
          <p className="mt-5 text-center text-sm text-[#6b7280]">
            <Link
              to="/login"
              className="font-semibold text-[#005a40] transition-colors hover:text-[#004833]"
            >
              Back to Sign In
            </Link>
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-[440px]">
      <div className="rounded-[1.25rem] border border-[#e8ecf1] bg-white p-7 shadow-[0_20px_50px_rgba(15,23,42,0.08)] sm:p-8">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#e6f5f0] text-[#005a40]">
          <Lock className="h-5 w-5" strokeWidth={2.1} />
        </span>

        <h2 className="mt-4 font-display text-2xl font-bold tracking-tight text-[#111827]">
          Reset Your Password
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-[#6b7280]">
          Enter a new password for your BioFit account.
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
          <div>
            <Input
              id="reset-password"
              label="New Password"
              required
              type={showPassword ? 'text' : 'password'}
              name="password"
              autoComplete="new-password"
              placeholder="Enter your new password"
              leftIcon={Lock}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                if (errors.password) {
                  setErrors((prev) => ({ ...prev, password: '' }))
                }
                if (formError) setFormError('')
              }}
              error={errors.password}
              disabled={submitting}
              rightSlot={
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="rounded-lg p-1.5 text-outline hover:text-on-surface"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              }
            />
            {password ? <PasswordStrengthBar strength={strength} /> : null}
          </div>

          <PasswordRequirements checks={checks} />

          <div>
            <Input
              id="reset-confirm-password"
              label="Confirm New Password"
              required
              type={showConfirm ? 'text' : 'password'}
              name="confirmPassword"
              autoComplete="new-password"
              placeholder="Re-enter your new password"
              leftIcon={Lock}
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value)
                if (errors.confirmPassword) {
                  setErrors((prev) => ({ ...prev, confirmPassword: '' }))
                }
              }}
              error={errors.confirmPassword}
              disabled={submitting}
              footNote={
                !errors.confirmPassword
                  ? 'Must match your new password exactly.'
                  : undefined
              }
              rightSlot={
                <button
                  type="button"
                  onClick={() => setShowConfirm((prev) => !prev)}
                  className="rounded-lg p-1.5 text-outline hover:text-on-surface"
                  aria-label={showConfirm ? 'Hide password' : 'Show password'}
                >
                  {showConfirm ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              }
            />
            {passwordsMatch && !errors.confirmPassword ? (
              <p className="mt-1.5 flex items-center gap-1.5 text-xs font-semibold text-[#00a67e]">
                <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
                Passwords match.
              </p>
            ) : null}
          </div>

          <div className="flex items-start gap-2.5 rounded-xl bg-[#eef2ff] px-3.5 py-3 text-[12px] leading-relaxed text-[#4b5563]">
            <ShieldCheck
              className="mt-0.5 h-4 w-4 shrink-0 text-[#005a40]"
              strokeWidth={2.2}
            />
            <p>
              For your security, choose a password you do not use for other
              accounts.
            </p>
          </div>

          <Button
            type="submit"
            size="lg"
            className="w-full rounded-xl !bg-[#005a40] hover:!bg-[#004833]"
            disabled={!canSubmit}
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Resetting…
              </>
            ) : (
              <>
                Reset Password
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
    </div>
  )
}

function PasswordStrengthBar({ strength }) {
  const colors = {
    Weak: 'bg-error',
    Fair: 'bg-warning',
    Good: 'bg-[#00a67e]',
    Strong: 'bg-[#005a40]',
  }
  const labelColors = {
    Weak: 'text-error',
    Fair: 'text-warning',
    Good: 'text-[#00a67e]',
    Strong: 'text-[#005a40]',
  }

  return (
    <div className="mt-2.5">
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <span className="text-[11px] font-semibold text-[#6b7280]">
          Password Strength
        </span>
        <span
          className={[
            'text-[11px] font-bold tracking-wide uppercase',
            labelColors[strength.label] || 'text-[#6b7280]',
          ].join(' ')}
        >
          {strength.label}
        </span>
      </div>
      <div className="flex gap-1">
        {Array.from({ length: 4 }).map((_, index) => (
          <span
            key={index}
            className={[
              'h-1.5 flex-1 rounded-full',
              index < strength.segments
                ? colors[strength.label] || 'bg-[#005a40]'
                : 'bg-[#e8ecf1]',
            ].join(' ')}
          />
        ))}
      </div>
    </div>
  )
}

function PasswordRequirements({ checks }) {
  const items = [
    { key: 'length', label: 'At least 8 characters' },
    { key: 'upper', label: 'At least one uppercase letter' },
    { key: 'lower', label: 'At least one lowercase letter' },
    { key: 'number', label: 'At least one number' },
    { key: 'special', label: 'At least one special character' },
  ]

  return (
    <div className="rounded-xl border border-[#e8ecf1] bg-[#f4f6fb] px-4 py-3">
      <p className="mb-2.5 text-[10px] font-bold tracking-[0.08em] text-[#6b7280] uppercase">
        Password Requirements
      </p>
      <ul className="grid gap-1.5 sm:grid-cols-2">
        {items.map((item) => {
          const ok = checks[item.key]
          return (
            <li
              key={item.key}
              className={[
                'flex items-center gap-2 text-xs',
                ok ? 'font-medium text-[#005a40]' : 'text-[#9ca3af]',
              ].join(' ')}
            >
              {ok ? (
                <Check className="h-3.5 w-3.5 shrink-0" strokeWidth={2.5} />
              ) : (
                <Circle className="h-3.5 w-3.5 shrink-0" strokeWidth={2} />
              )}
              {item.label}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
