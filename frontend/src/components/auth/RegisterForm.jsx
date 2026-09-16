import { useEffect, useMemo, useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Circle,
  Eye,
  EyeOff,
  Info,
  Loader2,
  Lock,
  Mail,
  Pencil,
  Phone,
  ShieldCheck,
  UserRound,
} from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { homeForRole } from '../../api/authApi'
import { useAuth } from '../../auth/AuthContext'
import Button from '../ui/Button'
import Checkbox from '../ui/Checkbox'
import Input from '../ui/Input'
import Select from '../ui/Select'
import Stepper from './Stepper'

const STORAGE_KEY = 'biofit-register-form'

const STEP_PATHS = {
  1: '/register',
  2: '/register/contact',
  3: '/register/review',
}

function pathToStep(pathname) {
  if (pathname.includes('/contact')) return 2
  if (pathname.includes('/review')) return 3
  return 1
}

const genderOptions = [
  { value: 'female', label: 'Female' },
  { value: 'male', label: 'Male' },
  { value: 'non-binary', label: 'Non-binary' },
  { value: 'prefer-not', label: 'Prefer not to say' },
  { value: 'other', label: 'Other' },
]

const TAKEN_EMAILS = new Set(['taken@biofit.com', 'existing@vitallife.com'])

const initialForm = {
  firstName: '',
  lastName: '',
  dateOfBirth: '',
  gender: '',
  email: '',
  contactNumber: '',
  password: '',
  confirmPassword: '',
  agreeTerms: false,
  wellnessUpdates: false,
}

function loadForm() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return initialForm
    return { ...initialForm, ...JSON.parse(raw) }
  } catch {
    return initialForm
  }
}

function saveForm(form) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(form))
  } catch {
    // ignore
  }
}

function formatDateDisplay(value) {
  if (!value) return '—'
  const date = new Date(`${value}T00:00:00`)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function genderLabel(value) {
  return genderOptions.find((option) => option.value === value)?.label || '—'
}

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
  const checks = passwordChecks(password)
  const met = Object.values(checks).filter(Boolean).length
  if (met <= 2) return { score: 1, label: 'Weak', segments: 1 }
  if (met <= 4) return { score: 2, label: 'Fair', segments: 2 }
  return { score: 3, label: 'Strong', segments: 4 }
}

function isValidSriLankaPhone(value) {
  const digits = value.replace(/[^\d]/g, '')
  if (/^0\d{9}$/.test(digits)) return true
  if (/^94\d{9}$/.test(digits)) return true
  if (/^\d{9,10}$/.test(digits)) return true
  return false
}

function validateStep1(form) {
  const errors = {}
  if (!form.firstName.trim()) errors.firstName = 'First name is required.'
  if (!form.lastName.trim()) errors.lastName = 'Last name is required.'
  if (!form.dateOfBirth) errors.dateOfBirth = 'Date of birth is required.'
  else {
    const dob = new Date(`${form.dateOfBirth}T00:00:00`)
    if (dob > new Date()) errors.dateOfBirth = 'Date of birth cannot be in the future.'
  }
  if (!form.gender) errors.gender = 'Please select a gender option.'
  return errors
}

function validateStep2(form) {
  const errors = {}
  const email = form.email.trim().toLowerCase()

  if (!form.email.trim()) errors.email = 'Email address is required.'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = 'Please enter a valid email address.'
  } else if (TAKEN_EMAILS.has(email)) {
    errors.email = 'taken'
  }

  if (!form.contactNumber.trim()) {
    errors.contactNumber = 'Contact number is required.'
  } else if (!isValidSriLankaPhone(form.contactNumber.trim())) {
    errors.contactNumber = 'Please enter a valid contact number.'
  }

  const checks = passwordChecks(form.password)
  if (!form.password) errors.password = 'Password is required.'
  else if (!Object.values(checks).every(Boolean)) {
    errors.password = 'Password does not meet the requirements.'
  }

  if (!form.confirmPassword) {
    errors.confirmPassword = 'Please confirm your password.'
  } else if (form.password !== form.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match.'
  }

  return errors
}

function validateStep3(form) {
  const errors = {}
  if (!form.firstName.trim() || !form.lastName.trim() || !form.dateOfBirth || !form.gender) {
    errors.form = 'Please complete your personal details before creating your account.'
  }
  if (!form.email.trim() || !form.contactNumber.trim() || !form.password) {
    errors.form =
      errors.form ||
      'Please complete your contact and account details before creating your account.'
  }
  if (!form.agreeTerms) {
    errors.agreeTerms =
      'Please accept the Terms & Conditions and Privacy Policy to create your account.'
  }
  return errors
}

