import { useEffect, useState } from 'react'
import Avatar from '../../../components/ui/Avatar'
import Button from '../../../components/ui/Button'
import ErrorState from '../../../components/ui/ErrorState'
import Input from '../../../components/ui/Input'
import LoadingSkeleton from '../../../components/ui/LoadingSkeleton'
import PageHeader from '../../../components/ui/PageHeader'
import SectionCard from '../../../components/ui/SectionCard'
import Toast from '../../../components/ui/Toast'
import {
  fetchManagerProfile,
  updateManagerProfile,
} from '../dashboard/data/managerDashboardData'

export default function ManagerProfile() {
  const [profile, setProfile] = useState(null)
  const [form, setForm] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState('')

  async function load() {
    setLoading(true)
    setError('')
    try {
      const data = await fetchManagerProfile()
      setProfile(data)
      setForm(data)
    } catch {
      setError('We couldn’t load your profile.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  async function handleSave(event) {
    event.preventDefault()
    setSaving(true)
    try {
      const next = await updateManagerProfile({
        firstName: form.firstName,
        lastName: form.lastName,
        contactNumber: form.contactNumber,
        email: form.email,
      })
      setProfile(next)
      setForm(next)
      setEditing(false)
      setToast('Profile updated successfully.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <LoadingSkeleton rows={3} />
  if (error || !profile) {
    return <ErrorState title="We couldn’t load your profile." onRetry={load} />
  }

  const fullName = `${profile.firstName} ${profile.lastName}`

  return (
    <div>
      <PageHeader
        title="My Profile"
        description="Manage your Wellness Centre Manager account details."
        actions={
          !editing ? (
            <Button
              onClick={() => setEditing(true)}
              className="!bg-[#005a40] !text-white hover:!bg-[#004833]"
            >
              Edit Profile
            </Button>
          ) : null
        }
      />

      <SectionCard>
        <div className="mb-6 flex items-center gap-4">
          <Avatar name={fullName} size="lg" />
          <div>
            <h2 className="font-display text-xl font-bold text-[#111827]">{fullName}</h2>
            <p className="text-sm text-[#005a40]">{profile.role}</p>
            <p className="text-[12px] text-[#6b7280]">{profile.centre}</p>
          </div>
        </div>

        {editing ? (
          <form onSubmit={handleSave} className="grid gap-4 sm:grid-cols-2">
            <Input
              label="First name"
              value={form.firstName}
              onChange={(e) => setForm((prev) => ({ ...prev, firstName: e.target.value }))}
            />
            <Input
              label="Last name"
              value={form.lastName}
              onChange={(e) => setForm((prev) => ({ ...prev, lastName: e.target.value }))}
            />
            <Input
              label="Email"
              type="email"
              value={form.email}
              onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
            />
            <Input
              label="Contact number"
              value={form.contactNumber}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, contactNumber: e.target.value }))
              }
            />
            <div className="flex flex-wrap gap-2.5 sm:col-span-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setForm(profile)
                  setEditing(false)
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={saving}
                className="!bg-[#005a40] !text-white hover:!bg-[#004833]"
              >
                {saving ? 'Saving…' : 'Save Changes'}
              </Button>
            </div>
          </form>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Email" value={profile.email} />
            <Field label="Contact number" value={profile.contactNumber} />
            <Field label="Role" value={profile.role} />
            <Field label="Member since" value={profile.memberSince} />
          </div>
        )}
      </SectionCard>

      <Toast open={Boolean(toast)} message={toast} onClose={() => setToast('')} />
    </div>
  )
}

function Field({ label, value }) {
  return (
    <div className="rounded-2xl border border-[#eef2f0] bg-[#f8faf9] px-4 py-3">
      <p className="text-[12px] font-medium text-[#8b93a1]">{label}</p>
      <p className="mt-1 text-sm font-semibold text-[#111827]">{value}</p>
    </div>
  )
}
