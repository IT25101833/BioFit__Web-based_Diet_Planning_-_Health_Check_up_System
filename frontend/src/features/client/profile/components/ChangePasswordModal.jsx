import { useEffect, useMemo, useState } from 'react'
import { Check, Circle, Eye, EyeOff, Loader2, Lock } from 'lucide-react'
import Button from '../../../../components/ui/Button'
import Input from '../../../../components/ui/Input'
import Modal from '../../../../components/ui/Modal'

function passwordChecks(password) {
  return {
    length: password.length >= 8,
    upper: /[A-Z]/.test(password),
    lower: /[a-z]/.test(password),
    number: /\d/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  }
}

export default function ChangePasswordModal({ open, onClose, onSubmit }) {
  const [currentPassword, setCurrentPassword] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrent, setShowCurrent] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  const checks = useMemo(() => passwordChecks(password), [password])

  useEffect(() => {
    if (!open) return
    setCurrentPassword('')
    setPassword('')
    setConfirmPassword('')
    setErrors({})
    setSaving(false)
  }, [open])

  function validate() {
    const next = {}
    if (!currentPassword) next.currentPassword = 'Current password is required.'
    if (!password) next.password = 'Please enter a new password.'
    else if (!Object.values(checks).every(Boolean)) {
      next.password = 'Your password does not meet the security requirements.'
    }
    if (!confirmPassword) next.confirmPassword = 'Please confirm your password.'
    else if (password !== confirmPassword) {
      next.confirmPassword = 'Passwords do not match.'
    }
    return next
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const nextErrors = validate()
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) return

    setSaving(true)
    try {
      await onSubmit?.({ currentPassword, password })
      onClose?.()
    } finally {
      setSaving(false)
    }
  }

  const requirementItems = [
    { key: 'length', label: 'At least 8 characters' },
    { key: 'upper', label: 'Uppercase' },
    { key: 'lower', label: 'Lowercase' },
    { key: 'number', label: 'Number' },
    { key: 'special', label: 'Special character' },
  ]

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Change Password"
      description="Choose a strong password you do not use elsewhere."
      size="md"
      footer={
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            className="rounded-xl !border-[#cfd8e3] !text-[#374151]"
            onClick={onClose}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="change-password-form"
            className="rounded-xl !bg-[#005a40] hover:!bg-[#004833]"
            disabled={saving}
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Updating…
              </>
            ) : (
              'Update Password'
            )}
          </Button>
        </div>
      }
    >
      <form
        id="change-password-form"
        className="space-y-4"
        onSubmit={handleSubmit}
        noValidate
      >
        <Input
          id="current-password"
          label="Current Password"
          required
          type={showCurrent ? 'text' : 'password'}
          leftIcon={Lock}
          value={currentPassword}
          onChange={(e) => {
            setCurrentPassword(e.target.value)
            if (errors.currentPassword) {
              setErrors((prev) => ({ ...prev, currentPassword: '' }))
            }
          }}
          error={errors.currentPassword}
          disabled={saving}
          rightSlot={
            <button
              type="button"
              onClick={() => setShowCurrent((prev) => !prev)}
              className="rounded-lg p-1.5 text-outline hover:text-on-surface"
              aria-label={showCurrent ? 'Hide password' : 'Show password'}
            >
              {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          }
        />

        <Input
          id="new-password"
          label="New Password"
          required
          type={showPassword ? 'text' : 'password'}
          leftIcon={Lock}
          value={password}
          onChange={(e) => {
            setPassword(e.target.value)
            if (errors.password) setErrors((prev) => ({ ...prev, password: '' }))
          }}
          error={errors.password}
          disabled={saving}
          rightSlot={
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="rounded-lg p-1.5 text-outline hover:text-on-surface"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          }
        />

        <div className="rounded-xl border border-[#e8ecf1] bg-[#f4f6fb] px-4 py-3">
          <ul className="grid gap-1.5 sm:grid-cols-2">
            {requirementItems.map((item) => {
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

        <Input
          id="confirm-new-password"
          label="Confirm New Password"
          required
          type={showConfirm ? 'text' : 'password'}
          leftIcon={Lock}
          value={confirmPassword}
          onChange={(e) => {
            setConfirmPassword(e.target.value)
            if (errors.confirmPassword) {
              setErrors((prev) => ({ ...prev, confirmPassword: '' }))
            }
          }}
          error={errors.confirmPassword}
          disabled={saving}
          rightSlot={
            <button
              type="button"
              onClick={() => setShowConfirm((prev) => !prev)}
              className="rounded-lg p-1.5 text-outline hover:text-on-surface"
              aria-label={showConfirm ? 'Hide password' : 'Show password'}
            >
              {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          }
        />
      </form>
    </Modal>
  )
}