export default function RegisterForm() {
  const navigate = useNavigate()
  const location = useLocation()
  const { register } = useAuth()
  const step = pathToStep(location.pathname)

  const [form, setForm] = useState(loadForm)
  const [errors, setErrors] = useState({})
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [duplicateEmail, setDuplicateEmail] = useState(false)

  useEffect(() => {
    saveForm(form)
  }, [form])

  const checks = useMemo(() => passwordChecks(form.password), [form.password])
  const strength = useMemo(
    () => passwordStrength(form.password),
    [form.password],
  )
  const passwordsMatch =
    form.password.length > 0 &&
    form.confirmPassword.length > 0 &&
    form.password === form.confirmPassword

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
    setSubmitError('')
    setDuplicateEmail(false)
    if (errors[field] || errors.form) {
      setErrors((prev) => {
        const next = { ...prev }
        delete next[field]
        delete next.form
        return next
      })
    }
  }

  function goToStep(nextStep) {
    setErrors({})
    navigate(STEP_PATHS[nextStep])
  }

  function goNext() {
    const nextErrors =
      step === 1 ? validateStep1(form) : step === 2 ? validateStep2(form) : {}
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) return
    goToStep(Math.min(step + 1, 3))
  }

  function goBack() {
    goToStep(Math.max(step - 1, 1))
  }

  async function handleCreate(event) {
    event.preventDefault()
    setSubmitError('')
    setDuplicateEmail(false)

    const nextErrors = validateStep3(form)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) return

    setSubmitting(true)
    try {
      const email = form.email.trim().toLowerCase()
      if (TAKEN_EMAILS.has(email)) {
        setDuplicateEmail(true)
        setSubmitError('An account already exists with this email address.')
        return
      }

      const result = await register({
        email,
        password: form.password,
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        contactNumber: form.contactNumber.trim(),
      })

      sessionStorage.removeItem(STORAGE_KEY)
      setSuccess(true)
      window.setTimeout(() => {
        navigate(homeForRole(result.user.primaryRole || result.user.roles?.[0]), {
          replace: true,
        })
      }, 1200)
    } catch (err) {
      const message = err.message || 'Unable to create your account. Please try again.'
      if (/already exists|EMAIL_EXISTS/i.test(message)) {
        setDuplicateEmail(true)
      }
      setSubmitError(message)
    } finally {
      setSubmitting(false)
    }
  }

  if (success) {
    return (
      <div className="rounded-2xl border border-[#e8ecf1] bg-white p-8 text-center shadow-[0_16px_40px_rgba(15,23,42,0.06)] sm:p-10">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#e6f5f0] text-[#005a40]">
          <Check className="h-8 w-8" strokeWidth={2.4} />
        </span>
        <h2 className="mt-5 font-display text-2xl font-bold text-[#111827]">
          Welcome to BioFit!
        </h2>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-[#6b7280]">
          Your account is ready. No email verification is required in this demo —
          taking you to your dashboard now.
        </p>
        <Button
          type="button"
          size="lg"
          className="mt-8 rounded-xl !bg-[#005a40] hover:!bg-[#004833]"
          onClick={() => navigate('/dashboard', { replace: true })}
        >
          Continue to Dashboard
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-[#e8ecf1] bg-white p-6 shadow-[0_16px_40px_rgba(15,23,42,0.06)] sm:p-8">
      <Stepper currentStep={step} />

      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-bold text-[#111827]">
            {step === 1 && 'Personal Information'}
            {step === 2 && 'Contact & Account Information'}
            {step === 3 && 'Review & Create Your Account'}
          </h2>
          <p
            className={[
              'mt-1 text-sm text-[#6b7280]',
              step === 1 || step === 2 || step === 3
                ? 'whitespace-nowrap'
                : 'max-w-xl',
            ].join(' ')}
          >
            {step === 1 &&
              'Tell us a little about yourself to establish your clinical profile baseline.'}
            {step === 2 &&
              'Enter your contact details and create secure credentials for your BioFit account.'}
            {step === 3 &&
              'Please review your information before creating your BioFit account.'}
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#e6f5f0] px-3 py-1 text-[11px] font-bold text-[#005a40]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#00a67e]" />
          Step {step} of 3
        </span>
      </div>

      {step === 1 ? (
        <form
          className="space-y-5"
          onSubmit={(e) => {
            e.preventDefault()
            goNext()
          }}
          noValidate
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              id="reg-first-name"
              label="First Name"
              required
              placeholder="Enter your first name"
              value={form.firstName}
              onChange={(e) => updateField('firstName', e.target.value)}
              error={errors.firstName}
            />
            <Input
              id="reg-last-name"
              label="Last Name"
              required
              placeholder="Enter your last name"
              value={form.lastName}
              onChange={(e) => updateField('lastName', e.target.value)}
              error={errors.lastName}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              id="reg-dob"
              label="Date of Birth"
              required
              type="date"
              value={form.dateOfBirth}
              onChange={(e) => updateField('dateOfBirth', e.target.value)}
              error={errors.dateOfBirth}
              footNote="Age is automatically computed for your biometric baseline."
            />
            <Select
              id="reg-gender"
              label="Gender Assignment / Identity"
              required
              options={genderOptions}
              placeholder="Select gender"
              value={form.gender}
              onChange={(e) => updateField('gender', e.target.value)}
              error={errors.gender}
              footNote="Used for calibrating caloric & hormonal telemetry standards."
            />
          </div>

          <div className="flex flex-col-reverse items-stretch justify-between gap-3 border-t border-[#eef0f4] pt-5 sm:flex-row sm:items-center">
            <p className="text-xs text-[#9ca3af]">
              * All required fields are marked with *
            </p>
            <Button
              type="submit"
              size="lg"
              className="rounded-xl !bg-[#005a40] hover:!bg-[#004833] sm:min-w-[160px]"
            >
              Continue
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </form>
      ) : null}

      {step === 2 ? (
        <form
          className="space-y-5"
          onSubmit={(e) => {
            e.preventDefault()
            goNext()
          }}
          noValidate
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Input
                id="reg-email"
                label="Email Address"
                required
                type="email"
                leftIcon={Mail}
                placeholder="Enter your email address"
                value={form.email}
                onChange={(e) => updateField('email', e.target.value)}
                error={
                  errors.email === 'taken'
                    ? 'An account already exists with this email address.'
                    : errors.email
                }
                footNote={
                  !errors.email
                    ? 'We will send appointment confirmations and verification tokens here.'
                    : undefined
                }
              />
              {errors.email === 'taken' ? (
                <p className="mt-1.5 text-xs text-[#6b7280]">
                  <Link
                    to="/login"
                    className="font-semibold text-[#005a40] hover:underline"
                  >
                    Login instead
                  </Link>
                </p>
              ) : null}
            </div>

            <Input
              id="reg-phone"
              label="Contact Number"
              required
              type="tel"
              leftIcon={Phone}
              placeholder="Enter your contact number"
              value={form.contactNumber}
              onChange={(e) => updateField('contactNumber', e.target.value)}
              error={errors.contactNumber}
              footNote={
                !errors.contactNumber
                  ? 'Used for two-factor authentication and clinical appointment reminders.'
                  : undefined
              }
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Input
                id="reg-password"
                label="Password"
                required
                type={showPassword ? 'text' : 'password'}
                leftIcon={Lock}
                placeholder="Create a password"
                value={form.password}
                onChange={(e) => updateField('password', e.target.value)}
                error={errors.password}
                autoComplete="new-password"
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
              {form.password ? <PasswordStrengthBar strength={strength} /> : null}
            </div>

            <div>
              <Input
                id="reg-confirm-password"
                label="Confirm Password"
                required
                type={showConfirm ? 'text' : 'password'}
                leftIcon={Lock}
                placeholder="Confirm your password"
                value={form.confirmPassword}
                onChange={(e) => updateField('confirmPassword', e.target.value)}
                error={errors.confirmPassword}
                autoComplete="new-password"
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
          </div>

          <PasswordRequirements checks={checks} />

          <div className="flex items-start gap-2.5 rounded-xl bg-[#eef2ff] px-4 py-3 text-sm text-[#4b5563]">
            <ShieldCheck
              className="mt-0.5 h-4 w-4 shrink-0 text-[#005a40]"
              strokeWidth={2.2}
            />
            <p>
              Your account information is securely handled and used only to
              provide and manage your BioFit services.
            </p>
          </div>

          <div className="flex flex-col-reverse items-stretch justify-between gap-3 border-t border-[#eef0f4] pt-5 sm:flex-row sm:items-center">
            <p className="text-xs text-[#9ca3af]">
              * All required fields are marked with *
            </p>
            <div className="flex flex-col-reverse gap-3 sm:flex-row">
              <Button
                type="button"
                size="lg"
                className="rounded-xl !bg-[#e8eaf6] !text-[#1a1c29] hover:!bg-[#dce0f2] shadow-none"
                onClick={goBack}
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              <Button
                type="submit"
                size="lg"
                className="rounded-xl !bg-[#005a40] hover:!bg-[#004833] sm:min-w-[160px]"
              >
                Continue
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </form>
      ) : null}

      {step === 3 ? (
        <form className="space-y-5" onSubmit={handleCreate} noValidate>
          <div className="grid gap-4 lg:grid-cols-2">
            <SummaryCard
              title="Personal Details"
              icon={UserRound}
              onEdit={() => !submitting && goToStep(1)}
              disabled={submitting}
              rows={[
                { label: 'First Name', value: form.firstName || '—' },
                { label: 'Last Name', value: form.lastName || '—' },
                {
                  label: 'Date of Birth',
                  value: formatDateDisplay(form.dateOfBirth),
                },
                { label: 'Gender', value: genderLabel(form.gender) },
              ]}
            />

            <SummaryCard
              title="Contact & Account"
              icon={Lock}
              onEdit={() => !submitting && goToStep(2)}
              disabled={submitting}
              rows={[
                { label: 'Email Address', value: form.email || '—' },
                { label: 'Contact Number', value: form.contactNumber || '—' },
                {
                  label: 'Password',
                  value: '••••••••••••',
                  note: 'Your password is securely protected.',
                },
              ]}
            />
          </div>

          <div className="flex items-start gap-3 rounded-xl border border-[#e8ecf1] bg-[#f4f6fb] px-4 py-3.5">
            <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white text-[#005a40] shadow-sm">
              <Info className="h-3.5 w-3.5" strokeWidth={2.2} />
            </span>
            <div className="text-sm text-[#4b5563]">
              <p className="font-semibold text-[#111827]">
                Your BioFit account will be created using the information shown
                above.
              </p>
              <p className="mt-0.5">
                You can update permitted profile details later from your BioFit
                profile settings.
              </p>
            </div>
          </div>

          <div className="space-y-4 rounded-xl border border-[#e8ecf1] p-4 sm:p-5">
            <h3 className="font-display text-sm font-bold text-[#111827]">
              Terms &amp; Privacy
            </h3>

            <Checkbox
              id="agree-terms"
              checked={form.agreeTerms}
              disabled={submitting}
              onChange={(e) => updateField('agreeTerms', e.target.checked)}
              error={errors.agreeTerms}
            >
              I agree to the BioFit{' '}
              <Link
                to="/#terms"
                className="font-semibold text-[#005a40] hover:underline"
              >
                Terms &amp; Conditions
              </Link>{' '}
              and{' '}
              <Link
                to="/#privacy"
                className="font-semibold text-[#005a40] hover:underline"
              >
                Privacy Policy
              </Link>
              <span className="text-error"> *</span>
            </Checkbox>

            <Checkbox
              id="wellness-updates"
              checked={form.wellnessUpdates}
              disabled={submitting}
              onChange={(e) => updateField('wellnessUpdates', e.target.checked)}
            >
              I would like to receive wellness updates, appointment reminders and
              BioFit service notifications.{' '}
              <span className="text-[#9ca3af]">(Optional)</span>
            </Checkbox>

            <div className="flex items-start gap-2.5 rounded-lg bg-[#ecfdf5] px-3 py-2.5 text-xs text-[#065f46]">
              <ShieldCheck
                className="mt-0.5 h-3.5 w-3.5 shrink-0"
                strokeWidth={2.2}
              />
              <p>
                Your personal information is handled securely and used to provide
                your BioFit wellness services. Access to sensitive wellness and
                health information is controlled through role-based permissions.
              </p>
            </div>
          </div>

          {errors.form ? (
            <div
              className="rounded-xl border border-error/20 bg-error-container px-4 py-3 text-sm text-error"
              role="alert"
            >
              {errors.form}
            </div>
          ) : null}

          {submitError ? (
            <div
              className="rounded-xl border border-error/20 bg-error-container px-4 py-3 text-sm text-error"
              role="alert"
            >
              <p className="font-semibold">{submitError}</p>
              {!duplicateEmail ? (
                <p className="mt-1 text-[#6b7280]">
                  Your information has been preserved. Please review the details
                  and try again.
                </p>
              ) : null}
              {duplicateEmail ? (
                <div className="mt-2 flex flex-wrap gap-3">
                  <button
                    type="button"
                    className="font-semibold text-[#005a40] hover:underline"
                    onClick={() => goToStep(2)}
                  >
                    Edit Contact Details
                  </button>
                  <Link
                    to="/login"
                    className="font-semibold text-[#005a40] hover:underline"
                  >
                    Login Instead
                  </Link>
                </div>
              ) : (
                <button
                  type="button"
                  className="mt-2 font-semibold text-[#005a40] hover:underline"
                  onClick={() => setSubmitError('')}
                >
                  Try Again
                </button>
              )}
            </div>
          ) : null}

          <div className="flex flex-col-reverse items-stretch justify-between gap-3 border-t border-[#eef0f4] pt-5 sm:flex-row sm:items-center">
            <p className="text-xs text-[#9ca3af]">
              Please review your information before creating your account.
            </p>
            <div className="flex flex-col-reverse gap-3 sm:flex-row">
              <Button
                type="button"
                size="lg"
                className="rounded-xl !bg-[#e8eaf6] !text-[#1a1c29] hover:!bg-[#dce0f2] shadow-none"
                onClick={goBack}
                disabled={submitting}
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              <Button
                type="submit"
                size="lg"
                className="rounded-xl !bg-[#005a40] hover:!bg-[#004833] sm:min-w-[180px]"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creating Account…
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4" strokeWidth={2.4} />
                    Create Account
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      ) : null}
    </div>
  )
}

function PasswordStrengthBar({ strength }) {
  const colors = {
    Weak: 'bg-error',
    Fair: 'bg-warning',
    Strong: 'bg-[#005a40]',
  }

  return (
    <div className="mt-2 flex items-center gap-2">
      <div className="flex flex-1 gap-1">
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
      <span
        className={[
          'text-[11px] font-bold',
          strength.label === 'Strong'
            ? 'text-[#005a40]'
            : strength.label === 'Fair'
              ? 'text-warning'
              : 'text-error',
        ].join(' ')}
      >
        {strength.label}
      </span>
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
        Password Security Standards
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

function SummaryCard({ title, icon: Icon, rows, onEdit, disabled = false }) {
  return (
    <section className="rounded-xl border border-[#e8ecf1] bg-[#fafbfc] p-4 sm:p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#e6f5f0] text-[#005a40]">
            <Icon className="h-4 w-4" strokeWidth={2.1} />
          </span>
          <h3 className="font-display text-sm font-bold text-[#111827]">
            {title}
          </h3>
        </div>
        <button
          type="button"
          onClick={onEdit}
          disabled={disabled}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#00a67e] transition-colors hover:text-[#005a40] disabled:opacity-50"
        >
          <Pencil className="h-3 w-3" strokeWidth={2.2} />
          Edit
        </button>
      </div>
      <dl className="space-y-3">
        {rows.map((row) => (
          <div key={row.label}>
            <dt className="text-[11px] font-medium text-[#9ca3af]">{row.label}</dt>
            <dd className="mt-0.5 text-sm font-semibold text-[#111827]">
              {row.value}
            </dd>
            {row.note ? (
              <p className="mt-1 flex items-center gap-1.5 text-[11px] text-[#6b7280]">
                <ShieldCheck className="h-3 w-3 text-[#005a40]" strokeWidth={2.2} />
                {row.note}
              </p>
            ) : null}
          </div>
        ))}
      </dl>
    </section>
  )
}

export function TrustBanner() {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#d1fae5] bg-[#ecfdf5] px-4 py-3">
      <div className="flex items-start gap-2.5 text-sm text-[#065f46]">
        <ShieldCheck
          className="mt-0.5 h-4 w-4 shrink-0 text-[#005a40]"
          strokeWidth={2.2}
        />
        <p>
          Your privacy matters. BioFit securely manages clinical records with
          zero commercial data sharing.
        </p>
      </div>
      <span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-bold text-[#005a40] shadow-sm">
        ISO 27001
      </span>
    </div>
  )
}
