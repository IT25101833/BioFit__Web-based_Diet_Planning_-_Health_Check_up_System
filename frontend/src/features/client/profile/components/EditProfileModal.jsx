import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import Button from '../../../../components/ui/Button'
import Input from '../../../../components/ui/Input'
import Modal from '../../../../components/ui/Modal'
import Select from '../../../../components/ui/Select'

const genderOptions = [
  { value: 'Male', label: 'Male' },
  { value: 'Female', label: 'Female' },
  { value: 'Other', label: 'Other' },
  { value: 'Prefer not to say', label: 'Prefer not to say' },
]

function isValidPhone(value) {
  const digits = value.replace(/[^\d]/g, '')
  return digits.length >= 9 && digits.length <= 12
}

function validate(form) {
  const errors = {}
  if (!form.firstName.trim()) errors.firstName = 'First name is required.'
  if (!form.lastName.trim()) errors.lastName = 'Last name is required.'
  if (!form.dateOfBirth) errors.dateOfBirth = 'Date of birth is required.'
  if (!form.gender) errors.gender = 'Please select a gender option.'
  if (!form.email.trim()) errors.email = 'Email address is required.'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
    errors.email = 'Please enter a valid email address.'
  }
  if (!form.contactNumber.trim()) {
    errors.contactNumber = 'Contact number is required.'
  } else if (!isValidPhone(form.contactNumber.trim())) {
    errors.contactNumber = 'Please enter a valid contact number.'
  }
  return errors
}

export default function EditProfileModal({
  open,
  profile,
  onClose,
  onRequestClose,
  onSave,
}) {
  const [form, setForm] = useState(profile)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open) {
      setForm({
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        dateOfBirth: profile.dateOfBirth || '',
        gender: profile.gender || '',
        email: profile.email || '',
        contactNumber: profile.contactNumber || '',
        address: profile.address || '',
        emergencyContact: {
          name: profile.emergencyContact?.name || '',
          relationship: profile.emergencyContact?.relationship || '',
          contactNumber: profile.emergencyContact?.contactNumber || '',
        },
      })
      setErrors({})
      setSaving(false)
    }
  }, [open, profile])

  function updateField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }))
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: '' }))
  }

  function updateEmergency(key, value) {
    setForm((prev) => ({
      ...prev,
      emergencyContact: { ...prev.emergencyContact, [key]: value },
    }))
  }

  function isDirty() {
    return (
      form.firstName !== (profile.firstName || '') ||
      form.lastName !== (profile.lastName || '') ||
      form.dateOfBirth !== (profile.dateOfBirth || '') ||
      form.gender !== (profile.gender || '') ||
      form.email !== (profile.email || '') ||
      form.contactNumber !== (profile.contactNumber || '') ||
      form.address !== (profile.address || '') ||
      form.emergencyContact.name !== (profile.emergencyContact?.name || '') ||
      form.emergencyContact.relationship !==
        (profile.emergencyContact?.relationship || '') ||
      form.emergencyContact.contactNumber !==
        (profile.emergencyContact?.contactNumber || '')
    )
  }

  function handleCloseAttempt() {
    if (saving) return
    if (isDirty()) onRequestClose?.()
    else onClose?.()
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const nextErrors = validate(form)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) return

    setSaving(true)
    try {
      await onSave?.(form)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={handleCloseAttempt}
      title="Edit Profile"
      description="Update your personal and contact information."
      size="lg"
      footer={
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            className="rounded-xl !border-[#cfd8e3] !text-[#374151]"
            onClick={handleCloseAttempt}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="edit-profile-form"
            className="rounded-xl !bg-[#005a40] hover:!bg-[#004833]"
            disabled={saving}
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving…
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </div>
      }
    >
      <form id="edit-profile-form" className="space-y-5" onSubmit={handleSubmit} noValidate>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            id="profile-first-name"
            label="First Name"
            required
            value={form.firstName}
            onChange={(e) => updateField('firstName', e.target.value)}
            error={errors.firstName}
            disabled={saving}
          />
          <Input
            id="profile-last-name"
            label="Last Name"
            required
            value={form.lastName}
            onChange={(e) => updateField('lastName', e.target.value)}
            error={errors.lastName}
            disabled={saving}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            id="profile-dob"
            label="Date of Birth"
            required
            type="date"
            value={form.dateOfBirth}
            onChange={(e) => updateField('dateOfBirth', e.target.value)}
            error={errors.dateOfBirth}
            disabled={saving}
          />
          <Select
            id="profile-gender"
            label="Gender"
            required
            options={genderOptions}
            value={form.gender}
            onChange={(e) => updateField('gender', e.target.value)}
            error={errors.gender}
            disabled={saving}
          />
        </div>

        <Input
          id="profile-email"
          label="Email Address"
          required
          type="email"
          value={form.email}
          onChange={(e) => updateField('email', e.target.value)}
          error={errors.email}
          disabled={saving}
        />

        <Input
          id="profile-phone"
          label="Contact Number"
          required
          value={form.contactNumber}
          onChange={(e) => updateField('contactNumber', e.target.value)}
          error={errors.contactNumber}
          disabled={saving}
        />

        <Input
          id="profile-address"
          label="Address"
          value={form.address}
          onChange={(e) => updateField('address', e.target.value)}
          placeholder="Optional"
          disabled={saving}
        />

        <div className="rounded-2xl border border-[#e8ecf1] bg-[#f7faf9] p-4">
          <p className="mb-3 text-sm font-semibold text-[#111827]">
            Emergency Contact
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              id="profile-ec-name"
              label="Name"
              value={form.emergencyContact.name}
              onChange={(e) => updateEmergency('name', e.target.value)}
              disabled={saving}
            />
            <Input
              id="profile-ec-relationship"
              label="Relationship"
              value={form.emergencyContact.relationship}
              onChange={(e) => updateEmergency('relationship', e.target.value)}
              disabled={saving}
            />
          </div>
          <Input
            id="profile-ec-phone"
            className="mt-4"
            label="Contact Number"
            value={form.emergencyContact.contactNumber}
            onChange={(e) => updateEmergency('contactNumber', e.target.value)}
            disabled={saving}
          />
        </div>
      </form>
    </Modal>
  )
}
