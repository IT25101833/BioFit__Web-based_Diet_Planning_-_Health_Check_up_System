import { useState } from 'react'
import { Eye, EyeOff, Lock, LogIn, Mail } from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { homeForRole, setPendingVerificationEmail } from '../../api/authApi'
import { useAuth } from '../../auth/AuthContext'
import Button from '../ui/Button'
import Checkbox from '../ui/Checkbox'
import Input from '../ui/Input'

function validateEmail(value) {
  if (!value.trim()) return 'Email address is required.'
  const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
  if (!ok) return 'Please enter a valid email address.'
  return ''
}

function validatePassword(value) {
  if (!value) return 'Password is required.'
  if (value.length < 6) return 'Password is too short.'
  return ''
}

export default function LoginForm() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState({ email: '', password: '', form: '' })
  const [successMessage, setSuccessMessage] = useState(
    () => location.state?.message || '',
  )
  const [needsVerification, setNeedsVerification] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()

    const nextErrors = {
      email: validateEmail(email),
      password: validatePassword(password),
      form: '',
    }

    setErrors(nextErrors)
    setNeedsVerification(false)
    setSuccessMessage('')
    if (nextErrors.email || nextErrors.password) return

    setSubmitting(true)
    try {
      const result = await login(email.trim(), password)
      const role = result.user.primaryRole || result.user.roles?.[0]
      navigate(homeForRole(role), { replace: true })
    } catch (err) {
      const code = err.code || ''
      const unverified =
        code === 'EMAIL_NOT_VERIFIED' || /verify your email/i.test(err.message || '')
      setNeedsVerification(unverified)
      if (unverified) {
        setPendingVerificationEmail(email.trim().toLowerCase())
      }
      setErrors((prev) => ({
        ...prev,
        form: err.message || 'Unable to sign in. Please try again.',
      }))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="w-full max-w-[420px]">
      <div className="bf-neo rounded-[1.25rem] p-7 sm:p-8">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="font-display text-2xl font-bold tracking-tight text-[var(--bf-ink)]">
              Welcome Back
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-[var(--bf-muted)]">
              Sign in to manage your health, nutrition, fitness and wellness journey.
            </p>
          </div>
          <span
            className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-emerald-500"
            aria-hidden
          />
        </div>

        <form className="mt-7 space-y-5" onSubmit={handleSubmit} noValidate>
          <Input
            id="login-email"
            label="Email Address"
            required
            type="email"
            name="email"
            autoComplete="email"
            placeholder="client@biofit.demo"
            leftIcon={Mail}
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              if (errors.email || errors.form) {
                setErrors((prev) => ({ ...prev, email: '', form: '' }))
                setNeedsVerification(false)
              }
            }}
            error={errors.email}
            disabled={submitting}
          />

          <Input
            id="login-password"
            label="Password"
            required
            type={showPassword ? 'text' : 'password'}
            name="password"
            autoComplete="current-password"
            placeholder="••••••••••••"
            leftIcon={Lock}
            value={password}
            onChange={(e) => {
              setPassword(e.target.value)
              if (errors.password || errors.form) {
                setErrors((prev) => ({ ...prev, password: '', form: '' }))
                setNeedsVerification(false)
              }
            }}
            error={errors.password}
            disabled={submitting}
            rightSlot={
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="rounded-lg p-1.5 text-[var(--bf-muted)] transition-colors hover:bg-[var(--bf-surface)] hover:text-[var(--bf-ink)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" strokeWidth={2} />
                ) : (
                  <Eye className="h-4 w-4" strokeWidth={2} />
                )}
              </button>
            }
          />

          <div className="flex items-center justify-between gap-3">
            <Checkbox
              id="remember-me"
              label="Remember me"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              disabled={submitting}
            />
            <Link
              to="/forgot-password"
              className="text-sm font-semibold text-[var(--bf-primary)] transition-colors hover:opacity-80"
            >
              Forgot password?
            </Link>
          </div>

          {successMessage ? (
            <div
              className="rounded-xl border border-[#d1fae5] bg-[#ecfdf5] px-3.5 py-3 text-sm text-[#065f46]"
              role="status"
            >
              {successMessage}
            </div>
          ) : null}

          {errors.form ? (
            <div
              className="rounded-xl border border-error/20 bg-error-container px-3.5 py-3 text-sm text-error"
              role="alert"
            >
              <p>{errors.form}</p>
              {needsVerification ? (
                <Link
                  to="/register/verify"
                  className="mt-2 inline-block font-semibold text-[#005a40] hover:underline"
                >
                  Complete email verification
                </Link>
              ) : null}
            </div>
          ) : null}

          <Button
            type="submit"
            size="lg"
            className="w-full rounded-xl !bg-[#005a40] hover:!bg-[#004833]"
            disabled={submitting}
          >
            {submitting ? 'Signing In…' : 'Sign In'}
            <LogIn className="h-4 w-4" strokeWidth={2.2} />
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-[var(--bf-muted)]">
          Don&apos;t have a BioFit account?{' '}
          <Link
            to="/register"
            className="font-semibold text-[var(--bf-primary)] transition-colors hover:opacity-80"
          >
            Create Account
          </Link>
        </p>

        <div className="bf-neo-inset mt-6 rounded-xl px-3.5 py-3.5">
          <p className="text-[12px] leading-relaxed text-[var(--bf-muted)]">
            <span className="font-semibold text-[var(--bf-ink)]">Demo login</span>{' '}
            (password is case-sensitive — capital{' '}
            <span className="font-mono text-[var(--bf-ink)]">D</span> and{' '}
            <span className="font-mono text-[var(--bf-ink)]">!</span> at the end):
          </p>
          <button
            type="button"
            className="mt-2 w-full rounded-lg bg-[var(--bf-surface)] px-3 py-2 text-left transition-colors hover:bg-[var(--bf-surface-2,rgba(0,0,0,0.04))] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            onClick={() => {
              setEmail('client@biofit.demo')
              setPassword('Demo123!')
              setErrors({ email: '', password: '', form: '' })
              setNeedsVerification(false)
            }}
          >
            <p className="font-mono text-[12px] text-[var(--bf-ink)]">
              client@biofit.demo
            </p>
            <p className="font-mono text-[12px] text-[var(--bf-ink)]">Demo123!</p>
            <p className="mt-1 text-[11px] text-[var(--bf-muted)]">
              Click to fill, then Sign In
            </p>
          </button>
        </div>
      </div>
    </div>
  )
}
